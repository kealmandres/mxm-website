// The Observatory blog, built from Notion: find the published articles, check each draft, and
// render every page and file the blog serves. Used by api/blog.js, which serves them on request
// with a 5-minute cache, so an article goes live when its draft is set to Approved.
//
// Follows docs/blog-section-spec.md. Reads Notion only; never writes to it.

export const DATABASE_ID = 'c1517c91325c4e769dfbee6dfac19d94'; // Observatory review queue
export const TITLE_PROP = 'Title';
export const STATUS_PROP = 'Status';
export const TYPE_PROP = 'Type';
export const HERO_PROP = 'Hero image';
export const PUBLISHED_PROP = 'Published on';
const NOTION_VERSION = '2022-06-28';

export const SITE = 'https://www.themxm.ai';
export const BLOG_PATH = '/future-observatory/blog/';
export const BLOG_URL = `${SITE}${BLOG_PATH}`;
// The Future Observatory room's own image, the card thumbnail for an article without a hero image
const ROOM_IMAGE = '/assets/images/rooms/observatory-2.webp';
// In-text links copy the Lair of the Blonde Bot page's link (white, bold, white underline); the hover rule is in the template
const LINK_ATTRS = 'class="room-description-link" style="color: #fff; text-decoration: none; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.9);"';

// A check that failed: the draft cannot go on the site as it stands.
export class StopError extends Error {}

const sydneyDate = iso => new Date(iso).toLocaleDateString('en-CA', { timeZone: 'Australia/Sydney' });

// ---------- Notion ----------

export function notionClient(token) {
    async function request(method, endpoint, body) {
        const res = await fetch(`https://api.notion.com/v1/${endpoint}`, {
            method,
            headers: {
                Authorization: `Bearer ${token}`,
                'Notion-Version': NOTION_VERSION,
                'Content-Type': 'application/json',
            },
            body: body ? JSON.stringify(body) : undefined,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(`Notion ${method} ${endpoint} failed: ${res.status} ${data.code}: ${data.message}`);
        return data;
    }
    async function children(blockId) {
        const out = [];
        let cursor;
        do {
            const data = await request('GET', `blocks/${blockId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`);
            out.push(...data.results);
            cursor = data.has_more ? data.next_cursor : null;
        } while (cursor);
        for (const b of out) if (b.has_children) b.children = await children(b.id);
        return out;
    }
    return { request, children };
}

export const plain = rt => rt.map(t => t.plain_text).join('');
export const propText = prop => prop?.type === 'title' ? plain(prop.title)
    : prop?.type === 'select' ? prop.select?.name ?? ''
    : prop?.type === 'status' ? prop.status?.name ?? ''
    : '';

// Every page in the review queue with Status Approved and Type Article, newest first.
export async function publishedPages(client) {
    const pages = [];
    let cursor;
    do {
        const res = await client.request('POST', `databases/${DATABASE_ID}/query`, {
            filter: { and: [
                { property: STATUS_PROP, select: { equals: 'Approved' } },
                { property: TYPE_PROP, select: { equals: 'Article' } },
            ] },
            page_size: 100,
            ...(cursor ? { start_cursor: cursor } : {}),
        });
        pages.push(...res.results);
        cursor = res.has_more ? res.next_cursor : null;
    } while (cursor);
    return pages;
}

export const pageSlug = page => slugify(propText(page.properties[TITLE_PROP]).trim());

// The draft's blocks, converted and checked. Throws StopError when it cannot go on the site.
export function checkDraft(page, blocks) {
    const title = propText(page.properties[TITLE_PROP]).trim();
    const c = convert(blocks);
    if (c.unhandled.length) throw new StopError(`"${title}": these blocks are not handled:\n${c.unhandled.map(u => `  - ${u}`).join('\n')}`);
    if (!c.answer) throw new StopError(`"${title}": no direct answer paragraph.`);
    const words = c.answer.text.split(/\s+/).filter(Boolean).length;
    if (words < 20 || words > 80) throw new StopError(`"${title}": the direct answer is ${words} words; the spec asks for 20 to 80.`);
    if (!c.faqItems.length) throw new StopError(`"${title}": no FAQ (H3 questions under a "Frequently asked questions" heading, or toggles).`);
    if (c.faqItems.some(f => !f.text)) throw new StopError(`"${title}": an FAQ question has no answer.`);
    if (c.front?.author && c.front.author !== 'Marissa Kos') throw new StopError(`"${title}": the author is "${c.front.author}"; the byline and Person schema are for Marissa Kos.`);
    const slug = slugify(title);
    if (!slug) throw new StopError(`"${title}": the title gives an empty slug.`);
    const heroFiles = page.properties[HERO_PROP]?.files ?? [];
    if (heroFiles.length > 1) throw new StopError(`"${title}": ${HERO_PROP} has ${heroFiles.length} files; the page takes one.`);
    const heroAlt = c.front?.hero_image?.trim();
    if (heroFiles.length && !heroAlt) throw new StopError(`"${title}": ${HERO_PROP} is set but the draft has no hero_image description to use as alt text.`);

    // Published on is set by a Notion automation at approval; before that, the draft's creation date
    const datePublished = page.properties[PUBLISHED_PROP]?.date?.start?.slice(0, 10) ?? sydneyDate(page.created_time);
    const edited = sydneyDate(page.last_edited_time);
    return {
        title, slug, c,
        url: `${BLOG_URL}${slug}/`,
        path: `${BLOG_PATH}${slug}/`, // for links within the site, so they stay on the site being viewed
        datePublished,
        dateModified: edited > datePublished ? edited : datePublished,
        description: esc(firstSentence(c.answer.text)),
        hero: heroFiles.length ? { src: `${BLOG_PATH}${slug}/hero`, alt: heroAlt } : null,
    };
}

// The current download link for a page's hero image (Notion's links expire within the hour).
export function heroLink(page) {
    const f = page.properties[HERO_PROP]?.files?.[0];
    return f ? (f.type === 'external' ? f.external.url : f.file.url) : null;
}

// Every published article that passes the checks, newest first. A draft that fails is left
// out and reported in `skipped`, so one bad draft never takes the blog down.
export async function publishedArticles(client) {
    const articles = [];
    const skipped = [];
    // ponytail: one Notion call per article on each uncached request; add a Summary property or a store if the list grows large
    for (const page of await publishedPages(client)) {
        try {
            articles.push(checkDraft(page, await client.children(page.id)));
        } catch (e) {
            if (!(e instanceof StopError)) throw e;
            skipped.push(e.message);
        }
    }
    articles.sort((a, b) => b.datePublished.localeCompare(a.datePublished) || a.title.localeCompare(b.title));
    return { articles, skipped };
}

// ---------- conversion ----------

export const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function slugify(title) {
    return title.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/['’]/g, '')
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

const isFaqHeading = text => /^(frequently asked questions|faqs?)$/i.test(text.trim());

// Why a link may not go on the page, or null when it may. Notion page links arrive as relative
// paths ("/<page id>") or notion.so/notion.site URLs; only http, https and mailto links are allowed.
function linkProblem(href) {
    if (href.startsWith('/')) return 'link to a Notion page';
    let u;
    try { u = new URL(href); } catch { return 'link that is not a valid URL'; }
    if (!['https:', 'http:', 'mailto:'].includes(u.protocol)) return `${u.protocol} link`;
    if (/(^|\.)notion\.(so|com|site)$/i.test(u.hostname)) return 'link to a Notion page';
    return null;
}

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
            const problem = linkProblem(t.href);
            if (problem) unhandled.push(`${problem} "${t.plain_text}"`);
            else s = `<a href="${esc(t.href)}" ${LINK_ATTRS}>${s}</a>`;
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
        s.heading ? `            <h2 class="section-title" style="text-transform: uppercase">${s.heading}</h2>` : null,
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

// ---------- pages and files ----------

const jsonLd = obj => JSON.stringify(obj, null, 2).replace(/</g, '\\u003c').replace(/^/gm, '      ');
const longDate = d => new Date(`${d}T00:00:00Z`).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const firstSentence = s => (s.match(/^.*?[.!?](?=\s|$)/) ?? [s])[0];

// One article page, from templates/observatory-article.html.
export function renderArticle(a, template) {
    const { c } = a;
    const heroUrl = a.hero && `${SITE}${a.hero.src}`;
    const article = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: a.title,
        datePublished: a.datePublished,
        dateModified: a.dateModified,
        author: { '@type': 'Person', name: 'Marissa Kos', url: `${SITE}/blonde-bot-lair` },
        publisher: { '@type': 'Organization', name: 'The MaCHiNE MaiSON', url: `${SITE}/` },
        ...(heroUrl ? { image: heroUrl } : {}),
        mainEntityOfPage: { '@type': 'WebPage', '@id': a.url },
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
        TITLE: esc(a.title), DESCRIPTION: a.description, URL: a.url,
        HERO: a.hero ? `            <img src="${a.hero.src}" alt="${esc(a.hero.alt)}" style="width: 100%; height: auto" />\n` : '',
        HERO_META: heroUrl ? `    <meta property="og:image" content="${heroUrl}" />\n    <meta name="twitter:image" content="${heroUrl}" />\n` : '',
        DATE_PUBLISHED: a.datePublished, DATE_MODIFIED: a.dateModified,
        DATE_PUBLISHED_TEXT: longDate(a.datePublished), DATE_MODIFIED_TEXT: longDate(a.dateModified),
        ANSWER: c.answer.html, BODY: c.body, FAQ: c.faqHtml,
        ARTICLE_JSONLD: jsonLd(article), FAQ_JSONLD: jsonLd(faqPage),
    };
    return template.replace(/{{([A-Z_]+)}}/g, (m, k) => {
        if (!(k in values)) throw new Error(`Template placeholder ${m} has no value.`);
        return values[k];
    });
}

// The blog list page: every article, from templates/observatory-blog.html.
export function renderList(articles, shell) {
    return fillMarkers(shell, articles.map(a => [
        '          <article>',
        `            <h2 style="text-align: center"><a href="${a.path}" ${LINK_ATTRS}>${esc(a.title)}</a></h2>`,
        `            <p><time datetime="${a.datePublished}">${longDate(a.datePublished)}</time></p>`,
        `            <p>${a.description}</p>`,
        '          </article>',
    ].join('\n')).join('\n') || '          <p>No articles have been published yet.</p>');
}

// The Future Observatory room with its four latest articles as glass cards.
// `articles` null means Notion could not be reached: the section shows only its View all button.
export function renderRoom(articles, room) {
    if (!articles) return fillMarkers(room, '');
    // One full-width row per article, so the section is even at any count. The whole card is the
    // link and wears the room's button class (.explore-btn), so it has the SUBSCRIBE button's glass
    // background, border and hover glow; background and border are left to the class for that reason.
    // Each card leads with a 16:9 thumbnail (the article's hero image, or the room's own image when
    // it has none, so every row matches) and the text beside it; on narrow screens the image wraps
    // above the text. The thumbnail's alt is empty: the title right beside it already names the card.
    const p = 'margin: 0; max-width: none; text-align: left';
    return fillMarkers(room, articles.slice(0, 4).map(a => [
        `          <a href="${a.path}" class="explore-btn" style="display: flex; flex-wrap: wrap; align-items: center; gap: 18px 24px; width: 100%; box-sizing: border-box; margin: 0; padding: 16px; border-radius: 16px; text-transform: none; letter-spacing: normal; text-align: left">`,
        `            <img src="${a.hero?.src ?? ROOM_IMAGE}" alt="" width="1600" height="900" loading="lazy" style="flex: 1 1 200px; max-width: 260px; height: auto; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 10px; margin: 0 auto" />`,
        '            <div style="flex: 999 1 260px; min-width: 0">',
        `              <h3 style="margin: 0 0 0.4rem; font-size: 1.35rem; font-weight: normal; text-align: left">${esc(a.title)}</h3>`,
        `              <p style="${p}; margin-bottom: 0.4rem; font-size: 0.85rem; opacity: 0.8"><time datetime="${a.datePublished}">${longDate(a.datePublished)}</time></p>`,
        `              <p style="${p}">${a.description}</p>`,
        '            </div>',
        '          </a>',
    ].join('\n')).join('\n') || '          <p>No articles have been published yet.</p>');
}

// The blog sitemap: the list page and every article, each with its real last change.
export function renderSitemap(articles) {
    const urls = [
        { loc: BLOG_URL, lastmod: articles.map(a => a.dateModified).sort().pop() },
        ...articles.map(a => ({ loc: a.url, lastmod: a.dateModified })),
    ];
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u =>
        `  <url>\n    <loc>${u.loc}</loc>\n${u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : ''}  </url>\n`).join('')}</urlset>\n`;
}

// llms.txt: the base file from templates/, with one line per article under "## Future Observatory".
export function renderLlms(articles, base) {
    return base.trimEnd() + '\n' + articles.map(a => `- [${a.title}](${a.url}): ${firstSentence(a.c.answer.text)}\n`).join('');
}

// llms-full.txt: the base file from templates/, with each article's full text.
export function renderLlmsFull(articles, base) {
    return base.trimEnd() + '\n' + articles.map(a => {
        const { c } = a;
        const text = articleText(`<p>${c.answer.html}</p>\n${c.body}\n<h2>Frequently asked questions</h2>\n${c.faqItems.map(f => `<h3>${esc(f.question)}</h3>\n${f.html}`).join('\n')}`);
        return `\n### ${a.title}\n\nSource: ${a.url}\n\n${text}\n`;
    }).join('');
}

function fillMarkers(page, html) {
    const markers = /(<!-- articles:start[^>]*-->\n)[\s\S]*?(\s*<!-- articles:end -->)/;
    if (!markers.test(page)) throw new Error('The page has no articles:start/end markers.');
    return page.replace(markers, (m, start, end) => `${start}${html}${end}`);
}

// Plain text of the article for llms-full.txt, from the rendered HTML.
function articleText(html) {
    return html
        .replace(/<h2[^>]*>/g, '#### ').replace(/<h3[^>]*>/g, '##### ').replace(/<li>/g, '- ')
        .replace(/<\/(h2|h3|p|li|blockquote)>/g, '\n').replace(/<[^>]+>/g, '')
        .replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
        .split('\n').map(l => l.trim()).filter(Boolean).join('\n\n');
}
