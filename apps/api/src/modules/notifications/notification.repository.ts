import type { NotificationType } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";

export async function createNotification(data: {
  recipientId: string;
  actorId?: string;
  type: NotificationType;
  text: string;
  postId?: string;
  commentId?: string;
}) {
  return prisma.notification.create({ data });
}

export async function findNotifications(userId: string, limit: number = 30) {
  return prisma.notification.findMany({
    where: { recipientId: userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function markAllRead(userId: string) {
  return prisma.notification.updateMany({
    where: { recipientId: userId, readAt: null },
    data: { readAt: new Date() },
  });
}
