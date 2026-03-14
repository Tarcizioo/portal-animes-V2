const JIKAN_BASE = 'https://api.jikan.moe/v4';

// TTL in seconds per endpoint pattern
function getTTL(path) {
    const joined = path.join('/');

    // Search results & schedules change often — short cache
    if (joined.startsWith('schedules'))   return 300;   // 5 min
    if (joined.startsWith('seasons/now')) return 600;   // 10 min
    if (joined.includes('?q='))           return 300;   // 5 min (search)

    // Top lists update a few times a day
    if (joined.startsWith('top/'))        return 1800;  // 30 min

    // Anime/character/person details are mostly static
    return 3600; // 1 hour (default)
}

export default async function handler(req, res) {
    // Only GET requests make sense for a read-only proxy
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Extract path segments from dynamic route ([...path])
    const segments = req.query.path || [];
    const pathStr  = Array.isArray(segments) ? segments.join('/') : segments;

    // Forward original query string (filters, pagination, etc.) but drop Vercel's `path` param
    const params = { ...req.query };
    delete params.path;
    const qs = new URLSearchParams(params).toString();

    const upstreamUrl = `${JIKAN_BASE}/${pathStr}${qs ? `?${qs}` : ''}`;

    try {
        const upstream = await fetch(upstreamUrl, {
            headers: {
                'Accept':          'application/json',
                'Accept-Encoding': 'gzip',
                'User-Agent':      'PortalAnimesV2/1.0 (proxy)',
            },
        });

        // Mirror upstream status codes (404, 400, etc.) to the client
        if (!upstream.ok) {
            const text = await upstream.text();
            return res
                .status(upstream.status)
                .setHeader('Content-Type', 'application/json')
                .end(text);
        }

        const data = await upstream.json();
        const ttl  = getTTL(segments);

        // Cache-Control:
        //   s-maxage        → Vercel CDN keeps it for `ttl` seconds
        //   stale-while-revalidate → serve stale while refreshing in background (2× TTL)
        //   public          → allow CDN to cache
        res
            .setHeader('Cache-Control', `public, s-maxage=${ttl}, stale-while-revalidate=${ttl * 2}`)
            .setHeader('Content-Type', 'application/json')
            .setHeader('X-Proxy-Cache-TTL', String(ttl))
            .status(200)
            .json(data);

    } catch (err) {
        console.error('[jikan-proxy] upstream error:', err);
        res.status(502).json({ error: 'Bad Gateway', message: err.message });
    }
}
