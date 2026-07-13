import { createSignedImageUrl } from "../modules/storage/storage.service.js";
export function toUserDto(user) {
    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatarUrl: user.avatarPath,
    };
}
export function toCommentDto(comment, currentUserId) {
    return {
        id: comment.id,
        text: comment.text,
        author: toUserDto(comment.author),
        parentId: comment.parentId,
        likeCount: comment.likeCount,
        likedByMe: comment.likes.some((like) => like.userId === currentUserId),
        createdAt: comment.createdAt.toISOString(),
        replies: (comment.replies || []).map((reply) => toCommentDto(reply, currentUserId)),
    };
}
export async function toPostDto(post, currentUserId) {
    return {
        id: post.id,
        text: post.text,
        visibility: post.visibility,
        imageUrl: await createSignedImageUrl(post.imagePath),
        author: toUserDto(post.author),
        likeCount: post.likeCount,
        commentCount: post.commentCount,
        likedByMe: post.likes.some((like) => like.userId === currentUserId),
        createdAt: post.createdAt.toISOString(),
        comments: post.comments.map((comment) => toCommentDto(comment, currentUserId)),
    };
}
