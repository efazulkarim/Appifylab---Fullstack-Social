import type { PrismaClient } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";

type TxClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

/** Only select fields safe for public exposure — never includes passwordHash or googleId */
const safeUserSelect = { id: true, firstName: true, lastName: true, email: true, avatarPath: true } as const;

const commentInclude = (userId: string) => ({
  author: { select: safeUserSelect },
  likes: { where: { userId }, select: { userId: true } },
  replies: {
    orderBy: { createdAt: "asc" as const },
    include: {
      author: { select: safeUserSelect },
      likes: { where: { userId }, select: { userId: true } },
    },
  },
});

export async function findPostByIdWithPrivacy(postId: string, userId: string) {
  return prisma.post.findFirst({
    where: { id: postId, OR: [{ visibility: "PUBLIC" }, { authorId: userId }] },
  });
}

export async function findCommentById(commentId: string) {
  return prisma.comment.findUnique({
    where: { id: commentId },
    include: { post: true },
  });
}

export async function createCommentInTransaction(
  data: { postId: string; authorId: string; text: string; parentId?: string },
  currentUserId: string,
) {
  return prisma.$transaction(async (tx: TxClient) => {
    const created = await tx.comment.create({
      data: {
        postId: data.postId,
        authorId: data.authorId,
        text: data.text,
        parentId: data.parentId,
      },
      include: commentInclude(currentUserId),
    });
    if (data.parentId) {
      await tx.comment.update({ where: { id: data.parentId }, data: { replyCount: { increment: 1 } } });
    }
    await tx.post.update({ where: { id: data.postId }, data: { commentCount: { increment: 1 } } });
    return created;
  });
}

export async function likeCommentInTransaction(commentId: string, userId: string) {
  return prisma.$transaction(async (tx: TxClient) => {
    const existing = await tx.commentLike.findUnique({
      where: { commentId_userId: { commentId, userId } },
    });
    if (!existing) {
      await tx.commentLike.create({ data: { commentId, userId } });
      await tx.comment.update({ where: { id: commentId }, data: { likeCount: { increment: 1 } } });
    }
  });
}

export async function unlikeCommentInTransaction(commentId: string, userId: string) {
  return prisma.$transaction(async (tx: TxClient) => {
    const deleted = await tx.commentLike.deleteMany({ where: { commentId, userId } });
    if (deleted.count > 0) {
      await tx.comment.update({ where: { id: commentId }, data: { likeCount: { decrement: 1 } } });
    }
  });
}

export async function findCommentLikes(commentId: string, limit: number = 50) {
  return prisma.commentLike.findMany({
    where: { commentId },
    orderBy: { createdAt: "desc" },
    include: { user: { select: safeUserSelect } },
    take: limit,
  });
}
