import { createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";
import { env } from "../../lib/env.js";
import { HttpError } from "../../lib/http.js";
import { cache } from "../../lib/redis.js";

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const maxImageBytes = 5 * 1024 * 1024;

export async function uploadPostImage(file: Express.Multer.File | undefined, userId: string) {
  if (!file) return null;
  if (!allowedMimeTypes.has(file.mimetype)) {
    throw new HttpError(400, "INVALID_IMAGE_TYPE", "Only JPG, PNG, WebP, and GIF images are allowed.");
  }
  if (file.size > maxImageBytes) {
    throw new HttpError(400, "IMAGE_TOO_LARGE", "Images must be 5MB or smaller.");
  }

  const ext = file.originalname.split(".").pop()?.toLowerCase() || "jpg";
  const path = `posts/${userId}/${Date.now()}-${nanoid(8)}.${ext}`;
  const { error } = await supabase.storage
    .from(env.SUPABASE_STORAGE_BUCKET)
    .upload(path, file.buffer, {
      contentType: file.mimetype,
      cacheControl: "31536000",
      upsert: false,
    });

  if (error) {
    throw new HttpError(502, "STORAGE_UPLOAD_FAILED", error.message);
  }

  return {
    path,
    mime: file.mimetype,
    size: file.size,
  };
}

const CACHE_TTL_SEC = 8 * 60; // 8 minutes (expires in 10 minutes)

export async function createSignedImageUrl(path: string | null | undefined) {
  if (!path) return null;
  
  const cacheKey = `signed-url:${path}`;
  const cachedUrl = await cache.get(cacheKey);
  if (cachedUrl) {
    return cachedUrl;
  }

  const { data, error } = await supabase.storage
    .from(env.SUPABASE_STORAGE_BUCKET)
    .createSignedUrl(path, 60 * 10);
  if (error || !data?.signedUrl) return null;

  await cache.set(cacheKey, data.signedUrl, CACHE_TTL_SEC);

  return data.signedUrl;
}
