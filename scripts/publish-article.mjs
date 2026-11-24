// Publish an approved Observatory draft from Notion as a static article page, on this machine.
//
//   node scripts/publish-article.mjs <notion-draft-page-id>
//   node scripts/publish-article.mjs --find "<words in the title>"
//
// Writes future-observatory/blog/<slug>/index.html from templates/observatory-article.html,
// rebuilds the blog list page and the blog section of the Future Observatory room, and updates
// sitemap.xml, llms.txt and llms-full.txt. The work is in scripts/observatory/article.mjs, shared
// with api/publish-article.js. Reads Notion only; never writes back, commits or pushes.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
    DATABASE_ID, TITLE_PROP, STATUS_PROP, TYPE_PROP, HERO_PROP, BLOG_DIR, ROOM_PAGE,
    StopError, notionClient, plain, propText, loadDraft, fetchHero, buildFiles, sydneyToday,
} from './observatory/article.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = rel => path.join(ROOT, rel);

function fail(msg) {
    console.error(msg);
    process.exit(1);
}

async function main() {
    if (!process.env.NOTION_TOKEN) {
        fail('NOTION_TOKEN is not set. Run:  read -s NOTION_TOKEN && export NOTION_TOKEN');
    }
    const args = process.argv.slice(2);
    if (!args.length) fail('Usage: node scripts/publish-article.mjs <notion-draft-page-id>\n       node scripts/publish-article.mjs --find "<words in the title>"');
    const client = notionClient(process.env.NOTION_TOKEN);

    const db = await client.request('GET', `databases/${DATABASE_ID}`);
    console.log(`Review queue "${plain(db.title)}" properties:`);
    for (const [name, p] of Object.entries(db.properties)) console.log(`  - ${name} (${p.type})`);
    for (const name of [TITLE_PROP, STATUS_PROP, TYPE_PROP, HERO_PROP]) {
        if (!db.properties[name]) fail(`The review queue has no "${name}" property; update the constants in scripts/observatory/article.mjs.`);
    }

    if (args[0] === '--find') {
        const words = args.slice(1).join(' ');
        const res = await client.request('POST', `databases/${DATABASE_ID}/query`, {
            filter: { property: TITLE_PROP, title: { contains: words } },
        });
        if (!res.results.length) fail(`No draft title contains "${words}".`);
        for (const pg of res.results) {
            console.log(`${pg.id}  [${propText(pg.properties[STATUS_PROP])}]  ${propText(pg.properties[TITLE_PROP])}`);
        }
        return;
    }

    const draft = await loadDraft(client, args[0]);
    console.log('\nBlock types in the draft:', draft.c.blockTypes);
    const hero = await fetchHero(draft);
    const out = await buildFiles({
        draft,
        hero,
        today: sydneyToday(),
        read: async p => (fs.existsSync(file(p)) ? fs.readFileSync(file(p), 'utf8') : null),
        list: async d => (fs.existsSync(file(d))
            ? fs.readdirSync(file(d), { withFileTypes: true }).map(e => ({ name: e.name, type: e.isDirectory() ? 'dir' : 'file' }))
            : []),
    });
    for (const [p, content] of Object.entries(out.writes)) {
        fs.mkdirSync(path.dirname(file(p)), { recursive: true });
        fs.writeFileSync(file(p), content);
    }
    for (const p of out.deletes) fs.rmSync(file(p));

    for (const n of out.notes) console.log(`\nNote: ${n}`);
    console.log(`
${out.updated ? 'Updated' : 'Published'}: ${draft.title}
  slug:          ${out.slug}
  datePublished: ${out.datePublished}
  dateModified:  ${out.today}
  files written: ${Object.keys(out.writes).join('\n                 ')}
${out.deletes.length ? `  files removed: ${out.deletes.join('\n                 ')}\n` : ''}  (${BLOG_DIR}/index.html lists ${out.count} article${out.count === 1 ? '' : 's'}; ${ROOM_PAGE} shows the ${Math.min(out.count, 4)} latest)
  live URL once merged and deployed: ${out.url}
Nothing was written to Notion, committed or pushed.`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    main().catch(e => fail(e instanceof StopError ? e.message : e.stack));
}
