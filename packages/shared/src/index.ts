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

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type Visibility = z.infer<typeof visibilitySchema>;

export type ApiError = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type ApiEnvelope<T> = {
  data: T;
  pageInfo?: {
    nextCursor: string | null;
  };
};

export type UserDto = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
};

export type CommentDto = {
  id: string;
  text: string;
  author: UserDto;
  parentId: string | null;
  likeCount: number;
  likedByMe: boolean;
  createdAt: string;
  replies: CommentDto[];
};

export type PostDto = {
  id: string;
  text: string;
  visibility: Visibility;
  imageUrl: string | null;
  author: UserDto;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  createdAt: string;
  comments?: CommentDto[];
};

export type NotificationDto = {
  id: string;
  type: string;
  text: string;
  readAt: string | null;
  createdAt: string;
};
