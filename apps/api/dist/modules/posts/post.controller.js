import { createPostSchema } from "@appifylab/shared";
import { HttpError, ok, created } from "../../lib/http.js";
import * as postService from "./post.service.js";
export async function getFeed(req, res, next) {
    try {
        if (req.validationError) {
            throw new HttpError(400, "VALIDATION_ERROR", "Invalid feed query.", req.validationError);
        }
        const { cursor, limit } = req.query;
        const { data, nextCursor } = await postService.getFeed(req.user.id, cursor, limit);
        return ok(res, data, { nextCursor });
    }
    catch (error) {
        return next(error);
    }
}
export async function createPost(req, res, next) {
    try {
        const parsed = createPostSchema.safeParse({
            text: req.body.text,
            visibility: req.body.visibility,
        });
        if (!parsed.success) {
            throw new HttpError(400, "VALIDATION_ERROR", "Invalid post data.", parsed.error.flatten());
        }
        const post = await postService.createPost(req.user.id, parsed.data, req.file);
        return created(res, post);
    }
    catch (error) {
        return next(error);
    }
}
export async function likePost(req, res, next) {
    try {
        const result = await postService.likePost(req.user.id, req.user.firstName, String(req.params.postId));
        return ok(res, result);
    }
    catch (error) {
        return next(error);
    }
}
export async function unlikePost(req, res, next) {
    try {
        const result = await postService.unlikePost(req.user.id, String(req.params.postId));
        return ok(res, result);
    }
    catch (error) {
        return next(error);
    }
}
export async function getPostLikes(req, res, next) {
    try {
        const users = await postService.getPostLikes(String(req.params.postId));
        return ok(res, users);
    }
    catch (error) {
        return next(error);
    }
}
