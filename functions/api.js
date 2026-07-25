/**
 * Cloudflare Pages Function – Proxy for HilltopAds API
 * This runs server-side, bypassing CORS restrictions.
 * 
 * URL pattern: /api?api_key=YOUR_KEY&zone_id=YOUR_ZONE
 */

export async function onRequest(context) {
    const { request } = context;

    if (request.method !== 'GET') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    }

    const url = new URL(request.url);
    const apiKey = url.searchParams.get('api_key');
    const zoneId = url.searchParams.get('zone_id');

    if (!apiKey || !zoneId) {
        return new Response(
            JSON.stringify({ error: 'Missing required parameters: api_key and zone_id' }),
            {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            }
        );
    }

    const apiUrl = `https://difficultblock.com/api/publisher/inventory?api_key=${apiKey}&zone_id=${zoneId}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/json, text/plain, */*' },
        });

        const responseText = await response.text();
        let contentType = 'text/plain';
        let responseData = responseText;

        try {
            const jsonData = JSON.parse(responseText);
            contentType = 'application/json';
            responseData = JSON.stringify(jsonData);
        } catch (_) {
            if (responseText.trim().startsWith('<')) {
                contentType = 'application/xml';
                responseData = responseText;
            } else if (responseText.trim().startsWith('http')) {
                contentType = 'application/json';
                responseData = JSON.stringify({ vast_url: responseText.trim() });
            } else {
                contentType = 'text/plain';
                responseData = responseText;
            }
        }

        return new Response(responseData, {
            status: response.status,
            headers: {
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
        });

    } catch (error) {
        console.error('Proxy error:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to fetch from HilltopAds: ' + error.message }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            }
        );
    }
}

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
