/**
 * Cloudflare Pages Function – Proxy for HilltopAds VAST API
 * This runs server-side, bypassing CORS restrictions.
 * 
 * URL pattern: /api?api_key=YOUR_KEY&zone_id=YOUR_ZONE
 * Returns VAST XML directly.
 */

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const apiKey = url.searchParams.get('api_key');
  const zoneId = url.searchParams.get('zone_id');

  const headers = {
    'Content-Type': 'application/xml',
    'Access-Control-Allow-Origin': '*',
  };

  if (!apiKey || !zoneId) {
    return new Response(JSON.stringify({ error: 'Missing api_key or zone_id' }), { 
      status: 400, 
      headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'} 
    });
  }

  const targetUrl = `https://difficultblock.com/api/vast.php?api_key=${apiKey}&zone_id=${zoneId}`;

  try {
    const res = await fetch(targetUrl);
    let data = await res.text();
    data = data.trim(); // XML ki extra space hatane k liye
    
    return new Response(data, { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'} 
    });
  }
}

// Handle OPTIONS preflight requests
export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400',
        },
    });
}
