import { z } from "zod";
export const visibilitySchema = z.enum(["PUBLIC", "PRIVATE"]);
export const registerSchema = z.object({
    firstName: z.string().trim().min(1).max(60),
    lastName: z.string().trim().min(1).max(60),
    email: z.string().trim().email().max(255),
    password: z.string().min(8).max(128),
});
export const loginSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(1),
});
export const createPostSchema = z.object({
    text: z.string().trim().min(1).max(5000),
    visibility: visibilitySchema.default("PUBLIC"),
});
export const createCommentSchema = z.object({
    text: z.string().trim().min(1).max(1200),
});
export const searchSchema = z.object({
    q: z.string().trim().min(1).max(80),
});
export const cursorQuerySchema = z.object({
    cursor: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(50).default(10),
});
