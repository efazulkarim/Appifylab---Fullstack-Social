import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import type { Request, Response } from "express";
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
          extraField: "ignored",
        },
      } as unknown as Request;
      const res = {} as Response;
      const next = vi.fn();

      const middleware = validateBody(schema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(); // called with no args = success
      expect(req.body).toEqual({
        email: "test@example.com",
        age: 20,
      });
    });

    it("should call next(HttpError) on Zod validation failure", () => {
      const req = {
        body: {
          email: "invalid-email",
          age: 15,
        },
      } as unknown as Request;
      const res = {} as Response;
      const next = vi.fn();

      const middleware = validateBody(schema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error = next.mock.calls[0][0];
      expect(error).toBeDefined();
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.details?.fieldErrors?.email).toBeDefined();
      expect(error.details?.fieldErrors?.age).toBeDefined();
    });
  });

  describe("validateQuery", () => {
    it("should call next() and populate req.query using defineProperty on success", () => {
      const req = {
        query: {
          email: "query@example.com",
          age: "25",
        },
      } as unknown as Request;
      
      const res = {} as Response;
      const next = vi.fn();

      const querySchema = z.object({
        email: z.string().email(),
        age: z.coerce.number().min(18),
      });

      const middleware = validateQuery(querySchema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(); // called with no args = success
      expect(req.query).toEqual({
        email: "query@example.com",
        age: 25,
      });
    });

    it("should call next(HttpError) on Zod validation failure in query", () => {
      const req = {
        query: {
          email: "bad-email",
          age: "10",
        },
      } as unknown as Request;
      
      const res = {} as Response;
      const next = vi.fn();

      const querySchema = z.object({
        email: z.string().email(),
        age: z.coerce.number().min(18),
      });

      const middleware = validateQuery(querySchema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error = next.mock.calls[0][0];
      expect(error).toBeDefined();
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.details?.fieldErrors?.email).toBeDefined();
      expect(error.details?.fieldErrors?.age).toBeDefined();
    });
  });
});
