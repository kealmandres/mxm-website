// node scripts/observatory/article.test.mjs
// Checks the core and api/blog.js against a fake Notion (fetch is replaced). No network, nothing written.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { convert, checkDraft, slugify, StopError, DATABASE_ID } from './article.mjs';
import handler from '../../api/blog.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
process.chdir(ROOT);
const text = (s, extra = {}) => ({ type: 'text', plain_text: s, href: extra.href ?? null, annotations: { bold: false, italic: false, code: false, strikethrough: false, ...extra.annotations } });
const block = (type, rich) => ({ id: `${type}-${Math.random()}`, type, has_children: false, [type]: { rich_text: rich } });
const ANSWER = 'Agentic AI is AI that runs the process instead of just answering the question. It costs $150 to start, and it is given a role, the context it needs and a connection to tools and people.';

const blocks = [
    block('paragraph', [text('Proposed URL: https://www.themxm.ai/future-observatory/blog/what-is-a-test')]),
    block('code', [text('---\nauthor: Marissa Kos\nhero_image: "A marble hall"\n---')]),
    block('paragraph', [text(ANSWER)]),
    block('heading_2', [text('How is it different?')]),
    block('paragraph', [text('See '), text('aRTIFICIAL iNGENIOUS', { href: 'https://www.themxm.ai/artificial-ingenious' }), text(' for '), text('coaching', { annotations: { bold: true } }), text('.')]),
    block('bulleted_list_item', [text('One <b>point</b>')]),
    block('heading_2', [text('Frequently asked questions')]),
    block('heading_3', [text('What is a Neural Engine?')]),
    block('paragraph', [text('A custom multi-agent system for one business.')]),
];

// ---------- convert ----------
const c = convert(blocks);
assert.deepEqual(c.unhandled, []);
assert.match(c.body, /<a href="https:\/\/www\.themxm\.ai\/artificial-ingenious" class="room-description-link"/);
assert.match(c.body, /<li>One &lt;b&gt;point&lt;\/b&gt;<\/li>/, 'text is escaped');
const bad = convert([
    block('paragraph', [text(ANSWER)]),
    { id: 'img', type: 'image', has_children: false, image: {} },
    block('paragraph', [text('x', { href: 'javascript:alert(1)' })]),
    block('paragraph', [text('y', { href: '/41cb20aeb04881c4b6ebd90fed94bedb' })]),
]);
assert.equal(bad.unhandled.length, 3, bad.unhandled.join('; '));
assert.equal(slugify("What's next? Agentic AI, explained"), 'whats-next-agentic-ai-explained');

// ---------- checkDraft ----------
const page = (id, title, extra = {}) => ({
    id, created_time: '2026-11-18T04:35:23.000Z', last_edited_time: '2026-11-30T23:00:00.000Z',
    parent: { database_id: DATABASE_ID },
    properties: {
        Title: { type: 'title', title: [text(title)] },
        Status: { type: 'select', select: { name: 'Approved' } },
        Type: { type: 'select', select: { name: 'Article' } },
        'Hero image': { type: 'files', files: extra.hero ? [{ type: 'file', name: 'hero.webp', file: { url: 'https://files.notion.test/hero.webp?sig=1' } }] : [] },
        'Published on': { type: 'date', date: extra.published ? { start: extra.published } : null },
    },
});
const a = checkDraft(page('p1', 'What is a test?', { published: '2026-11-25' }), blocks);
assert.equal(a.slug, 'what-is-a-test');
assert.equal(a.datePublished, '2026-11-25');
assert.equal(a.dateModified, '2026-12-01', 'last edited, in Sydney time');
assert.equal(checkDraft(page('p1', 'What is a test?'), blocks).datePublished, '2026-11-18', 'no Published on: the creation date');
assert.throws(() => checkDraft(page('p1', 'Bad'), [blocks[2], { id: 'img', type: 'image', has_children: false, image: {} }]), StopError);

// ---------- api/blog.js against a fake Notion ----------
const pages = [
    page('p1', 'What is a test?', { published: '2026-11-25', hero: true }),
    page('p2', 'An older one?', { published: '2026-11-20' }),
    page('p3', 'A broken one?', { published: '2026-11-27' }),
];
const bodies = { p1: blocks, p2: blocks, p3: [blocks[2], { id: 'img', type: 'image', has_children: false, image: {} }] };
const room = fs.readFileSync('pages/future-observatory.html', 'utf8');
let notionDown = false;
globalThis.fetch = async (url, opts = {}) => {
    const json = data => ({ ok: true, status: 200, json: async () => data, text: async () => JSON.stringify(data) });
    if (url.endsWith('/pages/future-observatory.html')) return { ok: true, status: 200, text: async () => room };
    if (notionDown) return { ok: false, status: 502, json: async () => ({ code: 'down', message: 'Notion is down' }) };
    if (url.endsWith(`databases/${DATABASE_ID}/query`)) {
        const filter = JSON.parse(opts.body).filter.and;
        assert.deepEqual(filter.map(f => f.select.equals), ['Approved', 'Article'], 'only approved articles are asked for');
        return json({ results: pages, has_more: false });
    }
    const m = url.match(/blocks\/(p\d)\/children/);
    if (m) return json({ results: bodies[m[1]], has_more: false });
    throw new Error(`unexpected fetch ${url}`);
};
process.env.NOTION_TOKEN = 'test-token';

async function get(query) {
    const out = { status: 0, headers: {}, body: '' };
    const res = {
        status(code) { out.status = code; return res; },
        setHeader(k, v) { out.headers[k.toLowerCase()] = v; return res; },
        send(body) { out.body = body; return res; },
        redirect(code, to) { out.status = code; out.headers.location = to; return res; },
    };
    await handler({ method: 'GET', query, headers: { host: 'localhost:3001', 'x-forwarded-proto': 'http' } }, res);
    return out;
}
const URL_ = 'https://www.themxm.ai/future-observatory/blog/what-is-a-test/';

const art = await get({ view: 'article', slug: 'what-is-a-test' });
assert.equal(art.status, 200);
assert.match(art.headers['cache-control'], /s-maxage=300/);
assert.equal((art.body.match(/<h1/g) ?? []).length, 1);
assert.ok(art.body.includes(ANSWER), 'full text in the raw HTML');
assert.ok(!art.body.includes('{{'), 'every placeholder filled');
const ld = [...art.body.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(x => JSON.parse(x[1]));
assert.deepEqual(ld.map(o => o['@type']), ['Article', 'Person', 'FAQPage']);
assert.equal(ld[0].mainEntityOfPage['@id'], URL_);
assert.equal(ld[0].datePublished, '2026-11-25');
assert.equal(ld[0].image, 'https://www.themxm.ai/future-observatory/blog/what-is-a-test/hero');
assert.match(art.body, /<img src="\/future-observatory\/blog\/what-is-a-test\/hero" alt="A marble hall"/);
assert.match(art.body, new RegExp(`<link rel="canonical" href="${URL_}"`));

const hero = await get({ view: 'hero', slug: 'what-is-a-test' });
assert.equal(hero.status, 302);
assert.equal(hero.headers.location, 'https://files.notion.test/hero.webp?sig=1');
assert.ok(!/stale-while-revalidate/.test(hero.headers['cache-control']), 'expiring links are never served stale');

assert.equal((await get({ view: 'article', slug: 'no-such-article' })).status, 404);
assert.equal((await get({ view: 'article', slug: 'a-broken-one' })).status, 404, 'a draft failing the checks is not served');

const list = await get({ view: 'list' });
assert.equal(list.status, 200);
assert.ok(list.body.indexOf('What is a test?') < list.body.indexOf('An older one?'), 'newest first');
assert.ok(!list.body.includes('A broken one?'), 'a failing draft is left out');
assert.ok(list.body.includes('>Agentic AI is AI that runs the process instead of just answering the question.</p>'), 'description is the first sentence');
assert.match(list.body, /<a href="\/future-observatory\/blog\/what-is-a-test\/" class="explore-btn"/, 'the list uses the same cards as the room');

const r = await get({ view: 'room' });
assert.equal(r.status, 200);
assert.match(r.body, /<a href="\/future-observatory\/blog\/what-is-a-test\/" class="explore-btn"/, 'each card is one site-relative link with the button class');
assert.ok(!/<a href="https:\/\/www\.themxm\.ai/.test(list.body + r.body), 'links within the site stay on the site being viewed');
assert.ok(!/<a [^>]*class="explore-btn"[^>]*>(?:(?!<\/a>)[\s\S])*<a /.test(r.body), 'no link inside a card');
assert.ok(r.body.includes('Teleportation Telescope'), 'the rest of the room is unchanged');
assert.match(r.body, /<img src="\/future-observatory\/blog\/what-is-a-test\/hero" alt=""/, 'a card shows its hero image');
assert.match(r.body, /<img src="\/assets\/images\/rooms\/observatory-2\.webp" alt=""/, 'a card without one shows the room image');

const sm = await get({ view: 'sitemap' });
assert.match(sm.headers['content-type'], /xml/);
assert.match(sm.body, new RegExp(`<loc>${URL_}</loc>\\n    <lastmod>2026-12-01</lastmod>`));
assert.match(sm.body, /<loc>https:\/\/www\.themxm\.ai\/future-observatory\/blog\/<\/loc>/);

const llms = await get({ view: 'llms' });
assert.match(llms.body, /^# The MaCHiNE MaiSON/);
assert.match(llms.body, new RegExp(`- \\[What is a test\\?\\]\\(${URL_}\\): Agentic AI is AI`));
const full = await get({ view: 'llms-full' });
assert.match(full.body, new RegExp(`### What is a test\\?\\n\\nSource: ${URL_}\\n\\nAgentic AI is AI that runs the process instead of just answering the question\\. It costs \\$150`), '$ survives');

notionDown = true;
const down = await get({ view: 'list' });
assert.equal(down.status, 503);
assert.equal(down.headers['cache-control'], 'no-store', 'an outage is never cached');
const roomDown = await get({ view: 'room' });
assert.equal(roomDown.status, 200, 'the room still loads when Notion is down');
assert.ok(roomDown.body.includes('VIEW ALL ARTICLES'));

console.log('observatory blog: all checks passed');
