import type { IncomingMessage, ServerResponse } from 'node:http';
import { getSql } from '../_db.js';
import { json } from '../_http.js';

type VercelRequest = IncomingMessage & {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
};

type VercelResponse = ServerResponse & {
  status: (code: number) => VercelResponse;
  send: (body: string) => void;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    json(res, 405, { ok: false, error: 'Method not allowed' });
    return;
  }

  if (!process.env.DATABASE_URL?.trim()) {
    json(res, 200, { ok: true, items: [] });
    return;
  }

  const sql = getSql();
  const rows = await sql`select id, data, updated_at from seo order by updated_at desc`;
  json(res, 200, { ok: true, items: rows });
}
