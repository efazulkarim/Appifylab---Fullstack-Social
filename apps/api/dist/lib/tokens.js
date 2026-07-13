import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env, isProduction } from "./env.js";
const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    domain: env.COOKIE_DOMAIN || undefined,
};
export function signAccessToken(userId) {
    return jwt.sign({ sub: userId }, env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
}
export function signRefreshToken(userId, sessionId) {
    return jwt.sign({ sub: userId, sid: sessionId }, env.JWT_REFRESH_SECRET, { expiresIn: "30d" });
}
export function verifyAccessToken(token) {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
}
export function verifyRefreshToken(token) {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
}
export function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}
export function setAuthCookies(res, accessToken, refreshToken) {
    res.cookie("access_token", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie("refresh_token", refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });
}
export function clearAuthCookies(res) {
    res.clearCookie("access_token", cookieOptions);
    res.clearCookie("refresh_token", cookieOptions);
}
export function csrfCookieOptions() {
    return {
        httpOnly: false,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        domain: env.COOKIE_DOMAIN || undefined,
    };
}
