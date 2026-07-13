import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import * as userController from "./user.controller.js";

export const userRouter = Router();

userRouter.get("/search", requireAuth, userController.search);
userRouter.get("/sidebar", requireAuth, userController.getSidebar);
userRouter.post("/users/:userId/follow", requireAuth, userController.followUser);
userRouter.delete("/users/:userId/follow", requireAuth, userController.unfollowUser);
userRouter.post("/users/:userId/ignore", requireAuth, userController.ignoreUser);
