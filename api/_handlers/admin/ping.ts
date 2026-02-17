import type { IncomingMessage, ServerResponse } from 'node:http';
import { requireBasicAuth } from './_guard.js';

type ApiRequest = IncomingMessage & {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
};

type ApiResponse = ServerResponse & {
  status: (code: number) => ApiResponse;
  send: (body: string) => void;
};

const json = (res: ApiResponse, status: number, body: unknown) => {
  res.status(status);
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.send(JSON.stringify(body));
};

export default function handler(req: ApiRequest, res: ApiResponse) {
  const auth = requireBasicAuth(req, res);
  if (!auth.ok) return;
  json(res, 200, { ok: true });
}
