import type { IncomingMessage, ServerResponse } from 'node:http';
import { json } from '../../_http.js';

type VercelRequest = IncomingMessage & {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
};

type VercelResponse = ServerResponse & {
  status: (code: number) => VercelResponse;
  send: (body: string) => void;
};

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  json(res, 410, {
    ok: false,
    error: 'This endpoint has been removed',
  });
}
