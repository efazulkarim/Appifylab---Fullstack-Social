import type { NextFunction, Request, Response } from "express";
import { ok } from "../../lib/http.js";
import * as notificationService from "./notification.service.js";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const notifications = await notificationService.listNotifications(req.user!.id);
    return ok(res, notifications);
  } catch (error) {
    return next(error);
  }
}

export async function markAllRead(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await notificationService.markAllRead(req.user!.id);
    return ok(res, result);
  } catch (error) {
    return next(error);
  }
}
