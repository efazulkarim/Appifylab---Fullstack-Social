import { createNotification, findNotifications, markAllRead as markAllReadRepo, } from "./notification.repository.js";
export async function notify(params) {
    if (params.actorId && params.actorId === params.recipientId)
        return null;
    return createNotification(params);
}
export async function listNotifications(userId) {
    const notifications = await findNotifications(userId);
    return notifications.map((notification) => ({
        id: notification.id,
        type: notification.type,
        text: notification.text,
        readAt: notification.readAt?.toISOString() ?? null,
        createdAt: notification.createdAt.toISOString(),
    }));
}
export async function markAllRead(userId) {
    await markAllReadRepo(userId);
    return { read: true };
}
