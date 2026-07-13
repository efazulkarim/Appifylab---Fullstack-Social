import { prisma } from "../../lib/prisma.js";

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
}) {
  return prisma.user.create({ data });
}

export async function upsertGoogleUser(profile: {
  email: string;
  googleId: string;
  firstName: string;
  lastName: string;
  avatarPath?: string;
}) {
  return prisma.user.upsert({
    where: { email: profile.email },
    update: { googleId: profile.googleId, avatarPath: profile.avatarPath || undefined },
    create: {
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      googleId: profile.googleId,
      avatarPath: profile.avatarPath,
    },
  });
}

export async function createRefreshSession(data: {
  userId: string;
  tokenHash: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
}) {
  return prisma.refreshSession.create({ data });
}

export async function updateRefreshSessionTokenHash(id: string, tokenHash: string) {
  return prisma.refreshSession.update({
    where: { id },
    data: { tokenHash },
  });
}

export async function findValidRefreshSession(sessionId: string, userId: string, tokenHash: string) {
  return prisma.refreshSession.findFirst({
    where: {
      id: sessionId,
      userId,
      tokenHash,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });
}

export async function revokeRefreshSession(sessionId: string) {
  return prisma.refreshSession.update({
    where: { id: sessionId },
    data: { revokedAt: new Date() },
  });
}

export async function revokeRefreshSessionByTokenHash(tokenHash: string) {
  return prisma.refreshSession.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
