import { DurableObject } from "cloudflare:workers";
import type { Env } from "../types";

export type UsageDecision = "ok" | "ip_daily_limit" | "global_daily_limit";

const GLOBAL_KEY = "global";

function utcDay(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Single-instance daily usage counter. A Durable Object processes calls one
 * at a time, so check-and-increment is atomic (unlike a KV counter). Counts
 * reset at 00:00 UTC, matching OpenRouter's free-tier daily window.
 */
export class UsageCounter extends DurableObject<Env> {
  async consume(ipKey: string, ipLimit: number, globalLimit: number): Promise<UsageDecision> {
    const today = utcDay();
    if ((await this.ctx.storage.get<string>("day")) !== today) {
      await this.ctx.storage.deleteAll();
      await this.ctx.storage.put("day", today);
    }

    const [globalCount = 0, ipCount = 0] = await Promise.all([
      this.ctx.storage.get<number>(GLOBAL_KEY),
      this.ctx.storage.get<number>(`ip:${ipKey}`),
    ]);

    if (globalCount >= globalLimit) return "global_daily_limit";
    if (ipCount >= ipLimit) return "ip_daily_limit";

    await this.ctx.storage.put({ [GLOBAL_KEY]: globalCount + 1, [`ip:${ipKey}`]: ipCount + 1 });
    return "ok";
  }

  /** Gives back one unit consumed today, for a request that produced no answer. */
  async refund(ipKey: string): Promise<void> {
    if ((await this.ctx.storage.get<string>("day")) !== utcDay()) return;
    const [globalCount = 0, ipCount = 0] = await Promise.all([
      this.ctx.storage.get<number>(GLOBAL_KEY),
      this.ctx.storage.get<number>(`ip:${ipKey}`),
    ]);
    await this.ctx.storage.put({
      [GLOBAL_KEY]: Math.max(0, globalCount - 1),
      [`ip:${ipKey}`]: Math.max(0, ipCount - 1),
    });
  }
}

function usageStub(env: Env) {
  return env.USAGE_COUNTER.get(env.USAGE_COUNTER.idFromName("usage"));
}

export async function consumeDailyQuota(env: Env, ipKey: string): Promise<UsageDecision> {
  return usageStub(env).consume(ipKey, Number(env.DAILY_IP_LIMIT), Number(env.DAILY_GLOBAL_LIMIT));
}

/** Upstream failed (rate-limited, errored, or empty), so the visitor got no answer: don't charge them. */
export async function refundDailyQuota(env: Env, ipKey: string): Promise<void> {
  try {
    await usageStub(env).refund(ipKey);
  } catch (error) {
    console.error("quota refund failed", error);
  }
}
