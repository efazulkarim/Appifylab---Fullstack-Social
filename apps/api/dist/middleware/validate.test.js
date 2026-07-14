import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import { validateBody, validateQuery } from "./validate.js";
describe("Validation Middlewares", () => {
    const schema = z.object({
        email: z.string().email(),
        age: z.number().min(18),
    });
    describe("validateBody", () => {
        it("should call next() and populate req.body with parsed data on success", () => {
            const req = {
                body: {
                    email: "test@example.com",
                    age: 20,
                    extraField: "ignored", // Schema validation should strip this if strict is not on, or Zod will parse it
                },
            };
            const res = {};
            const next = vi.fn();
            const middleware = validateBody(schema);
            middleware(req, res, next);
            expect(next).toHaveBeenCalledTimes(1);
            expect(req.validationError).toBeUndefined();
            expect(req.body).toEqual({
                email: "test@example.com",
                age: 20,
            });
        });
        it("should call next() and set req.validationError on Zod error", () => {
            const req = {
                body: {
                    email: "invalid-email",
                    age: 15,
                },
            };
            const res = {};
            const next = vi.fn();
            const middleware = validateBody(schema);
            middleware(req, res, next);
            expect(next).toHaveBeenCalledTimes(1);
            expect(req.validationError).toBeDefined();
            expect(req.validationError?.fieldErrors.email).toContain("Invalid email address");
            expect(req.validationError?.fieldErrors.age).toContain("Too small: expected number to be >=18");
        });
    });
    describe("validateQuery", () => {
        it("should call next() and populate req.query using defineProperty on success", () => {
            const req = {
                query: {
                    email: "query@example.com",
                    age: "25", // Zod coerce can convert this if schema handles it, or we pass correct type
                },
            };
            const res = {};
            const next = vi.fn();
            const querySchema = z.object({
                email: z.string().email(),
                age: z.coerce.number().min(18),
            });
            const middleware = validateQuery(querySchema);
            middleware(req, res, next);
            expect(next).toHaveBeenCalledTimes(1);
            expect(req.validationError).toBeUndefined();
            expect(req.query).toEqual({
                email: "query@example.com",
                age: 25,
            });
        });
        it("should call next() and set req.validationError on Zod error in query", () => {
            const req = {
                query: {
                    email: "bad-email",
                    age: "10",
                },
            };
            const res = {};
            const next = vi.fn();
            const querySchema = z.object({
                email: z.string().email(),
                age: z.coerce.number().min(18),
            });
            const middleware = validateQuery(querySchema);
            middleware(req, res, next);
            expect(next).toHaveBeenCalledTimes(1);
            expect(req.validationError).toBeDefined();
            expect(req.validationError?.fieldErrors.email).toContain("Invalid email address");
            expect(req.validationError?.fieldErrors.age).toContain("Too small: expected number to be >=18");
        });
    });
});
