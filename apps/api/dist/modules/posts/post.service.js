import { HttpError } from "../../lib/http.js";
import { toPostDto, toUserDto } from "../../lib/mappers.js";
import { notify } from "../notifications/notification.service.js";
import { uploadPostImage } from "../storage/storage.service.js";
import { findFeedPosts, findPostByIdWithPrivacy, createPost as createPostRecord, likePostInTransaction, unlikePostInTransaction, findPostLikes, } from "./post.repository.js";
export async function getFeed(userId, cursor, limit) {
    const posts = await findFeedPosts(userId, cursor, limit);
    const nextCursor = posts.length > limit ? posts.pop().id : null;
    const data = await Promise.all(posts.map((post) => toPostDto(post, userId)));
    return { data, nextCursor };
}
export async function createPost(userId, input, file) {
    const image = await uploadPostImage(file, userId);
    const post = await createPostRecord({
        authorId: userId,
        text: input.text,
        visibility: input.visibility,
        imagePath: image?.path,
        imageMime: image?.mime,
        imageSize: image?.size,
    }, userId);
    return toPostDto(post, userId);
}
export async function likePost(userId, userName, postId) {
    const post = await findPostByIdWithPrivacy(postId, userId);
    if (!post)
        throw new HttpError(404, "POST_NOT_FOUND", "Post was not found.");
    await likePostInTransaction(postId, userId);
    await notify({
        recipientId: post.authorId,
        actorId: userId,
        type: "POST_LIKED",
        text: `${userName} liked your post.`,
        postId: post.id,
    });
    return { liked: true };
}
export async function unlikePost(userId, postId) {
    await unlikePostInTransaction(postId, userId);
    return { liked: false };
}
export async function getPostLikes(postId) {
    const likes = await findPostLikes(postId);
    return likes.map((like) => toUserDto(like.user));
}
