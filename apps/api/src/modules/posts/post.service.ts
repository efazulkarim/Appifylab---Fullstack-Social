import type { CreatePostInput } from "@appifylab/shared";
import { HttpError } from "../../lib/http.js";
import { toPostDto, toUserDto } from "../../lib/mappers.js";
import { notify } from "../notifications/notification.service.js";
import { uploadPostImage } from "../storage/storage.service.js";
import { cache } from "../../lib/redis.js";
import {
  findFeedPosts,
  findPostByIdWithPrivacy,
  createPost as createPostRecord,
  likePostInTransaction,
  unlikePostInTransaction,
  findPostLikes,
  findPostsByIds,
} from "./post.repository.js";

export async function getFeed(userId: string, cursor: string | undefined, limit: number) {
  const cacheKey = `feed:home:${userId}`;
  const cacheCreatedAtKey = `feed:home:${userId}:created_at`;
  
  // Get timestamps
  const [publicLastUpdateStr, privateLastUpdateStr, cachedCreatedAtStr] = await Promise.all([
    cache.get("feed:public:last_update"),
    cache.get(`feed:private:last_update:${userId}`),
    cache.get(cacheCreatedAtKey),
  ]);
  
  const publicLastUpdate = publicLastUpdateStr ? parseInt(publicLastUpdateStr, 10) : 0;
  const privateLastUpdate = privateLastUpdateStr ? parseInt(privateLastUpdateStr, 10) : 0;
  const cachedCreatedAt = cachedCreatedAtStr ? parseInt(cachedCreatedAtStr, 10) : 0;
  
  let isCacheStale = !cachedCreatedAtStr || cachedCreatedAt < publicLastUpdate || cachedCreatedAt < privateLastUpdate;
  
  if (isCacheStale) {
    const dbPosts = await findFeedPosts(userId, undefined, 200);
    
    await cache.del(cacheKey);
    
    if (dbPosts.length > 0) {
      await Promise.all(
        dbPosts.map((post) =>
          cache.zadd(cacheKey, post.createdAt.getTime(), post.id)
        )
      );
    }
    
    await cache.set(cacheCreatedAtKey, Date.now().toString(), 3600);
  }
  
  let startIndex = 0;
  let allPostIds = await cache.zrevrange(cacheKey, 0, -1);
  
  if (cursor) {
    const cursorIdx = allPostIds.indexOf(cursor);
    if (cursorIdx !== -1) {
      startIndex = cursorIdx + 1;
    }
  }
  
  const pagePostIds = allPostIds.slice(startIndex, startIndex + limit + 1);
  const nextCursor = pagePostIds.length > limit ? pagePostIds.pop()! : null;
  
  const posts = await findPostsByIds(pagePostIds, userId);
  
  const data = await Promise.all(posts.map((post) => toPostDto(post, userId)));
  return { data, nextCursor };
}

export async function createPost(
  userId: string,
  input: CreatePostInput,
  file: Express.Multer.File | undefined,
) {
  const image = await uploadPostImage(file, userId);
  const post = await createPostRecord(
    {
      authorId: userId,
      text: input.text,
      visibility: input.visibility,
      imagePath: image?.path,
      imageMime: image?.mime,
      imageSize: image?.size,
    },
    userId,
  );
  
  const nowStr = Date.now().toString();
  if (input.visibility === "PUBLIC") {
    await cache.set("feed:public:last_update", nowStr, 3600);
  } else {
    await cache.set(`feed:private:last_update:${userId}`, nowStr, 3600);
  }
  
  return toPostDto(post, userId);
}

export async function likePost(userId: string, userName: string, postId: string) {
  const post = await findPostByIdWithPrivacy(postId, userId);
  if (!post) throw new HttpError(404, "POST_NOT_FOUND", "Post was not found.");
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

export async function unlikePost(userId: string, postId: string) {
  await unlikePostInTransaction(postId, userId);
  return { liked: false };
}

export async function getPostLikes(postId: string, userId: string) {
  const post = await findPostByIdWithPrivacy(postId, userId);
  if (!post) throw new HttpError(404, "POST_NOT_FOUND", "Post was not found.");
  const likes = await findPostLikes(postId);
  return likes.map((like) => toUserDto(like.user));
}
