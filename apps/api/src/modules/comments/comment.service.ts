import type { CreateCommentInput } from "@appifylab/shared";
import { HttpError } from "../../lib/http.js";
import { toCommentDto, toUserDto } from "../../lib/mappers.js";
import { notify } from "../notifications/notification.service.js";
import {
  findPostByIdWithPrivacy,
  findCommentById,
  createCommentInTransaction,
  likeCommentInTransaction,
  unlikeCommentInTransaction,
  findCommentLikes,
} from "./comment.repository.js";

export async function createComment(
  userId: string,
  userName: string,
  postId: string,
  input: CreateCommentInput,
) {
  const post = await findPostByIdWithPrivacy(postId, userId);
  if (!post) throw new HttpError(404, "POST_NOT_FOUND", "Post was not found.");
  const comment = await createCommentInTransaction(
    { postId: post.id, authorId: userId, text: input.text },
    userId,
  );
  await notify({
    recipientId: post.authorId,
    actorId: userId,
    type: "COMMENTED",
    text: `${userName} commented on your post.`,
    postId: post.id,
    commentId: comment.id,
  });
  return toCommentDto(comment, userId);
}

export async function createReply(
  userId: string,
  userName: string,
  commentId: string,
  input: CreateCommentInput,
) {
  const parent = await findCommentById(commentId);
  if (!parent || parent.parentId) {
    throw new HttpError(404, "COMMENT_NOT_FOUND", "Comment was not found.");
  }
  const reply = await createCommentInTransaction(
    { postId: parent.postId, parentId: parent.id, authorId: userId, text: input.text },
    userId,
  );
  await notify({
    recipientId: parent.authorId,
    actorId: userId,
    type: "REPLIED",
    text: `${userName} replied to your comment.`,
    postId: parent.postId,
    commentId: parent.id,
  });
  return toCommentDto(reply, userId);
}

export async function likeComment(userId: string, userName: string, commentId: string) {
  const comment = await findCommentById(commentId);
  if (!comment) throw new HttpError(404, "COMMENT_NOT_FOUND", "Comment was not found.");
  await likeCommentInTransaction(commentId, userId);
  await notify({
    recipientId: comment.authorId,
    actorId: userId,
    type: "COMMENT_LIKED",
    text: `${userName} liked your comment.`,
    postId: comment.postId,
    commentId: comment.id,
  });
  return { liked: true };
}

export async function unlikeComment(userId: string, commentId: string) {
  await unlikeCommentInTransaction(commentId, userId);
  return { liked: false };
}

export async function getCommentLikes(commentId: string) {
  const likes = await findCommentLikes(commentId);
  return likes.map((like) => toUserDto(like.user));
}
