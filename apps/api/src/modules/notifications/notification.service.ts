import type { NotificationType } from "@prisma/client";
import type { NotificationDto } from "@appifylab/shared";
import {
  createNotification,
  findNotifications,
  markAllRead as markAllReadRepo,
} from "./notification.repository.js";

export async function notify(params: {
  recipientId: string;
  actorId?: string;
  type: NotificationType;
  text: string;
  postId?: string;
  commentId?: string;
}) {
  if (params.actorId && params.actorId === params.recipientId) return null;
  return createNotification(params);
}

export async function listNotifications(userId: string): Promise<NotificationDto[]> {
  const notifications = await findNotifications(userId);
  return notifications.map((notification) => ({
    id: notification.id,
    type: notification.type,
    text: notification.text,
    readAt: notification.readAt?.toISOString() ?? null,
    createdAt: notification.createdAt.toISOString(),
  }));
}

export async function markAllRead(userId: string) {
  await markAllReadRepo(userId);
  return { read: true };
}
