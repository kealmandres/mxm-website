// /api/submit-form.js

export default async function handler(request, response) {
  // --- DEBUGGING STEP ---
  // Log all available environment variables to the vercel dev terminal
  console.log('--- AVAILABLE ENVIRONMENT VARIABLES ---');
  console.log(process.env);
  console.log('------------------------------------');
  // --- END DEBUGGING STEP ---
  
  // 1. Check for POST request and correct Content-Type
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }
  if (request.headers['content-type'] !== 'application/json') {
    return response.status(400).json({ message: 'Content-Type must be application/json' });
  }

  // 2. Get the secret webhook URL from environment variables
  const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

  if (!N8N_WEBHOOK_URL) {
    console.error('N8N_WEBHOOK_URL is not set in environment variables.');
    return response.status(500).json({ message: 'Server configuration error.' });
  }

  try {
    // 3. Forward the request body to the n8n webhook
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(request.body),
    });

    const responseData = await n8nResponse.json();

    // 4. Send the response from n8n back to the client
    if (!n8nResponse.ok) {
      console.error('Error from n8n webhook:', responseData);
      return response.status(n8nResponse.status).json({ message: 'Error submitting form.', details: responseData });
    }

    return response.status(200).json(responseData);

  } catch (error) {
    console.error('Error proxying request to n8n:', error);
    return response.status(500).json({ message: 'An internal server error occurred.' });
  }
} 