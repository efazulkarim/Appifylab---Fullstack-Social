import { prisma } from "../../lib/prisma.js";

export async function searchUsers(excludeId: string, query: string, limit: number = 10) {
  return prisma.user.findMany({
    where: {
      id: { not: excludeId },
      OR: [
        { firstName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}

export async function findSuggestions(userId: string, limit: number = 5) {
  return prisma.user.findMany({
    where: {
      id: { not: userId },
      followers: { none: { followerId: userId } },
      ignoredBy: { none: { ignoredById: userId } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function findFriends(userId: string, limit: number = 8) {
  return prisma.follow.findMany({
    where: { followerId: userId },
    include: { following: true },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}

export async function findActiveStories(limit: number = 8) {
  return prisma.story.findMany({
    where: { expiresAt: { gt: new Date() } },
    include: { author: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function findUpcomingEvents(limit: number = 3) {
  return prisma.event.findMany({
    where: { startsAt: { gt: new Date() } },
    orderBy: { startsAt: "asc" },
    take: limit,
  });
}

export async function findNotifications(userId: string, limit: number = 8) {
  return prisma.notification.findMany({
    where: { recipientId: userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function upsertFollow(followerId: string, followingId: string) {
  return prisma.follow.upsert({
    where: { followerId_followingId: { followerId, followingId } },
    create: { followerId, followingId },
    update: {},
  });
}

export async function deleteFollow(followerId: string, followingId: string) {
  return prisma.follow.deleteMany({
    where: { followerId, followingId },
  });
}

export async function upsertIgnoredSuggestion(ignoredById: string, ignoredUserId: string) {
  return prisma.ignoredSuggestion.upsert({
    where: { ignoredById_ignoredUserId: { ignoredById, ignoredUserId } },
    create: { ignoredById, ignoredUserId },
    update: {},
  });
}
