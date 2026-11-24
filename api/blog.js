// /api/blog
//
// The Observatory blog, generated from Notion on request. Every response is complete HTML (or
// XML / text), so crawlers read the full article without running JavaScript. Vercel caches each
// response for 5 minutes and refreshes it in the background, so an article goes live within
// about 5 minutes of its draft being set to Approved, with no deploy.
//
// vercel.json routes these URLs here (the `view` query says which):
//   /future-observatory                         view=room     the room, with its four latest articles
//   /future-observatory/blog/                   view=list     every article
//   /future-observatory/blog/<slug>/            view=article  one article
//   /future-observatory/blog/<slug>/hero        view=hero     redirect to the article's current hero image
//   /future-observatory/blog/sitemap.xml        view=sitemap
//   /llms.txt, /llms-full.txt                   view=llms, view=llms-full
//
// Environment: NOTION_TOKEN, a Notion integration with read access to the review queue.
import fs from 'node:fs';
import path from 'node:path';
import {
    notionClient, publishedPages, publishedArticles, pageSlug, checkDraft, heroLink,
    renderArticle, renderList, renderRoom, renderSitemap, renderLlms, renderLlmsFull, StopError,
} from '../scripts/observatory/article.mjs';

// Served for 5 minutes, then refreshed in the background while the saved copy keeps serving
const CACHE = 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400';
// Notion's hero image links expire within the hour, so the redirect is never served stale
const HERO_CACHE = 'public, max-age=0, s-maxage=300';
const template = name => fs.readFileSync(path.join(process.cwd(), 'templates', name), 'utf8');

export default async function handler(req, res) {
    const { view, slug } = req.query;
    if (!process.env.NOTION_TOKEN) {
        console.error('blog: NOTION_TOKEN is not set.');
        return res.status(500).send('Server configuration error.');
    }
    const client = notionClient(process.env.NOTION_TOKEN);
    const send = (type, body, cache = CACHE) => {
        res.setHeader('Content-Type', type);
        res.setHeader('Cache-Control', cache);
        return res.status(200).send(body);
    };

    try {
        if (view === 'room') return send('text/html; charset=utf-8', await room(req, client));

        if (view === 'article' || view === 'hero') {
            const page = (await publishedPages(client)).find(p => pageSlug(p) === slug);
            if (!page) return notFound(res);
            if (view === 'hero') {
                const link = heroLink(page);
                if (!link) return notFound(res);
                res.setHeader('Cache-Control', HERO_CACHE);
                return res.redirect(302, link);
            }
            let article;
            try {
                article = checkDraft(page, await client.children(page.id));
            } catch (e) {
                if (!(e instanceof StopError)) throw e;
                console.error('blog:', e.message);
                return notFound(res);
            }
            return send('text/html; charset=utf-8', renderArticle(article, template('observatory-article.html')));
        }

        const { articles, skipped } = await publishedArticles(client);
        for (const s of skipped) console.error('blog: left out:', s);
        if (view === 'list') return send('text/html; charset=utf-8', renderList(articles, template('observatory-blog.html')));
        if (view === 'sitemap') return send('application/xml; charset=utf-8', renderSitemap(articles));
        if (view === 'llms') return send('text/plain; charset=utf-8', renderLlms(articles, template('llms.txt')));
        if (view === 'llms-full') return send('text/plain; charset=utf-8', renderLlmsFull(articles, template('llms-full.txt')));
        return notFound(res);
    } catch (e) {
        console.error('blog:', e);
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('Retry-After', '60');
        return res.status(503).send('The Observatory blog is briefly unavailable. Please try again in a minute.');
    }
}

// The room page as built (with its versioned CSS and JS), plus the four latest articles. If Notion
// cannot be reached the room still loads, with only the section's View all button.
async function room(req, client) {
    const origin = `${req.headers['x-forwarded-proto'] ?? 'https'}://${req.headers.host}`;
    const built = await fetch(`${origin}/pages/future-observatory.html`);
    if (!built.ok) throw new Error(`Fetching the built room page failed: ${built.status}`);
    let articles = null;
    try {
        ({ articles } = await publishedArticles(client));
    } catch (e) {
        console.error('blog: room without articles:', e);
    }
    return renderRoom(articles, await built.text());
}

function notFound(res) {
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60');
    return res.status(404).send('Not found');
}
