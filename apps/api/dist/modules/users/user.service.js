import { toUserDto } from "../../lib/mappers.js";
import { prisma } from "../../lib/prisma.js";
import { searchUsers as searchUsersRepo, findSuggestions, findFriends, findActiveStories, findUpcomingEvents, findNotifications, upsertFollow, deleteFollow as deleteFollowRepo, upsertIgnoredSuggestion, } from "./user.repository.js";
export async function searchUsers(userId, query) {
    const users = await searchUsersRepo(userId, query);
    return users.map(toUserDto);
}
export async function getSidebarData(userId) {
    const [suggestions, friends, stories, events, notifications] = await Promise.all([
        findSuggestions(userId),
        findFriends(userId),
        findActiveStories(),
        findUpcomingEvents(),
        findNotifications(userId),
    ]);
    return {
        suggestions: suggestions.map(toUserDto),
        friends: friends.map((follow) => toUserDto(follow.following)),
        stories: stories.map((story) => ({
            id: story.id,
            text: story.text,
            author: toUserDto(story.author),
            createdAt: story.createdAt.toISOString(),
        })),
        events: events.map((event) => ({
            id: event.id,
            title: event.title,
            description: event.description,
            startsAt: event.startsAt.toISOString(),
        })),
        notifications: notifications.map((notification) => ({
            id: notification.id,
            type: notification.type,
            text: notification.text,
            readAt: notification.readAt?.toISOString() ?? null,
            createdAt: notification.createdAt.toISOString(),
        })),
    };
}
export async function followUser(followerId, followingId, followerName) {
    if (followerId === followingId)
        return { following: false };
    await upsertFollow(followerId, followingId);
    await prisma.notification.create({
        data: {
            recipientId: followingId,
            actorId: followerId,
            type: "FOLLOWED",
            text: `${followerName} started following you.`,
        },
    }).catch(() => null);
    return { following: true };
}
export async function unfollowUser(followerId, followingId) {
    await deleteFollowRepo(followerId, followingId);
    return { following: false };
}
export async function ignoreUser(ignoredById, ignoredUserId) {
    if (ignoredById !== ignoredUserId) {
        await upsertIgnoredSuggestion(ignoredById, ignoredUserId);
    }
    return { ignored: true };
}
