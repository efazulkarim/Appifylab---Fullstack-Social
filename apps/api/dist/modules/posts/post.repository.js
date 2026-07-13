import { Visibility } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
const postRelationsInclude = (currentUserId) => ({
    author: true,
    likes: { where: { userId: currentUserId }, select: { userId: true } },
    comments: {
        where: { parentId: null },
        orderBy: { createdAt: "asc" },
        take: 3,
        include: {
            author: true,
            likes: { where: { userId: currentUserId }, select: { userId: true } },
            replies: {
                orderBy: { createdAt: "asc" },
                take: 2,
                include: {
                    author: true,
                    likes: { where: { userId: currentUserId }, select: { userId: true } },
                },
            },
        },
    },
});
export async function findFeedPosts(userId, cursor, limit) {
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
export async function findPostByIdWithPrivacy(postId, userId) {
    return prisma.post.findFirst({
        where: { id: postId, OR: [{ visibility: "PUBLIC" }, { authorId: userId }] },
        include: { author: true },
    });
}
export async function createPost(data, currentUserId) {
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
export async function likePostInTransaction(postId, userId) {
    return prisma.$transaction(async (tx) => {
        const existing = await tx.postLike.findUnique({
            where: { postId_userId: { postId, userId } },
        });
        if (!existing) {
            await tx.postLike.create({ data: { postId, userId } });
            await tx.post.update({ where: { id: postId }, data: { likeCount: { increment: 1 } } });
        }
    });
}
export async function unlikePostInTransaction(postId, userId) {
    return prisma.$transaction(async (tx) => {
        const deleted = await tx.postLike.deleteMany({ where: { postId, userId } });
        if (deleted.count > 0) {
            await tx.post.update({ where: { id: postId }, data: { likeCount: { decrement: 1 } } });
        }
    });
}
export async function findPostLikes(postId, limit = 50) {
    return prisma.postLike.findMany({
        where: { postId },
        orderBy: { createdAt: "desc" },
        include: { user: true },
        take: limit,
    });
}
