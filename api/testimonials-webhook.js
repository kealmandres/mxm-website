// /api/testimonials-webhook.js
/*
#todos
- [x] Fetch testimonials from external webhook server-side (bypasses browser CSP)
- [x] Normalize to { id, text, authorName, authorTitle, authorCompany } and filter active
- [x] Return JSON with shape { testimonials: [...] }
- [x] Handle errors and set no-store caching
*/

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  const WEBHOOK_URL = process.env.TESTIMONIALS_WEBHOOK_URL
    || 'https://n8n.srv888335.hstgr.cloud/webhook/9a2b41cf-626b-4e0b-9d45-dbf5be28f574';

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      // No need for CORS headers here; this is server-to-server
    });

    if (!res.ok) {
      const details = await res.text().catch(() => '');
      return response.status(502).json({ message: 'Failed to fetch webhook', details });
    }

    const json = await res.json();
    const items = Array.isArray(json) ? json : [];
    const normalized = items
      .filter(i => i && (i.property_is_active === true || i.property_is_active === 'true'))
      .map(i => ({
        id: i.id,
        text: i.property_text || '',
        authorName: i.property_author || i.name || '',
        authorTitle: i.property_title || '',
        authorCompany: i.property_company || ''
      }));

    response.setHeader('Cache-Control', 'no-store');
    return response.status(200).json({ testimonials: normalized, updatedAt: new Date().toISOString() });
  } catch (error) {
    return response.status(500).json({ message: 'Internal Server Error' });
  }
}


