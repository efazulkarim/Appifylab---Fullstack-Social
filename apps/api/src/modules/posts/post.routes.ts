import { Router } from "express";
import multer from "multer";
import { cursorQuerySchema } from "@appifylab/shared";
import { requireAuth } from "../../middleware/auth.js";
import { validateQuery } from "../../middleware/validate.js";
import * as postController from "./post.controller.js";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB — must match storage.service limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES },
});
export const postRouter = Router();

postRouter.get("/feed", requireAuth, validateQuery(cursorQuerySchema), postController.getFeed);
postRouter.post("/posts", requireAuth, upload.single("image"), postController.createPost);
postRouter.put("/posts/:postId/like", requireAuth, postController.likePost);
postRouter.delete("/posts/:postId/like", requireAuth, postController.unlikePost);
postRouter.get("/posts/:postId/likes", requireAuth, postController.getPostLikes);
