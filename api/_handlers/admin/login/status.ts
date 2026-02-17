import type { IncomingMessage, ServerResponse } from 'node:http';
import { json } from '../../_http.js';
import { requireBasicAuth } from '../_guard.js';
import { requireAdminSession } from '../_session.js';

type VercelRequest = IncomingMessage & {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
};

type VercelResponse = ServerResponse & {
  status: (code: number) => VercelResponse;
  send: (body: string) => void;
};

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const guard = requireBasicAuth(_req, res);
  if (!guard.ok) return;

  const session = requireAdminSession(_req, res);
  if (!session.ok) return;

  json(res, 200, { ok: true, authed: true });
}
