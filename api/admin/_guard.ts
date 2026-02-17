import type { IncomingMessage, ServerResponse } from 'node:http';

type ApiRequest = IncomingMessage & {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
};

type ApiResponse = ServerResponse & {
  status: (code: number) => ApiResponse;
  send: (body: string) => void;
};

const text = (res: ApiResponse, status: number, body: string) => {
  res.status(status);
  res.setHeader('content-type', 'text/plain; charset=utf-8');
  res.send(body);
};

export const requireBasicAuth = (req: ApiRequest, res: ApiResponse) => {
  const user = process.env.ADMIN_BASIC_USER;
  const pass = process.env.ADMIN_BASIC_PASS;

  if (!user || !pass) return { ok: true as const };

  const auth = req.headers.authorization;
  const header = Array.isArray(auth) ? auth[0] : auth;

  if (!header || !header.toLowerCase().startsWith('basic ')) {
    res.setHeader('www-authenticate', 'Basic realm="Admin"');
    text(res, 401, 'Unauthorized');
    return { ok: false as const };
  }

  const encoded = header.slice(6);
  let decoded = '';
  try {
    decoded = Buffer.from(encoded, 'base64').toString('utf8');
  } catch {
    res.setHeader('www-authenticate', 'Basic realm="Admin"');
    text(res, 401, 'Unauthorized');
    return { ok: false as const };
  }

  const sep = decoded.indexOf(':');
  if (sep < 0) {
    res.setHeader('www-authenticate', 'Basic realm="Admin"');
    text(res, 401, 'Unauthorized');
    return { ok: false as const };
  }

  const gotUser = decoded.slice(0, sep);
  const gotPass = decoded.slice(sep + 1);
  if (gotUser !== user || gotPass !== pass) {
    res.setHeader('www-authenticate', 'Basic realm="Admin"');
    text(res, 401, 'Unauthorized');
    return { ok: false as const };
  }

  return { ok: true as const };
};
