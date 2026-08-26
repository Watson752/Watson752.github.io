import { buildSystemPrompt, getRefusalMessage } from "./context";
import { isSuspiciousInput } from "./guardrails/inputFilter";
import { redactSecrets } from "./guardrails/outputFilter";
import { getClientIp, toRateLimitKey } from "./guardrails/ipUtils";
import { checkRateLimit } from "./guardrails/rateLimit";
import {
  chatRequestSchema,
  type ChatErrorBody,
  type ChatErrorCode,
  type ChatResponseBody,
  type Env,
} from "./types";

const DEV_ORIGINS = new Set(["http://localhost:3000"]);
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

function resolveAllowedOrigin(request: Request, env: Env): string | null {
  const origin = request.headers.get("Origin");
  if (!origin) return null;
  if (origin === env.ALLOWED_ORIGIN) return origin;
  if (DEV_ORIGINS.has(origin)) return origin;
  return null;
}

function corsHeaders(allowedOrigin: string | null): HeadersInit {
  if (!allowedOrigin) return {};
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function json(body: ChatResponseBody | ChatErrorBody, status: number, headers: HeadersInit): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}

function jsonError(error: string, code: ChatErrorCode, status: number, headers: HeadersInit): Response {
  return json({ error, code }, status, headers);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const allowedOrigin = resolveAllowedOrigin(request, env);
    const headers = corsHeaders(allowedOrigin);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    const url = new URL(request.url);
    if (url.pathname !== "/chat" || request.method !== "POST") {
      return jsonError("not found", "invalid_request", 404, headers);
    }

    if (!allowedOrigin) {
      return jsonError("origin not allowed", "origin_not_allowed", 403, headers);
    }

    const clientIp = getClientIp(request);
    const rateLimitKey = toRateLimitKey(clientIp);
    const withinLimit = await checkRateLimit(env, rateLimitKey);
    if (!withinLimit) {
      return jsonError("rate limit exceeded", "rate_limited", 429, {
        ...headers,
        "Retry-After": "60",
      });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("invalid json", "invalid_request", 400, headers);
    }

    const parsed = chatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("invalid request", "invalid_request", 400, headers);
    }

    const { message } = parsed.data;

    if (isSuspiciousInput(message)) {
      return json({ reply: getRefusalMessage() }, 200, headers);
    }

    let reply: string;
    try {
      const completion = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": env.ALLOWED_ORIGIN,
          "X-Title": "Portfolio chat",
        },
        body: JSON.stringify({
          model: env.MODEL,
          max_tokens: 300,
          messages: [
            { role: "system", content: buildSystemPrompt() },
            { role: "user", content: message },
          ],
        }),
      });

      if (completion.status === 429) {
        return jsonError(
          "openrouter free-tier limit reached",
          "upstream_rate_limited",
          429,
          headers,
        );
      }

      if (!completion.ok) {
        console.error("openrouter request failed", completion.status, await completion.text());
        return jsonError("upstream error", "upstream_error", 502, headers);
      }

      const data = (await completion.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      reply = data.choices?.[0]?.message?.content ?? getRefusalMessage();
    } catch (error) {
      console.error("openrouter request failed", error);
      return jsonError("upstream error", "upstream_error", 502, headers);
    }

    const refusal = getRefusalMessage();
    const safeReply = reply.trim() === refusal ? refusal : redactSecrets(reply);

    return json({ reply: safeReply }, 200, headers);
  },
};
