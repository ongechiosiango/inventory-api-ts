import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT ?? 3000),
  REDIS_URL: process.env.REDIS_URL ?? "redis://127.0.0.1:6379",
  CACHE_TTL_SECONDS: Number(process.env.CACHE_TTL_SECONDS ?? 60),
};
