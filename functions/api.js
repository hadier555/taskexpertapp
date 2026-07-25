export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const apiKey = url.searchParams.get('api_key');
  const zoneId = url.searchParams.get('zone_id');

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  if (!apiKey || !zoneId) {
    return new Response(JSON.stringify({ error: 'Missing api_key or zone_id' }), { status: 400, headers });
  }

  const targetUrl = `https://difficultblock.com/api/vast.php?api_key=${apiKey}&zone_id=${zoneId}`;

  const res = await fetch(targetUrl);
  const data = await res.text();
  
  return new Response(data, { status: 200, headers });
    }
