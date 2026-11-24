// node scripts/observatory/article.test.mjs
// Checks the shared core with fixture blocks, a fake Notion client and in-memory site files.
// No network, nothing written.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { convert, loadDraft, buildFiles, slugify, StopError, DATABASE_ID } from './article.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const text = (s, extra = {}) => ({ type: 'text', plain_text: s, href: extra.href ?? null, annotations: { bold: false, italic: false, code: false, strikethrough: false, ...extra.annotations } });
const block = (type, rich, more = {}) => ({ id: `${type}-${Math.random()}`, type, has_children: false, [type]: { rich_text: rich }, ...more });
const ANSWER = 'Agentic AI is AI that runs the process instead of just answering the question. It is given a role, the context it needs and a connection to tools and people, so it carries a whole process.';

const blocks = [
    block('paragraph', [text('Proposed URL: https://www.themxm.ai/future-observatory/blog/what-is-a-test')]),
    block('code', [text('---\nauthor: Marissa Kos\nhero_image: "A marble hall"\n---')]),
    block('paragraph', [text(ANSWER)]),
    block('heading_2', [text('How is it different?')]),
    block('paragraph', [text('See '), text('aRTIFICIAL iNGENIOUS', { href: 'https://www.themxm.ai/artificial-ingenious' }), text(' for '), text('coaching', { annotations: { bold: true } }), text('.')]),
    block('bulleted_list_item', [text('One <b>point</b>')]),
    block('bulleted_list_item', [text('Two')]),
    block('heading_2', [text('Frequently asked questions')]),
    block('heading_3', [text('What is a Neural Engine?')]),
    block('paragraph', [text('A custom multi-agent system for one business.')]),
    block('heading_3', [text('Does it replace people?')]),
    block('paragraph', [text('No. People steer it.')]),
];

// convert: structure, escaping, links
const c = convert(blocks);
assert.deepEqual(c.unhandled, []);
assert.equal(c.answer.text, ANSWER);
assert.equal(c.front.hero_image, 'A marble hall');
assert.match(c.body, /<h2 class="section-title" style="text-transform: uppercase">How is it different\?<\/h2>/);
assert.match(c.body, /<a href="https:\/\/www\.themxm\.ai\/artificial-ingenious" class="room-description-link"/);
assert.match(c.body, /<strong>coaching<\/strong>/);
assert.match(c.body, /<li>One &lt;b&gt;point&lt;\/b&gt;<\/li>/, 'text is escaped');
assert.equal(c.faqItems.length, 2);
assert.equal(c.faqItems[1].text, 'No. People steer it.');

// convert: never drops content, never lets an unsafe or private link through
const bad = convert([
    block('paragraph', [text(ANSWER)]),
    { id: 'img', type: 'image', has_children: false, image: {} },
    block('paragraph', [text('x', { href: 'javascript:alert(1)' })]),
    block('paragraph', [text('y', { href: '/41cb20aeb04881c4b6ebd90fed94bedb' })]),
    block('paragraph', [text('z', { href: 'https://www.notion.so/abc' })]),
]);
assert.equal(bad.unhandled.length, 4, bad.unhandled.join('; '));
assert.ok(bad.unhandled.some(u => u.startsWith('image')));
assert.ok(bad.unhandled.some(u => u.startsWith('javascript: link')));
assert.equal(bad.unhandled.filter(u => u.startsWith('link to a Notion page')).length, 2);

assert.equal(slugify("What's next? Agentic AI, explained"), 'whats-next-agentic-ai-explained');

// loadDraft: refuses anything not approved, not an article, or with unhandled blocks
const props = (status, type) => ({
    Title: { type: 'title', title: [text('What is a test?')] },
    Status: { type: 'select', select: status && { name: status } },
    Type: { type: 'select', select: { name: type } },
    'Hero image': { type: 'files', files: [] },
});
const fakeClient = (status, type = 'Article', body = blocks) => ({
    request: async () => ({ id: 'p1', parent: { database_id: DATABASE_ID }, properties: props(status, type) }),
    children: async () => body,
});
await assert.rejects(loadDraft(fakeClient('Pending'), 'p1'), e => e instanceof StopError && /not "Approved"/.test(e.message));
await assert.rejects(loadDraft(fakeClient('Approved', 'Substack'), 'p1'), e => e instanceof StopError && /not "Article"/.test(e.message));
await assert.rejects(loadDraft(fakeClient('Approved', 'Article', [blocks[2], { id: 'img', type: 'image', has_children: false, image: {} }]), 'p1'), /not handled/);
const draft = await loadDraft(fakeClient('Approved'), 'p1');
assert.equal(draft.slug, 'what-is-a-test');

// buildFiles: every file the article touches, from in-memory site files
const disk = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const files = {
    'templates/observatory-article.html': disk('templates/observatory-article.html'),
    'future-observatory/blog/index.html': disk('future-observatory/blog/index.html'),
    'pages/future-observatory.html': disk('pages/future-observatory.html'),
    'sitemap.xml': disk('sitemap.xml'),
    'llms.txt': disk('llms.txt'),
    'llms-full.txt': disk('llms-full.txt'),
};
const read = async p => files[p] ?? null;
const list = async d => (d === 'assets/images/observatory' ? [{ name: 'what-is-a-test-0123abcd.webp', type: 'file' }] : []);
const URL_ = 'https://www.themxm.ai/future-observatory/blog/what-is-a-test/';

const out = await buildFiles({ draft, hero: null, read, list, today: '2026-12-01' });
const page = out.writes['future-observatory/blog/what-is-a-test/index.html'];
assert.equal((page.match(/<h1/g) ?? []).length, 1);
assert.ok(!page.includes('{{'), 'every placeholder filled');
const ld = [...page.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
assert.deepEqual(ld.map(o => o['@type']), ['Article', 'Person', 'FAQPage']);
assert.equal(ld[0].mainEntityOfPage['@id'], URL_);
assert.equal(ld[0].datePublished, '2026-12-01');
assert.equal(ld[0].image, undefined, 'no hero, no schema image');
assert.equal(ld[2].mainEntity[0].acceptedAnswer.text, 'A custom multi-agent system for one business.');
assert.match(page, new RegExp(`<link rel="canonical" href="${URL_}"`));
assert.ok(!page.includes('og:image'), 'no hero, no og:image');
assert.match(out.writes['sitemap.xml'], new RegExp(`<loc>${URL_}</loc>\\s*<lastmod>2026-12-01</lastmod>`));
assert.match(out.writes['llms.txt'], new RegExp(`- \\[What is a test\\?\\]\\(${URL_}\\): Agentic AI is AI`));
assert.match(out.writes['llms-full.txt'], new RegExp(`### What is a test\\?\\n\\nSource: ${URL_}\\n\\nAgentic AI`));
assert.match(out.writes['future-observatory/blog/index.html'], new RegExp(`<a href="${URL_}"`));
assert.match(out.writes['pages/future-observatory.html'], new RegExp(`<h3 style="text-align: center; margin: 0 0 0.75rem"><a href="${URL_}"`));
assert.deepEqual(out.deletes, ['assets/images/observatory/what-is-a-test-0123abcd.webp'], 'old hero removed');
assert.equal(out.updated, false);

// buildFiles again with the page already there: datePublished kept, dateModified moves, same entries replaced
const again = await buildFiles({ draft, hero: null, read: async p => out.writes[p] ?? files[p] ?? null, list, today: '2026-12-09' });
const ld2 = JSON.parse(again.writes['future-observatory/blog/what-is-a-test/index.html'].match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
assert.equal(ld2.datePublished, '2026-12-01');
assert.equal(ld2.dateModified, '2026-12-09');
assert.equal(again.updated, true);
assert.equal((again.writes['llms.txt'].match(/what-is-a-test/g) ?? []).length, 1, 'llms.txt entry replaced, not duplicated');
assert.equal((again.writes['llms-full.txt'].match(/Source: .*what-is-a-test/g) ?? []).length, 1, 'llms-full.txt block replaced');
assert.equal((again.writes['sitemap.xml'].match(/what-is-a-test/g) ?? []).length, 1, 'sitemap entry replaced');

// a hero image goes into the page, its meta tags and the schema
const hero = { bytes: Buffer.from('img'), path: 'assets/images/observatory/what-is-a-test-deadbeef.webp', alt: 'A marble hall' };
const withHero = await buildFiles({ draft, hero, read, list, today: '2026-12-01' });
const heroPage = withHero.writes['future-observatory/blog/what-is-a-test/index.html'];
assert.match(heroPage, /<img src="\/assets\/images\/observatory\/what-is-a-test-deadbeef\.webp" alt="A marble hall"/);
assert.match(heroPage, /<meta property="og:image" content="https:\/\/www\.themxm\.ai\/assets\/images\/observatory\/what-is-a-test-deadbeef\.webp"/);
assert.equal(withHero.writes[hero.path], hero.bytes);

console.log('article core: all checks passed');
