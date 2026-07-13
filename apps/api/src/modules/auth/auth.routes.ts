import { Router } from "express";
import { loginSchema, registerSchema } from "@appifylab/shared";
import { requireAuth } from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validate.js";
import { issueCsrfToken } from "../../middleware/csrf.js";
import * as authController from "./auth.controller.js";

export const authRouter = Router();

authRouter.get("/csrf", issueCsrfToken);
authRouter.post("/register", validateBody(registerSchema), authController.register);
authRouter.post("/login", validateBody(loginSchema), authController.login);
authRouter.get("/google", authController.googleRedirect);
authRouter.get("/google/callback", authController.googleCallback);
authRouter.post("/refresh", authController.refresh);
authRouter.post("/logout", authController.logout);
authRouter.get("/me", requireAuth, authController.me);
