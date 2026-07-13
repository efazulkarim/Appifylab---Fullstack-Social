import type { Response } from "express";

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export function ok<T>(res: Response, data: T, pageInfo?: { nextCursor: string | null }) {
  return res.json(pageInfo ? { data, pageInfo } : { data });
}

export function created<T>(res: Response, data: T) {
  return res.status(201).json({ data });
}
