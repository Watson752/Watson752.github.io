import type { Env } from "../types";

/**
 * Wraps the Workers Rate Limiting binding declared in wrangler.toml. If that
 * binding isn't available on your account yet, replace this with a Workers
 * KV fixed-window counter, e.g.:
 *
 *   const bucket = `ratelimit:${key}:${Math.floor(Date.now() / 60000)}`;
 *   const count = Number((await env.CHAT_RATE_LIMIT_KV.get(bucket)) ?? "0");
 *   if (count >= 20) return false;
 *   await env.CHAT_RATE_LIMIT_KV.put(bucket, String(count + 1), { expirationTtl: 60 });
 *   return true;
 */
export async function checkRateLimit(env: Env, key: string): Promise<boolean> {
  const { success } = await env.CHAT_RATE_LIMITER.limit({ key });
  return success;
}
