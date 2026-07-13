import { prisma } from "../../lib/prisma.js";
export async function createNotification(data) {
    return prisma.notification.create({ data });
}
export async function findNotifications(userId, limit = 30) {
    return prisma.notification.findMany({
        where: { recipientId: userId },
        orderBy: { createdAt: "desc" },
        take: limit,
    });
}
export async function markAllRead(userId) {
    return prisma.notification.updateMany({
        where: { recipientId: userId, readAt: null },
        data: { readAt: new Date() },
    });
}
