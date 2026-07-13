import type { Prisma, PrismaClient } from "@prisma/client";
import { Visibility } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";

type TxClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

const postRelationsInclude = (currentUserId: string) => ({
  author: true as const,
  likes: { where: { userId: currentUserId }, select: { userId: true } },
  comments: {
    where: { parentId: null },
    orderBy: { createdAt: "asc" as const },
    take: 3,
    include: {
      author: true as const,
      likes: { where: { userId: currentUserId }, select: { userId: true } },
      replies: {
        orderBy: { createdAt: "asc" as const },
        take: 2,
        include: {
          author: true as const,
          likes: { where: { userId: currentUserId }, select: { userId: true } },
        },
      },
    },
  },
});

export async function findFeedPosts(
  userId: string,
  cursor: string | undefined,
  limit: number,
) {
  return prisma.post.findMany({
    where: {
      OR: [{ visibility: Visibility.PUBLIC }, { authorId: userId }],
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: postRelationsInclude(userId),
  });
}

export async function findPostByIdWithPrivacy(postId: string, userId: string) {
  return prisma.post.findFirst({
    where: { id: postId, OR: [{ visibility: "PUBLIC" }, { authorId: userId }] },
    include: { author: true },
  });
}

export async function createPost(
  data: {
    authorId: string;
    text: string;
    visibility: Visibility;
    imagePath?: string | null;
    imageMime?: string | null;
    imageSize?: number | null;
  },
  currentUserId: string,
) {
  return prisma.post.create({
    data: {
      authorId: data.authorId,
      text: data.text,
      visibility: data.visibility,
      imagePath: data.imagePath,
      imageMime: data.imageMime,
      imageSize: data.imageSize,
    },
    include: postRelationsInclude(currentUserId),
  });
}

export async function likePostInTransaction(postId: string, userId: string) {
  return prisma.$transaction(async (tx: TxClient) => {
    const existing = await tx.postLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });
    if (!existing) {
      await tx.postLike.create({ data: { postId, userId } });
      await tx.post.update({ where: { id: postId }, data: { likeCount: { increment: 1 } } });
    }
  });
}

export async function unlikePostInTransaction(postId: string, userId: string) {
  return prisma.$transaction(async (tx: TxClient) => {
    const deleted = await tx.postLike.deleteMany({ where: { postId, userId } });
    if (deleted.count > 0) {
      await tx.post.update({ where: { id: postId }, data: { likeCount: { decrement: 1 } } });
    }
  });
}

export async function findPostLikes(postId: string, limit: number = 50) {
  return prisma.postLike.findMany({
    where: { postId },
    orderBy: { createdAt: "desc" },
    include: { user: true },
    take: limit,
  });
}
