# Portfolio chat worker

Cloudflare Worker that answers questions about the portfolio's projects and
skills via an OpenRouter free-tier model, grounded in the site's
already-public content. Deployed separately from the Next.js site (which
stays a static export on GitHub Pages) — this is the only piece of the
project that runs server code and holds the OpenRouter API key.

## Setup

```sh
cd worker
npm install
```

Regenerate the grounding context whenever portfolio content changes (run
`npm run export:vault` in the repo root first if notes changed):

```sh
npm run sync-context
```

## Local development

Get a free API key at [openrouter.ai](https://openrouter.ai/keys) (no card
required). Create `worker/.dev.vars` (gitignored, never committed) with:

```
OPENROUTER_API_KEY=sk-or-v1-...
```

Before deploying, double-check the `MODEL` var in `wrangler.toml` against
OpenRouter's current free-model list at
[openrouter.ai/models?max_price=0](https://openrouter.ai/models?max_price=0)
— free-tier model availability changes over time, so the slug committed
here may not stay live indefinitely.

Then:

```sh
npm run dev
```

Point the Next.js app's `NEXT_PUBLIC_CHAT_WORKER_URL` (in its `.env.local`)
at the printed local URL, e.g. `http://127.0.0.1:8787/chat`.

## Deploy

```sh
wrangler secret put OPENROUTER_API_KEY   # one-time, stored encrypted by Cloudflare
npm run deploy
```

Set the deployed Worker's URL as `NEXT_PUBLIC_CHAT_WORKER_URL` in the
repo root's `.env.production`.

OpenRouter's free tier has its own request-rate limits, independent of this
Worker's own rate limiter (see Guardrails below). When OpenRouter's limit is
hit, the client shows a distinct "free AI tier hit its request limit"
message rather than a generic error (see `src/lib/chat-client.ts`'s
`FRIENDLY_MESSAGES` map and `worker/src/types.ts`'s `ChatErrorCode`).

## Guardrails

- `src/context.ts` — system prompt grounded only in `src/context.json`
  (generated from the already-public, denylist-filtered `notes.json`).
- `src/guardrails/inputFilter.ts` — blocks obvious prompt-extraction/jailbreak
  phrasing before any API call.
- `src/guardrails/outputFilter.ts` — redacts key-shaped or high-entropy
  strings from the model's response as defense-in-depth.
- `src/guardrails/ipUtils.ts` — reads the Cloudflare-verified client IP,
  never logs or returns it, only uses a bucketed key for rate limiting.
- `src/guardrails/rateLimit.ts` — wraps the Workers Rate Limiting binding
  (see `wrangler.toml` for the KV fallback if that binding isn't available).
- `src/guardrails/usageCounter.ts` — Durable Object holding exact daily
  counters: `DAILY_IP_LIMIT` per visitor and `DAILY_GLOBAL_LIMIT` across all
  visitors (both in `wrangler.toml`, reset 00:00 UTC). Only requests that
  pass validation and the input filter spend quota. Tune the global cap to
  OpenRouter's free-tier daily allowance.
- CORS in `src/index.ts` only allows `https://watson752.github.io` (plus
  `localhost:3000` for local dev).
