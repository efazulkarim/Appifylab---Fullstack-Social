import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import * as notificationController from "./notification.controller.js";

export const notificationRouter = Router();

notificationRouter.get("/notifications", requireAuth, notificationController.list);
notificationRouter.patch("/notifications/read", requireAuth, notificationController.markAllRead);
