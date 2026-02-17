import http from 'http';
import dotenv from 'dotenv';
import handler from '../api/index.ts';

dotenv.config({ path: '.env.local' });

const port = Number(process.env.API_DEV_PORT ?? 8787);

const readBody = async (req) => {
  if (req.method === 'GET' || req.method === 'HEAD') return undefined;

  let raw = '';
  for await (const chunk of req) {
    raw += typeof chunk === 'string' ? chunk : chunk.toString('utf8');
  }

  const contentType = String(req.headers['content-type'] ?? '').toLowerCase();
  if (contentType.includes('application/json')) {
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      return raw; 
    }
  }

  return raw;
};

const server = http.createServer(async (req, res) => {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.send = (body) => {
    if (typeof body === 'string' || Buffer.isBuffer(body)) res.end(body);
    else res.end(String(body));
  };

  req.body = await readBody(req);

  await handler(req, res);
});

server.listen(port, () => {
  console.log(`[api-dev] listening on http://localhost:${port}`);
});
