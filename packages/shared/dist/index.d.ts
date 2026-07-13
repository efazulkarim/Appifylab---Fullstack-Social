import { z } from "zod";
export declare const visibilitySchema: z.ZodEnum<{
    PUBLIC: "PUBLIC";
    PRIVATE: "PRIVATE";
}>;
export declare const registerSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const createPostSchema: z.ZodObject<{
    text: z.ZodString;
    visibility: z.ZodDefault<z.ZodEnum<{
        PUBLIC: "PUBLIC";
        PRIVATE: "PRIVATE";
    }>>;
}, z.core.$strip>;
export declare const createCommentSchema: z.ZodObject<{
    text: z.ZodString;
}, z.core.$strip>;
export declare const searchSchema: z.ZodObject<{
    q: z.ZodString;
}, z.core.$strip>;
export declare const cursorQuerySchema: z.ZodObject<{
    cursor: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
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
    comments: CommentDto[];
};
export type NotificationDto = {
    id: string;
    type: string;
    text: string;
    readAt: string | null;
    createdAt: string;
};
