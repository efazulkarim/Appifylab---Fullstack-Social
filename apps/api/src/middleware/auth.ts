import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";
import { verifyAccessToken } from "../lib/tokens.js";

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.access_token;
    if (!token) throw new HttpError(401, "UNAUTHENTICATED", "Please log in.");
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new HttpError(401, "UNAUTHENTICATED", "Please log in.");
    req.user = user;
    next();
  } catch {
    next(new HttpError(401, "UNAUTHENTICATED", "Please log in."));
  }
}
