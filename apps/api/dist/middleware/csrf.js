import crypto from "node:crypto";
import { HttpError } from "../lib/http.js";
import { csrfCookieOptions } from "../lib/tokens.js";
const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const exemptPaths = new Set([
    "/api/auth/csrf",
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/refresh",
    "/api/auth/google",
    "/api/auth/google/callback",
]);
export function issueCsrfToken(_req, res) {
    const token = crypto.randomBytes(24).toString("hex");
    res.cookie("csrf_token", token, csrfCookieOptions());
    return res.json({ data: { csrfToken: token } });
}
export function requireCsrf(req, _res, next) {
    if (!unsafeMethods.has(req.method) || exemptPaths.has(req.path))
        return next();
    const cookieToken = req.cookies?.csrf_token;
    const headerToken = req.header("x-csrf-token");
    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        return next(new HttpError(403, "CSRF_INVALID", "Security token is missing or invalid."));
    }
    return next();
}
