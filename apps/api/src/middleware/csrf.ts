import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { env } from "../lib/env.js";
import { HttpError } from "../lib/http.js";
import { csrfCookieOptions } from "../lib/tokens.js";

const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const exemptPaths = new Set([
  "/api/auth/csrf",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/auth/google",
  "/api/auth/google/callback",
]);

function computeCsrfSignature(token: string): string {
  return crypto
    .createHmac("sha256", env.JWT_ACCESS_SECRET)
    .update(token)
    .digest("hex");
}

export function issueCsrfToken(_req: Request, res: Response) {
  const token = crypto.randomBytes(24).toString("hex");
  const signature = computeCsrfSignature(token);
  
  res.cookie("csrf_token", signature, csrfCookieOptions());
  return res.json({ data: { csrfToken: token } });
}

export function requireCsrf(req: Request, _res: Response, next: NextFunction) {
  if (!unsafeMethods.has(req.method) || exemptPaths.has(req.path)) return next();
  
  const cookieSignature = req.cookies?.csrf_token;
  const headerToken = req.header("x-csrf-token");
  
  if (!cookieSignature || !headerToken) {
    return next(new HttpError(403, "CSRF_INVALID", "Security token is missing or invalid."));
  }
  
  const expectedSignature = computeCsrfSignature(headerToken);
  
  const isMatch = (() => {
    try {
      const bufferA = Buffer.from(cookieSignature);
      const bufferB = Buffer.from(expectedSignature);
      if (bufferA.length !== bufferB.length) return false;
      return crypto.timingSafeEqual(bufferA, bufferB);
    } catch {
      return false;
    }
  })();

  if (!isMatch) {
    return next(new HttpError(403, "CSRF_INVALID", "Security token is missing or invalid."));
  }
  
  return next();
}
