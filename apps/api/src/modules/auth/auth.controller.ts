import type { NextFunction, Request, Response } from "express";
import { HttpError, ok, created } from "../../lib/http.js";
import { toUserDto } from "../../lib/mappers.js";
import { env } from "../../lib/env.js";
import { setAuthCookies, clearAuthCookies } from "../../lib/tokens.js";
import {
  registerUser,
  loginUser,
  buildGoogleAuthUrl,
  handleGoogleCallback,
  refreshSession,
  logoutSession,
} from "./auth.service.js";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.validationError) {
      throw new HttpError(400, "VALIDATION_ERROR", "Invalid registration data.", req.validationError);
    }
    const { user, tokens } = await registerUser(req.body, {
      userAgent: req.header("user-agent"),
      ipAddress: req.ip,
    });
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    return created(res, toUserDto(user));
  } catch (error) {
    return next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.validationError) {
      throw new HttpError(400, "VALIDATION_ERROR", "Invalid login data.", req.validationError);
    }
    const { user, tokens } = await loginUser(req.body, {
      userAgent: req.header("user-agent"),
      ipAddress: req.ip,
    });
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    return ok(res, toUserDto(user));
  } catch (error) {
    return next(error);
  }
}

export function googleRedirect(_req: Request, res: Response, next: NextFunction) {
  try {
    const url = buildGoogleAuthUrl();
    return res.redirect(url);
  } catch (error) {
    return next(error);
  }
}

export async function googleCallback(req: Request, res: Response, next: NextFunction) {
  try {
    const code = String(req.query.code || "");
    if (!code) {
      throw new HttpError(400, "GOOGLE_AUTH_FAILED", "Google OAuth did not return a valid code.");
    }
    const { tokens } = await handleGoogleCallback(code, {
      userAgent: req.header("user-agent"),
      ipAddress: req.ip,
    });
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    return res.redirect(`${env.CLIENT_URL}/feed`);
  } catch (error) {
    return next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      throw new HttpError(401, "UNAUTHENTICATED", "Please log in.");
    }
    const { user, tokens } = await refreshSession(refreshToken, {
      userAgent: req.header("user-agent"),
      ipAddress: req.ip,
    });
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    return ok(res, toUserDto(user));
  } catch (error) {
    clearAuthCookies(res);
    return next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    await logoutSession(req.cookies?.refresh_token);
    clearAuthCookies(res);
    return ok(res, { success: true });
  } catch (error) {
    return next(error);
  }
}

export function me(req: Request, res: Response) {
  return ok(res, toUserDto(req.user!));
}
