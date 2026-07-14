import { toUserDto } from "../../lib/mappers.js";
import { prisma } from "../../lib/prisma.js";
import { searchUsersInIndex } from "../../lib/search.js";
import {
  searchUsers as searchUsersRepo,
  findUsersByIds,
  findSuggestions,
  findFriends,
  findActiveStories,
  findUpcomingEvents,
  findNotifications,
  upsertFollow,
  deleteFollow as deleteFollowRepo,
  upsertIgnoredSuggestion,
} from "./user.repository.js";

export async function searchUsers(userId: string, query: string) {
  const meiliUserIds = await searchUsersInIndex(query, 10);
  if (meiliUserIds !== null) {
    const filteredIds = meiliUserIds.filter((id) => id !== userId);
    const users = await findUsersByIds(filteredIds);
    return users.map(toUserDto);
  }
  
  const users = await searchUsersRepo(userId, query);
  return users.map(toUserDto);
}

export async function getSidebarData(userId: string) {
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

export async function followUser(followerId: string, followingId: string, followerName: string) {
  if (followerId === followingId) return { following: false };
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

export async function unfollowUser(followerId: string, followingId: string) {
  await deleteFollowRepo(followerId, followingId);
  return { following: false };
}

export async function ignoreUser(ignoredById: string, ignoredUserId: string) {
  if (ignoredById !== ignoredUserId) {
    await upsertIgnoredSuggestion(ignoredById, ignoredUserId);
  }
  return { ignored: true };
}
