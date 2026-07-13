import argon2 from "argon2";
import type { RegisterInput, LoginInput } from "@appifylab/shared";
import { env } from "../../lib/env.js";
import { HttpError } from "../../lib/http.js";
import {
  hashToken,
  signAccessToken,
  signRefreshToken,
} from "../../lib/tokens.js";
import {
  findUserByEmail,
  createUser,
  upsertGoogleUser,
  createRefreshSession,
  updateRefreshSessionTokenHash,
  findValidRefreshSession,
  revokeRefreshSession,
  revokeRefreshSessionByTokenHash,
} from "./auth.repository.js";

type SessionMeta = {
  userAgent?: string;
  ipAddress?: string;
};

async function createSession(userId: string, meta: SessionMeta) {
  const session = await createRefreshSession({
    userId,
    tokenHash: hashToken(crypto.randomUUID()),
    userAgent: meta.userAgent,
    ipAddress: meta.ipAddress,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
  const refreshToken = signRefreshToken(userId, session.id);
  await updateRefreshSessionTokenHash(session.id, hashToken(refreshToken));
  return {
    accessToken: signAccessToken(userId),
    refreshToken,
  };
}

export async function registerUser(input: RegisterInput, meta: SessionMeta) {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new HttpError(409, "EMAIL_EXISTS", "An account already exists for this email.");
  }
  const user = await createUser({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    passwordHash: await argon2.hash(input.password),
  });
  const tokens = await createSession(user.id, meta);
  return { user, tokens };
}

export async function loginUser(input: LoginInput, meta: SessionMeta) {
  const user = await findUserByEmail(input.email);
  if (!user?.passwordHash || !(await argon2.verify(user.passwordHash, input.password))) {
    throw new HttpError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
  }
  const tokens = await createSession(user.id, meta);
  return { user, tokens };
}

export function buildGoogleAuthUrl() {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CALLBACK_URL) {
    throw new HttpError(501, "GOOGLE_NOT_CONFIGURED", "Google OAuth is not configured.");
  }
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
  url.searchParams.set("redirect_uri", env.GOOGLE_CALLBACK_URL);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("prompt", "select_account");
  return url.toString();
}

export async function handleGoogleCallback(code: string, meta: SessionMeta) {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_CALLBACK_URL) {
    throw new HttpError(400, "GOOGLE_AUTH_FAILED", "Google OAuth did not return a valid code.");
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: env.GOOGLE_CALLBACK_URL,
      grant_type: "authorization_code",
    }),
  });
  const tokenJson = (await tokenResponse.json()) as { access_token?: string };
  if (!tokenJson.access_token) {
    throw new HttpError(401, "GOOGLE_AUTH_FAILED", "Google token exchange failed.");
  }

  const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { authorization: `Bearer ${tokenJson.access_token}` },
  });
  const profile = (await profileResponse.json()) as {
    sub: string;
    email: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
  };

  const user = await upsertGoogleUser({
    email: profile.email,
    googleId: profile.sub,
    firstName: profile.given_name || "Google",
    lastName: profile.family_name || "User",
    avatarPath: profile.picture,
  });
  const tokens = await createSession(user.id, meta);
  return { user, tokens };
}

export async function refreshSession(refreshToken: string, meta: SessionMeta) {
  const { verifyRefreshToken } = await import("../../lib/tokens.js");
  const payload = verifyRefreshToken(refreshToken);
  if (!payload.sid) {
    throw new HttpError(401, "UNAUTHENTICATED", "Please log in.");
  }
  const session = await findValidRefreshSession(payload.sid, payload.sub, hashToken(refreshToken));
  if (!session) {
    throw new HttpError(401, "UNAUTHENTICATED", "Please log in.");
  }
  await revokeRefreshSession(session.id);
  const tokens = await createSession(session.userId, meta);
  return { user: session.user, tokens };
}

export async function logoutSession(refreshToken: string | undefined) {
  if (refreshToken) {
    await revokeRefreshSessionByTokenHash(hashToken(refreshToken));
  }
}
