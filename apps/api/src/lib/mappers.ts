import type { Comment, Post, User } from "@prisma/client";
import type { CommentDto, PostDto, UserDto } from "@appifylab/shared";
import { createSignedImageUrl } from "../modules/storage/storage.service.js";

type UserShape = Pick<User, "id" | "firstName" | "lastName" | "email" | "avatarPath">;
type CommentWithAuthor = Comment & {
  author: UserShape;
  likes: { userId: string }[];
  replies?: CommentWithAuthor[];
};
type PostWithRelations = Post & {
  author: UserShape;
  likes: { userId: string }[];
  comments: CommentWithAuthor[];
};

export function toUserDto(user: UserShape): UserDto {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    avatarUrl: user.avatarPath,
  };
}

export function toCommentDto(comment: CommentWithAuthor, currentUserId: string): CommentDto {
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

export async function toPostDto(post: PostWithRelations, currentUserId: string): Promise<PostDto> {
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

export type { UserShape, CommentWithAuthor, PostWithRelations };
