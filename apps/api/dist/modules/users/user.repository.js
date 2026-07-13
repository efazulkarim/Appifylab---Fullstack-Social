import { prisma } from "../../lib/prisma.js";
export async function searchUsers(excludeId, query, limit = 10) {
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
export async function findSuggestions(userId, limit = 5) {
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
export async function findFriends(userId, limit = 8) {
    return prisma.follow.findMany({
        where: { followerId: userId },
        include: { following: true },
        take: limit,
        orderBy: { createdAt: "desc" },
    });
}
export async function findActiveStories(limit = 8) {
    return prisma.story.findMany({
        where: { expiresAt: { gt: new Date() } },
        include: { author: true },
        orderBy: { createdAt: "desc" },
        take: limit,
    });
}
export async function findUpcomingEvents(limit = 3) {
    return prisma.event.findMany({
        where: { startsAt: { gt: new Date() } },
        orderBy: { startsAt: "asc" },
        take: limit,
    });
}
export async function findNotifications(userId, limit = 8) {
    return prisma.notification.findMany({
        where: { recipientId: userId },
        orderBy: { createdAt: "desc" },
        take: limit,
    });
}
export async function upsertFollow(followerId, followingId) {
    return prisma.follow.upsert({
        where: { followerId_followingId: { followerId, followingId } },
        create: { followerId, followingId },
        update: {},
    });
}
export async function deleteFollow(followerId, followingId) {
    return prisma.follow.deleteMany({
        where: { followerId, followingId },
    });
}
export async function upsertIgnoredSuggestion(ignoredById, ignoredUserId) {
    return prisma.ignoredSuggestion.upsert({
        where: { ignoredById_ignoredUserId: { ignoredById, ignoredUserId } },
        create: { ignoredById, ignoredUserId },
        update: {},
    });
}
