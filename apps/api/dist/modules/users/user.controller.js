import { searchSchema } from "@appifylab/shared";
import { ok } from "../../lib/http.js";
import * as userService from "./user.service.js";
export async function search(req, res, next) {
    try {
        const parsed = searchSchema.safeParse(req.query);
        if (!parsed.success)
            return ok(res, []);
        const users = await userService.searchUsers(req.user.id, parsed.data.q);
        return ok(res, users);
    }
    catch (error) {
        return next(error);
    }
}
export async function getSidebar(req, res, next) {
    try {
        const data = await userService.getSidebarData(req.user.id);
        return ok(res, data);
    }
    catch (error) {
        return next(error);
    }
}
export async function followUser(req, res, next) {
    try {
        const result = await userService.followUser(req.user.id, String(req.params.userId), req.user.firstName);
        return ok(res, result);
    }
    catch (error) {
        return next(error);
    }
}
export async function unfollowUser(req, res, next) {
    try {
        const result = await userService.unfollowUser(req.user.id, String(req.params.userId));
        return ok(res, result);
    }
    catch (error) {
        return next(error);
    }
}
export async function ignoreUser(req, res, next) {
    try {
        const result = await userService.ignoreUser(req.user.id, String(req.params.userId));
        return ok(res, result);
    }
    catch (error) {
        return next(error);
    }
}
