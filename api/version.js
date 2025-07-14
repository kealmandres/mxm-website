export default function handler(req, res) {
  // Get Git commit hash from Vercel environment variables
  // Falls back to timestamp for local development
  const version = process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || Date.now().toString();
  
  // Set headers to prevent caching of this endpoint
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Return version as JSON
  res.status(200).json({ 
    version,
    timestamp: Date.now(),
    environment: process.env.VERCEL_ENV || 'development'
  });
} 