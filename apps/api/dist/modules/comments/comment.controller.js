import { createCommentSchema } from "@appifylab/shared";
import { HttpError, ok, created } from "../../lib/http.js";
import * as commentService from "./comment.service.js";
export async function createComment(req, res, next) {
    try {
        const parsed = createCommentSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new HttpError(400, "VALIDATION_ERROR", "Invalid comment data.", parsed.error.flatten());
        }
        const comment = await commentService.createComment(req.user.id, req.user.firstName, String(req.params.postId), parsed.data);
        return created(res, comment);
    }
    catch (error) {
        return next(error);
    }
}
export async function createReply(req, res, next) {
    try {
        const parsed = createCommentSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new HttpError(400, "VALIDATION_ERROR", "Invalid reply data.", parsed.error.flatten());
        }
        const reply = await commentService.createReply(req.user.id, req.user.firstName, String(req.params.commentId), parsed.data);
        return created(res, reply);
    }
    catch (error) {
        return next(error);
    }
}
export async function likeComment(req, res, next) {
    try {
        const result = await commentService.likeComment(req.user.id, req.user.firstName, String(req.params.commentId));
        return ok(res, result);
    }
    catch (error) {
        return next(error);
    }
}
export async function unlikeComment(req, res, next) {
    try {
        const result = await commentService.unlikeComment(req.user.id, String(req.params.commentId));
        return ok(res, result);
    }
    catch (error) {
        return next(error);
    }
}
export async function getCommentLikes(req, res, next) {
    try {
        const users = await commentService.getCommentLikes(String(req.params.commentId));
        return ok(res, users);
    }
    catch (error) {
        return next(error);
    }
}
