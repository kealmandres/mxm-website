// Publish an approved Observatory draft from Notion as a static article page.
//
//   node scripts/publish-article.mjs <notion-draft-page-id>
//   node scripts/publish-article.mjs --find "<words in the title>"
//
// Follows docs/blog-section-spec.md. Writes future-observatory/blog/<slug>/index.html from
// templates/observatory-article.html, rebuilds the blog list page, and updates sitemap.xml,
// llms.txt and llms-full.txt. Reads Notion only; never writes back, commits or pushes.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const DATABASE_ID = 'c1517c91325c4e769dfbee6dfac19d94'; // Observatory review queue
const TITLE_PROP = 'Title';
const STATUS_PROP = 'Status';
const TYPE_PROP = 'Type';
const NOTION_VERSION = '2022-06-28';

const SITE = 'https://www.themxm.ai';
const BLOG_DIR = 'future-observatory/blog';
const BLOG_URL = `${SITE}/${BLOG_DIR}/`;
// ponytail: one shared hero until drafts carry a real image file; the draft's hero_image is a description only
const HERO_SRC = '/assets/images/rooms/observatory-2.webp';
const HERO_ALT = 'The Future Observatory: a domed hall of lit columns beneath a ceiling of star charts.';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = rel => path.join(ROOT, rel);

const LLMS_HEADER = `# The MaCHiNE MaiSON

> MxM (The MaCHiNE MaiSON) is Australia's first AI agency. Founded in Sydney in 2021 by Marissa Kos, MxM turns AI from a threat into a team's greatest asset: we make people AI-fluent, then build the agents they run on.
`;

// ---------- Notion ----------

async function notion(method, endpoint, body) {
    const res = await fetch(`https://api.notion.com/v1/${endpoint}`, {
        method,
        headers: {
            Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
            'Notion-Version': NOTION_VERSION,
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) fail(`Notion ${method} ${endpoint} failed: ${res.status} ${data.code}: ${data.message}`);
    return data;
}

async function children(blockId) {
    const out = [];
    let cursor;
    do {
        const q = `blocks/${blockId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`;
        const data = await notion('GET', q);
        out.push(...data.results);
        cursor = data.has_more ? data.next_cursor : null;
    } while (cursor);
    for (const b of out) if (b.has_children) b.children = await children(b.id);
    return out;
}

const plain = rt => rt.map(t => t.plain_text).join('');
const propText = prop => prop?.type === 'title' ? plain(prop.title)
    : prop?.type === 'select' ? prop.select?.name ?? ''
    : prop?.type === 'status' ? prop.status?.name ?? ''
    : '';

// ---------- conversion ----------

export const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function slugify(title) {
    return title.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/['’]/g, '')
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

const isFaqHeading = text => /^(frequently asked questions|faqs?)$/i.test(text.trim());
// Notion page links arrive as relative paths ("/<page id>") or notion.so/notion.site URLs
const isPrivateLink = href => href.startsWith('/') || /(^|\.)notion\.(so|com|site)$/i.test(new URL(href).hostname);

// Turns the draft's blocks into the article parts. Never drops content: anything it cannot
// place is collected in `unhandled`, and the caller stops if that list is not empty.
export function convert(blocks) {
    const unhandled = [];
    const where = b => `${b.type} (block ${b.id})`;

    const rich = rt => rt.map(t => {
        if (t.type === 'equation') { unhandled.push(`inline equation "${t.plain_text}"`); return ''; }
        let s = esc(t.plain_text);
        const a = t.annotations;
        if (a.code) s = `<code>${s}</code>`;
        if (a.bold) s = `<strong>${s}</strong>`;
        if (a.italic) s = `<em>${s}</em>`;
        if (a.strikethrough) s = `<s>${s}</s>`;
        if (t.href) {
            if (isPrivateLink(t.href)) unhandled.push(`link to a Notion page "${t.plain_text}"`);
            else s = `<a href="${esc(t.href)}">${s}</a>`;
        }
        return s;
    }).join('');

    // Renders a run of body blocks (paragraphs, lists, quotes, H3s) as HTML.
    function render(list, indent) {
        let html = '';
        for (let i = 0; i < list.length; i++) {
            const b = list[i];
            const v = b[b.type];
            if ((b.type === 'bulleted_list_item' || b.type === 'numbered_list_item')) {
                const tag = b.type === 'bulleted_list_item' ? 'ul' : 'ol';
                html += `${indent}<${tag}>\n`;
                for (; i < list.length && list[i].type === b.type; i++) {
                    const item = list[i];
                    const nested = item.children ? `\n${render(item.children, indent + '    ')}${indent}  ` : '';
                    html += `${indent}  <li>${rich(item[item.type].rich_text)}${nested}</li>\n`;
                }
                i--;
                html += `${indent}</${tag}>\n`;
                continue;
            }
            if (b.has_children) { unhandled.push(`${where(b)} with nested blocks`); continue; }
            if (b.type === 'paragraph') { if (v.rich_text.length) html += `${indent}<p>${rich(v.rich_text)}</p>\n`; }
            else if (b.type === 'quote') html += `${indent}<blockquote><p>${rich(v.rich_text)}</p></blockquote>\n`;
            else if (b.type === 'heading_3' && !v.is_toggleable) html += `${indent}<h3>${rich(v.rich_text)}</h3>\n`;
            else unhandled.push(where(b));
        }
        return html;
    }

    let proposedUrl = null, front = null, answer = null;
    const sections = [];   // { heading, blocks }
    const faq = [];        // { question, blocks }
    let inFaq = false;

    for (const b of blocks) {
        const v = b[b.type];
        const text = v?.rich_text ? plain(v.rich_text) : '';
        if (b.type === 'paragraph' && !text && !b.has_children) continue;

        if (answer === null) {
            if (b.type === 'paragraph' && /^Proposed URL:/.test(text)) { proposedUrl = text.replace(/^Proposed URL:\s*/, '').trim(); continue; }
            if (b.type === 'code' && /^---/.test(text) && !front) { front = parseFrontMatter(text); continue; }
            if (b.type === 'paragraph' && !b.has_children) { answer = { html: rich(v.rich_text), text }; continue; }
            unhandled.push(`${where(b)} before the direct answer paragraph`);
            continue;
        }

        if ((b.type === 'heading_1' || b.type === 'heading_2') && !v.is_toggleable) {
            inFaq = isFaqHeading(text);
            if (!inFaq) sections.push({ heading: rich(v.rich_text), blocks: [] });
            continue;
        }
        if (b.type === 'toggle') { faq.push({ question: text, blocks: b.children ?? [] }); continue; }
        if (inFaq) {
            if (b.type === 'heading_3' && !v.is_toggleable) faq.push({ question: text, blocks: [] });
            else if (faq.length) faq[faq.length - 1].blocks.push(b);
            else unhandled.push(`${where(b)} in the FAQ before any question`);
            continue;
        }
        if (!sections.length) sections.push({ heading: null, blocks: [] });
        sections[sections.length - 1].blocks.push(b);
    }

    const body = sections.map(s => [
        '        <section class="page-section">',
        '          <div class="container">',
        s.heading ? `            <h2 class="section-title">${s.heading}</h2>` : null,
        render(s.blocks, '            ').trimEnd(),
        '          </div>',
        '        </section>',
    ].filter(l => l !== null).join('\n')).join('\n\n');

    const faqItems = faq.map(f => ({
        question: f.question,
        html: render(f.blocks, '                  ').trimEnd(),
        text: f.blocks.map(b => {
            const v = b[b.type];
            return [v?.rich_text ? plain(v.rich_text) : '', ...(b.children ?? []).map(c => plain(c[c.type]?.rich_text ?? []))].filter(Boolean).join(' ');
        }).filter(Boolean).join(' '),
    }));
    const faqHtml = faqItems.map(f => [
        '              <div class="faq-item">',
        '                <div class="faq-question">',
        `                  <h3>${esc(f.question)}</h3>`,
        '                  <div class="accordion-icon">+</div>',
        '                </div>',
        '                <div class="faq-answer">',
        f.html,
        '                </div>',
        '              </div>',
    ].join('\n')).join('\n');

    return { unhandled, proposedUrl, front, answer, body, faqItems, faqHtml, blockTypes: countTypes(blocks) };
}

function countTypes(blocks, counts = {}) {
    for (const b of blocks) {
        counts[b.type] = (counts[b.type] ?? 0) + 1;
        if (b.children) countTypes(b.children, counts);
    }
    return counts;
}

function parseFrontMatter(text) {
    const out = {};
    for (const line of text.split('\n')) {
        const m = line.match(/^([A-Za-z_]+):\s*(.*)$/);
        if (m) out[m[1]] = m[2].replace(/^"(.*)"$/, '$1');
    }
    return out;
}

// ---------- page and site files ----------

const jsonLd = obj => JSON.stringify(obj, null, 2).replace(/</g, '\\u003c').replace(/^/gm, '      ');
const longDate = d => new Date(`${d}T00:00:00Z`).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const firstSentence = s => (s.match(/^.*?[.!?](?=\s|$)/) ?? [s])[0];

function readArticle(html) {
    const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
        .map(m => JSON.parse(m[1])).find(o => o['@type'] === 'Article');
    const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
    return ld && { title: ld.headline, url: ld.mainEntityOfPage['@id'], datePublished: ld.datePublished, description };
}

function rebuildIndex() {
    const dir = file(BLOG_DIR);
    const articles = fs.readdirSync(dir, { withFileTypes: true })
        .filter(e => e.isDirectory() && fs.existsSync(path.join(dir, e.name, 'index.html')))
        .map(e => readArticle(fs.readFileSync(path.join(dir, e.name, 'index.html'), 'utf8')))
        .filter(Boolean)
        .sort((a, b) => b.datePublished.localeCompare(a.datePublished) || a.title.localeCompare(b.title));
    // the description comes back out of the meta tag already HTML-escaped; the JSON-LD headline does not
    const list = articles.map(a => [
        '          <article>',
        `            <h2><a href="${a.url}">${esc(a.title)}</a></h2>`,
        `            <p><time datetime="${a.datePublished}">${longDate(a.datePublished)}</time></p>`,
        `            <p>${a.description}</p>`,
        '          </article>',
    ].join('\n')).join('\n');
    const indexPath = path.join(dir, 'index.html');
    const html = fs.readFileSync(indexPath, 'utf8').replace(
        /(<!-- articles:start[^>]*-->\n)[\s\S]*?(\s*<!-- articles:end -->)/,
        `$1${list || '          <p>No articles have been published yet.</p>'}$2`);
    fs.writeFileSync(indexPath, html);
    return articles.length;
}

function upsertSitemap(loc, lastmod) {
    const p = file('sitemap.xml');
    let xml = fs.readFileSync(p, 'utf8');
    const block = `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>\n`;
    const existing = new RegExp(`  <url>\\s*<loc>${loc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>[\\s\\S]*?</url>\\n`);
    xml = existing.test(xml) ? xml.replace(existing, block) : xml.replace('</urlset>', `${block}</urlset>`);
    fs.writeFileSync(p, xml);
}

// Puts `entry` in the "## Future Observatory" section of an llms file, replacing the old entry for `url`.
function upsertLlms(name, url, entry, findOld) {
    const p = file(name);
    let text = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : `${LLMS_HEADER}\n## Future Observatory\n`;
    if (!text.includes('\n## Future Observatory\n')) text = `${text.trimEnd()}\n\n## Future Observatory\n`;
    const old = findOld(text, url);
    if (old) {
        text = text.slice(0, old.start) + entry + text.slice(old.end);
    } else {
        const start = text.indexOf('\n## Future Observatory\n') + 1;
        const next = text.indexOf('\n## ', start + 1);
        const end = next === -1 ? text.length : next + 1;
        const section = text.slice(start, end).trimEnd();
        const sep = entry.startsWith('- ') ? '\n' : '\n\n';
        text = `${text.slice(0, start)}${section}${sep}${entry}${next === -1 ? '' : '\n'}${text.slice(end)}`;
    }
    fs.writeFileSync(p, text.trimEnd() + '\n');
}

function findLlmsLine(text, url) {
    const i = text.indexOf(`](${url})`);
    if (i === -1) return null;
    const start = text.lastIndexOf('\n', i) + 1;
    const end = text.indexOf('\n', i);
    return { start, end: end === -1 ? text.length : end + 1 };
}

function findLlmsFullBlock(text, url) {
    const i = text.indexOf(`\nSource: ${url}\n`);
    if (i === -1) return null;
    const start = text.lastIndexOf('\n### ', i) + 1;
    const next = text.slice(i + 1).search(/\n#{2,3} /);
    return { start, end: next === -1 ? text.length : i + 1 + next + 1 };
}

// Plain text of the article for llms-full.txt, from the rendered HTML.
function articleText(html) {
    return html
        .replace(/<h2[^>]*>/g, '#### ').replace(/<h3[^>]*>/g, '##### ').replace(/<li>/g, '- ')
        .replace(/<\/(h2|h3|p|li|blockquote)>/g, '\n').replace(/<[^>]+>/g, '')
        .replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
        .split('\n').map(l => l.trim()).filter(Boolean).join('\n\n');
}

// ---------- main ----------

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

    const db = await notion('GET', `databases/${DATABASE_ID}`);
    console.log(`Review queue "${plain(db.title)}" properties:`);
    for (const [name, p] of Object.entries(db.properties)) console.log(`  - ${name} (${p.type})`);
    for (const name of [TITLE_PROP, STATUS_PROP, TYPE_PROP]) {
        if (!db.properties[name]) fail(`The review queue has no "${name}" property; update the constants at the top of this script.`);
    }

    if (args[0] === '--find') {
        const words = args.slice(1).join(' ');
        const res = await notion('POST', `databases/${DATABASE_ID}/query`, {
            filter: { property: TITLE_PROP, title: { contains: words } },
        });
        if (!res.results.length) fail(`No draft title contains "${words}".`);
        for (const pg of res.results) {
            console.log(`${pg.id}  [${propText(pg.properties[STATUS_PROP])}]  ${propText(pg.properties[TITLE_PROP])}`);
        }
        return;
    }

    const page = await notion('GET', `pages/${args[0]}`);
    if (page.parent?.database_id?.replace(/-/g, '') !== DATABASE_ID) fail('Refusing: that page is not in the Observatory review queue.');
    const title = propText(page.properties[TITLE_PROP]).trim();
    const status = propText(page.properties[STATUS_PROP]);
    const type = propText(page.properties[TYPE_PROP]);
    if (status !== 'Approved') fail(`Refusing: "${title}" has ${STATUS_PROP} "${status || 'empty'}", not "Approved".`);
    if (type !== 'Article') fail(`Refusing: "${title}" has ${TYPE_PROP} "${type || 'empty'}", not "Article"; only articles go on the blog.`);

    const blocks = await children(page.id);
    const c = convert(blocks);
    console.log('\nBlock types in the draft:', c.blockTypes);
    if (c.unhandled.length) fail(`\nStopped: these blocks are not handled, so nothing was written:\n${c.unhandled.map(u => `  - ${u}`).join('\n')}`);
    if (!c.answer) fail('Stopped: the draft has no direct answer paragraph.');
    const words = c.answer.text.split(/\s+/).filter(Boolean).length;
    if (words < 20 || words > 80) fail(`Stopped: the direct answer is ${words} words; the spec asks for 20 to 80.`);
    if (!c.faqItems.length) fail('Stopped: the draft has no FAQ (H3 questions under a "Frequently asked questions" heading, or toggles).');
    if (c.faqItems.some(f => !f.text)) fail('Stopped: an FAQ question has no answer.');
    if (c.front?.author && c.front.author !== 'Marissa Kos') fail(`Stopped: the draft's author is "${c.front.author}"; the byline and Person schema are for Marissa Kos.`);

    const slug = slugify(title);
    if (!slug) fail('Stopped: the title gives an empty slug.');
    const url = `${BLOG_URL}${slug}/`;
    const pagePath = `${BLOG_DIR}/${slug}/index.html`;
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Sydney' });
    const existing = fs.existsSync(file(pagePath)) ? readArticle(fs.readFileSync(file(pagePath), 'utf8')) : null;
    const datePublished = existing?.datePublished ?? today;
    const description = esc(firstSentence(c.answer.text));

    const article = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        datePublished,
        dateModified: today,
        author: { '@type': 'Person', name: 'Marissa Kos', url: `${SITE}/blonde-bot-lair` },
        publisher: { '@type': 'Organization', name: 'The MaCHiNE MaiSON', url: `${SITE}/` },
        image: `${SITE}${HERO_SRC}`,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    };
    const faqPage = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: c.faqItems.map(f => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: f.text },
        })),
    };
    const values = {
        TITLE: esc(title), DESCRIPTION: description, URL: url,
        HERO_SRC, HERO_URL: `${SITE}${HERO_SRC}`, HERO_ALT: esc(HERO_ALT),
        DATE_PUBLISHED: datePublished, DATE_MODIFIED: today,
        DATE_PUBLISHED_TEXT: longDate(datePublished), DATE_MODIFIED_TEXT: longDate(today),
        ANSWER: c.answer.html, BODY: c.body, FAQ: c.faqHtml,
        ARTICLE_JSONLD: jsonLd(article), FAQ_JSONLD: jsonLd(faqPage),
    };
    const template = fs.readFileSync(file('templates/observatory-article.html'), 'utf8');
    const html = template.replace(/{{([A-Z_]+)}}/g, (m, k) => {
        if (!(k in values)) fail(`Template placeholder ${m} has no value.`);
        return values[k];
    });

    fs.mkdirSync(path.dirname(file(pagePath)), { recursive: true });
    fs.writeFileSync(file(pagePath), html);
    const count = rebuildIndex();
    upsertSitemap(url, today);
    upsertSitemap(BLOG_URL, today);
    const summary = firstSentence(c.answer.text);
    upsertLlms('llms.txt', url, `- [${title}](${url}): ${summary}\n`, findLlmsLine);
    const fullText = articleText(`<p>${c.answer.html}</p>\n${c.body}\n<h2>Frequently asked questions</h2>\n${c.faqItems.map(f => `<h3>${esc(f.question)}</h3>\n${f.html}`).join('\n')}`);
    upsertLlms('llms-full.txt', url, `### ${title}\n\nSource: ${url}\n\n${fullText}\n\n`, findLlmsFullBlock);

    if (c.proposedUrl && c.proposedUrl.replace(/\/?$/, '/') !== url) {
        console.log(`\nNote: the draft's "Proposed URL" (${c.proposedUrl}) differs from the URL built from the title.`);
    }
    if (c.front?.hero_image) console.log('\nNote: the draft\'s hero_image is a description, not an image file; the page uses the shared Observatory hero.');
    console.log(`
${existing ? 'Updated' : 'Published'}: ${title}
  slug:          ${slug}
  datePublished: ${datePublished}
  dateModified:  ${today}
  files written: ${pagePath}
                 ${BLOG_DIR}/index.html (${count} article${count === 1 ? '' : 's'})
                 sitemap.xml
                 llms.txt
                 llms-full.txt
  live URL once merged and deployed: ${url}
Nothing was written to Notion, committed or pushed.`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(e => fail(e.stack));
