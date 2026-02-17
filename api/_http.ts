import type { ServerResponse } from 'node:http';

export type VercelResponse = ServerResponse & {
  status: (code: number) => VercelResponse;
  send: (body: string) => void;
};

export const json = (res: VercelResponse, status: number, body: unknown) => {
  res.status(status);
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.send(JSON.stringify(body));
};
