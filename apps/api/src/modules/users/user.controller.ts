import type { NextFunction, Request, Response } from "express";
import { searchSchema } from "@appifylab/shared";
import { ok } from "../../lib/http.js";
import * as userService from "./user.service.js";

export async function search(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = searchSchema.safeParse(req.query);
    if (!parsed.success) return ok(res, []);
    const users = await userService.searchUsers(req.user!.id, parsed.data.q);
    return ok(res, users);
  } catch (error) {
    return next(error);
  }
}

export async function getSidebar(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await userService.getSidebarData(req.user!.id);
    return ok(res, data);
  } catch (error) {
    return next(error);
  }
}

export async function followUser(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await userService.followUser(req.user!.id, req.params.userId, req.user!.firstName);
    return ok(res, result);
  } catch (error) {
    return next(error);
  }
}

export async function unfollowUser(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await userService.unfollowUser(req.user!.id, req.params.userId);
    return ok(res, result);
  } catch (error) {
    return next(error);
  }
}

export async function ignoreUser(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await userService.ignoreUser(req.user!.id, req.params.userId);
    return ok(res, result);
  } catch (error) {
    return next(error);
  }
}
