import { describe, it, expect, vi } from "vitest";
import { toUserDto, toCommentDto } from "./mappers.js";
// Mock the storage service so that mappers tests are self-contained
vi.mock("../modules/storage/storage.service.js", () => ({
    createSignedImageUrl: vi.fn((path) => Promise.resolve(path ? `signed-${path}` : null)),
}));
describe("Object Mappers", () => {
    describe("toUserDto", () => {
        it("should correctly map User to UserDto", () => {
            const user = {
                id: "usr_123",
                firstName: "Alice",
                lastName: "Smith",
                email: "alice@example.com",
                avatarPath: "/paths/avatar.jpg",
            };
            const dto = toUserDto(user);
            expect(dto).toEqual({
                id: "usr_123",
                firstName: "Alice",
                lastName: "Smith",
                email: "alice@example.com",
                avatarUrl: "/paths/avatar.jpg",
            });
        });
    });
    describe("toCommentDto", () => {
        it("should correctly map CommentWithAuthor to CommentDto including likedByMe status", () => {
            const author = {
                id: "usr_456",
                firstName: "Bob",
                lastName: "Jones",
                email: "bob@example.com",
                avatarPath: null,
            };
            const comment = {
                id: "cmt_111",
                postId: "pst_999",
                authorId: "usr_456",
                parentId: null,
                text: "Nice comment!",
                likeCount: 5,
                replyCount: 0,
                createdAt: new Date("2026-07-14T12:00:00Z"),
                updatedAt: new Date("2026-07-14T12:00:00Z"),
                author,
                likes: [
                    { userId: "usr_789" },
                    { userId: "usr_current" }, // Liked by current user
                ],
            };
            // Test when liked by current user
            const dtoLiked = toCommentDto(comment, "usr_current");
            expect(dtoLiked.likedByMe).toBe(true);
            expect(dtoLiked.likeCount).toBe(5);
            expect(dtoLiked.text).toBe("Nice comment!");
            expect(dtoLiked.author.firstName).toBe("Bob");
            // Test when NOT liked by current user
            const dtoUnliked = toCommentDto(comment, "usr_other");
            expect(dtoUnliked.likedByMe).toBe(false);
        });
        it("should map comment replies recursively", () => {
            const author = {
                id: "usr_123",
                firstName: "Alice",
                lastName: "Smith",
                email: "alice@example.com",
                avatarPath: null,
            };
            const reply = {
                id: "reply_1",
                postId: "pst_999",
                authorId: "usr_456",
                parentId: "cmt_111",
                text: "My reply",
                likeCount: 0,
                replyCount: 0,
                createdAt: new Date("2026-07-14T12:05:00Z"),
                updatedAt: new Date("2026-07-14T12:05:00Z"),
                author,
                likes: [],
            };
            const comment = {
                id: "cmt_111",
                postId: "pst_999",
                authorId: "usr_123",
                parentId: null,
                text: "Main comment",
                likeCount: 2,
                replyCount: 1,
                createdAt: new Date("2026-07-14T12:00:00Z"),
                updatedAt: new Date("2026-07-14T12:00:00Z"),
                author,
                likes: [],
                replies: [reply],
            };
            const dto = toCommentDto(comment, "usr_current");
            expect(dto.replies).toHaveLength(1);
            expect(dto.replies?.[0].id).toBe("reply_1");
            expect(dto.replies?.[0].parentId).toBe("cmt_111");
            expect(dto.replies?.[0].text).toBe("My reply");
        });
    });
});
