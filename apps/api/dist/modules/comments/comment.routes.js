import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import * as commentController from "./comment.controller.js";
export const commentRouter = Router();
commentRouter.post("/posts/:postId/comments", requireAuth, commentController.createComment);
commentRouter.post("/comments/:commentId/replies", requireAuth, commentController.createReply);
commentRouter.put("/comments/:commentId/like", requireAuth, commentController.likeComment);
commentRouter.delete("/comments/:commentId/like", requireAuth, commentController.unlikeComment);
commentRouter.get("/comments/:commentId/likes", requireAuth, commentController.getCommentLikes);
