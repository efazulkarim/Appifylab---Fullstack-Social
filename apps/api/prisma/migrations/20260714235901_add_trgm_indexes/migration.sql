-- CreateExtension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_firstName_trgm_idx" ON "User" USING gin ("firstName" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "User_lastName_trgm_idx" ON "User" USING gin ("lastName" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "User_email_trgm_idx" ON "User" USING gin ("email" gin_trgm_ops);
