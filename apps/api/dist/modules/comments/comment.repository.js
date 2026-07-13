import { prisma } from "../../lib/prisma.js";
const commentInclude = (userId) => ({
    author: true,
    likes: { where: { userId }, select: { userId: true } },
    replies: {
        orderBy: { createdAt: "asc" },
        include: {
            author: true,
            likes: { where: { userId }, select: { userId: true } },
        },
    },
});
export async function findPostByIdWithPrivacy(postId, userId) {
    return prisma.post.findFirst({
        where: { id: postId, OR: [{ visibility: "PUBLIC" }, { authorId: userId }] },
    });
}
export async function findCommentById(commentId) {
    return prisma.comment.findUnique({
        where: { id: commentId },
        include: { post: true },
    });
}
export async function createCommentInTransaction(data, currentUserId) {
    return prisma.$transaction(async (tx) => {
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
export async function likeCommentInTransaction(commentId, userId) {
    return prisma.$transaction(async (tx) => {
        const existing = await tx.commentLike.findUnique({
            where: { commentId_userId: { commentId, userId } },
        });
        if (!existing) {
            await tx.commentLike.create({ data: { commentId, userId } });
            await tx.comment.update({ where: { id: commentId }, data: { likeCount: { increment: 1 } } });
        }
    });
}
export async function unlikeCommentInTransaction(commentId, userId) {
    return prisma.$transaction(async (tx) => {
        const deleted = await tx.commentLike.deleteMany({ where: { commentId, userId } });
        if (deleted.count > 0) {
            await tx.comment.update({ where: { id: commentId }, data: { likeCount: { decrement: 1 } } });
        }
    });
}
export async function findCommentLikes(commentId, limit = 50) {
    return prisma.commentLike.findMany({
        where: { commentId },
        orderBy: { createdAt: "desc" },
        include: { user: true },
        take: limit,
    });
}
