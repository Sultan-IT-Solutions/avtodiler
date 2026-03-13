import type { IncomingMessage, ServerResponse } from 'node:http';

export type VercelRequest = IncomingMessage & {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  url?: string;
};

export type VercelResponse = ServerResponse & {
  status: (code: number) => VercelResponse;
  send: (body: string) => void;
};

export const safeJsonParse = (value: unknown) => {
  if (value && typeof value === 'object') return { ok: true as const, value };
  if (typeof value !== 'string') return { ok: false as const };
  try {
    return { ok: true as const, value: JSON.parse(value) as unknown };
  } catch {
    return { ok: false as const };
  }
};

export const readRawBody = async (req: IncomingMessage) => {
  let raw = '';
  for await (const chunk of req) {
    raw += typeof chunk === 'string' ? chunk : new TextDecoder().decode(chunk as Uint8Array);
  }
  return raw;
};
