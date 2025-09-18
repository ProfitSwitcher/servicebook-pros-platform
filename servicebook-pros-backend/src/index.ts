import { serveStatic } from '@hono/node-server/serve-static' // or use your preferred static handler

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/users')) {
      // Handle your API logic here
      return new Response(JSON.stringify({ message: 'API not implemented' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Serve static files (like index.html)
    return serveStatic(request, { root: './static' });
  }
}