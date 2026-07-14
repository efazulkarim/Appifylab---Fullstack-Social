import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, env } from "prisma/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to find and load the .env file in parent directories recursively
const loadEnv = () => {
  let currentDir = __dirname;
  while (currentDir) {
    const envPath = path.join(currentDir, ".env");
    if (fs.existsSync(envPath)) {
      try {
        process.loadEnvFile(envPath);
        return;
      } catch (err) {
        console.warn(`Failed to load env file at ${envPath}:`, err);
      }
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break;
    currentDir = parentDir;
  }
};

loadEnv();

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
