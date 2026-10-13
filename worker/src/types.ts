import { z } from "zod";
import type { UsageCounter } from "./guardrails/usageCounter";

export interface RateLimitBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface Env {
  OPENROUTER_API_KEY: string;
  ALLOWED_ORIGIN: string;
  MODEL: string;
  CHAT_RATE_LIMITER: RateLimitBinding;
  USAGE_COUNTER: DurableObjectNamespace<UsageCounter>;
  DAILY_IP_LIMIT: string;
  DAILY_GLOBAL_LIMIT: string;
}

export const chatRequestSchema = z.object({
  message: z.string().trim().min(1).max(600),
});

export type ChatRequestBody = z.infer<typeof chatRequestSchema>;

export type ChatResponseBody = {
  reply: string;
};

export type ChatErrorCode =
  | "invalid_request"
  | "origin_not_allowed"
  | "rate_limited"
  | "daily_limit"
  | "capacity_reached"
  | "upstream_rate_limited"
  | "upstream_error";

export type ChatErrorBody = {
  error: string;
  code: ChatErrorCode;
};
