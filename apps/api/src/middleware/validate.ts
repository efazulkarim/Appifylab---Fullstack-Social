import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { HttpError } from "../lib/http.js";

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return next(new HttpError(400, "VALIDATION_ERROR", "Invalid request data.", parsed.error.flatten()));
    }
    req.body = parsed.data;
    return next();
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      return next(new HttpError(400, "VALIDATION_ERROR", "Invalid query parameters.", parsed.error.flatten()));
    }
    Object.defineProperty(req, "query", {
      value: parsed.data,
      writable: true,
      configurable: true,
      enumerable: true,
    });
    return next();
  };
}
