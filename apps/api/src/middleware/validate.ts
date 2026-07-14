import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      req.validationError = parsed.error.flatten();
      return next();
    }
    req.body = parsed.data;
    return next();
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      req.validationError = parsed.error.flatten();
      return next();
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
