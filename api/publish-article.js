// /api/publish-article
//
// POST an approved Observatory draft's Notion page id; get back a pull request on GitHub that
// adds or updates the article. Nothing goes live until a person merges that pull request
// ("Human approves, agent proposes; nothing publishes itself").
//
//   POST /api/publish-article
//   Authorization: Bearer <OBSERVATORY_PUBLISH_SECRET>
//   { "pageId": "<notion page id>" }      (a Notion automation webhook's { "data": { "id" } } also works)
//
// Environment variables (Vercel project settings):
//   OBSERVATORY_PUBLISH_SECRET  shared secret the caller sends
//   NOTION_TOKEN                Notion integration with read access to the review queue
//   GITHUB_TOKEN                fine-grained token for this repo only: Contents and Pull requests, read and write
//   GITHUB_REPO                 optional, default kealmandres/mxm-website
//   GITHUB_BASE                 optional, default main
//
// The same checks as scripts/publish-article.mjs run first (Approved, Type Article, every block
// handled, 20 to 80 word answer, FAQ present). Re-sending the same draft rebuilds its branch
// from the current base and updates the same pull request.
import crypto from 'node:crypto';
import { StopError, notionClient, loadDraft, fetchHero, buildFiles, sydneyToday } from '../scripts/observatory/article.mjs';

export const config = { maxDuration: 60 };

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ message: 'Method Not Allowed' });
    }
    const {
        OBSERVATORY_PUBLISH_SECRET: secret, NOTION_TOKEN, GITHUB_TOKEN,
        GITHUB_REPO = 'kealmandres/mxm-website', GITHUB_BASE = 'main',
    } = process.env;
    if (!secret || !NOTION_TOKEN || !GITHUB_TOKEN) {
        console.error('publish-article: OBSERVATORY_PUBLISH_SECRET, NOTION_TOKEN or GITHUB_TOKEN is not set.');
        return response.status(500).json({ message: 'Server configuration error.' });
    }
    const given = (request.headers.authorization ?? '').replace(/^Bearer\s+/i, '');
    if (!sameSecret(given, secret)) {
        return response.status(401).json({ message: 'Unauthorized' });
    }
    const pageId = request.body?.pageId ?? request.body?.data?.id;
    if (typeof pageId !== 'string' || !/^[0-9a-f]{8}-?([0-9a-f]{4}-?){3}[0-9a-f]{12}$/i.test(pageId)) {
        return response.status(400).json({ message: 'Send { "pageId": "<notion page id>" }.' });
    }

    try {
        const draft = await loadDraft(notionClient(NOTION_TOKEN), pageId);
        const hero = await fetchHero(draft);
        const gh = github(GITHUB_TOKEN, GITHUB_REPO);
        const baseSha = (await gh('GET', `git/ref/heads/${GITHUB_BASE}`)).object.sha;
        const out = await buildFiles({
            draft,
            hero,
            today: sydneyToday(),
            read: path => readFile(gh, path, baseSha),
            list: async dir => {
                const items = await gh('GET', `contents/${encodeURI(dir)}?ref=${baseSha}`);
                return Array.isArray(items) ? items.map(i => ({ name: i.name, type: i.type === 'dir' ? 'dir' : 'file' })) : [];
            },
        });
        const pr = await pullRequest(gh, GITHUB_REPO, GITHUB_BASE, baseSha, draft, out);
        return response.status(200).json({
            pullRequest: pr.html_url,
            slug: out.slug,
            url: out.url,
            updated: out.updated,
            notes: out.notes,
        });
    } catch (e) {
        if (e instanceof StopError) return response.status(422).json({ message: e.message });
        console.error('publish-article:', e);
        return response.status(502).json({ message: 'Publishing failed; see the function logs.' });
    }
}

function sameSecret(given, secret) {
    const a = crypto.createHash('sha256').update(given).digest();
    const b = crypto.createHash('sha256').update(secret).digest();
    return crypto.timingSafeEqual(a, b);
}

function github(token, repo) {
    return async (method, endpoint, body) => {
        const res = await fetch(`https://api.github.com/repos/${repo}/${endpoint}`, {
            method,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
                'User-Agent': 'mxm-observatory-publisher',
                ...(body ? { 'Content-Type': 'application/json' } : {}),
            },
            body: body ? JSON.stringify(body) : undefined,
        });
        if (res.status === 404 && method === 'GET') return null;
        const data = await res.json();
        if (!res.ok) throw new Error(`GitHub ${method} ${endpoint} failed: ${res.status} ${data.message}`);
        return data;
    };
}

async function readFile(gh, path, ref) {
    const f = await gh('GET', `contents/${encodeURI(path)}?ref=${ref}`);
    if (!f || Array.isArray(f)) return null;
    // the contents API leaves files over 1 MB empty; fetch those as blobs
    const content = f.encoding === 'base64' ? f.content : (await gh('GET', `git/blobs/${f.sha}`)).content;
    return Buffer.from(content, 'base64').toString('utf8');
}

// One commit on observatory/<slug>, parented on the current base, then one open pull request for it.
async function pullRequest(gh, repo, base, baseSha, draft, out) {
    const branch = `observatory/${out.slug}`;
    const baseCommit = await gh('GET', `git/commits/${baseSha}`);
    const tree = [];
    for (const [path, content] of Object.entries(out.writes)) {
        const blob = await gh('POST', 'git/blobs', typeof content === 'string'
            ? { content, encoding: 'utf-8' }
            : { content: Buffer.from(content).toString('base64'), encoding: 'base64' });
        tree.push({ path, mode: '100644', type: 'blob', sha: blob.sha });
    }
    for (const path of out.deletes) tree.push({ path, mode: '100644', type: 'blob', sha: null });
    const newTree = await gh('POST', 'git/trees', { base_tree: baseCommit.tree.sha, tree });
    const title = `${out.updated ? 'Update' : 'Publish'} Observatory article: ${draft.title}`;
    const commit = await gh('POST', 'git/commits', { message: title, tree: newTree.sha, parents: [baseSha] });

    if (await gh('GET', `git/ref/heads/${branch}`)) {
        await gh('PATCH', `git/refs/heads/${branch}`, { sha: commit.sha, force: true });
    } else {
        await gh('POST', 'git/refs', { ref: `refs/heads/${branch}`, sha: commit.sha });
    }

    const owner = repo.split('/')[0];
    const open = await gh('GET', `pulls?state=open&head=${owner}:${encodeURIComponent(branch)}`);
    if (open?.length) return open[0];
    const body = [
        `Approved draft in the Observatory review queue, turned into its article page by \`/api/publish-article\`.`,
        '',
        `- Live URL once merged: ${out.url}`,
        `- Published ${out.datePublished}, last updated ${out.today}`,
        `- Files: ${Object.keys(out.writes).map(p => `\`${p}\``).join(', ')}${out.deletes.length ? `; removed ${out.deletes.map(p => `\`${p}\``).join(', ')}` : ''}`,
        ...out.notes.map(n => `- Note: ${n}`),
        '',
        'Merging publishes the article. Approving the draft again rebuilds this branch from the current base.',
    ].join('\n');
    return gh('POST', 'pulls', { title, head: branch, base, body });
}
