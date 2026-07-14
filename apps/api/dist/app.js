import path from "node:path";
import { fileURLToPath } from "node:url";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { env, isProduction } from "./lib/env.js";
import { HttpError } from "./lib/http.js";
import { requireCsrf } from "./middleware/csrf.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { commentRouter } from "./modules/comments/comment.routes.js";
import { notificationRouter } from "./modules/notifications/notification.routes.js";
import { postRouter } from "./modules/posts/post.routes.js";
import { userRouter } from "./modules/users/user.routes.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const app = express();
app.set("trust proxy", 1);
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            "img-src": ["'self'", "data:", "blob:", env.SUPABASE_URL],
            "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
            "connect-src": ["'self'", env.SUPABASE_URL],
        },
    },
}));
app.use(morgan(isProduction ? "combined" : "dev"));
app.use(cors({
    origin: env.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(requireCsrf);
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 50, standardHeaders: true, legacyHeaders: false });
const uploadLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });
app.use("/api/auth", authLimiter, authRouter);
app.use("/api/posts", uploadLimiter);
app.use("/api", postRouter);
app.use("/api", commentRouter);
app.use("/api", userRouter);
app.use("/api", notificationRouter);
app.get("/api/health", (_req, res) => res.json({ data: { status: "ok" } }));
if (isProduction) {
    const webDist = path.resolve(__dirname, "../../web/dist");
    app.use(express.static(webDist));
    app.get("*", (_req, res) => res.sendFile(path.join(webDist, "index.html")));
}
const errorHandler = (error, _req, res, _next) => {
    if (error instanceof HttpError) {
        return res.status(error.statusCode).json({
            error: { code: error.code, message: error.message, details: error.details },
        });
    }
    console.error(error);
    return res.status(500).json({
        error: { code: "INTERNAL_SERVER_ERROR", message: "Something went wrong." },
    });
};
app.use(errorHandler);
