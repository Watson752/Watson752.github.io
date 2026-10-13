const REQUEST_TIMEOUT_MS = 15000;

export type ChatResult =
  | { ok: true; reply: string }
  | { ok: false; error: string };

const FRIENDLY_MESSAGES: Record<string, string> = {
  upstream_rate_limited:
    "The free AI tier hit its request limit for now — showing the local match below.",
  rate_limited: "You're querying a bit fast — try again in a minute.",
  daily_limit: "You've hit today's AI question limit — showing the local match below.",
  capacity_reached: "The AI has hit its daily budget for everyone — showing the local match below.",
};

const DEFAULT_FRIENDLY_MESSAGE = "AI backend is unavailable right now — showing the local match below.";

function friendlyMessageForCode(code: unknown): string {
  if (typeof code === "string" && code in FRIENDLY_MESSAGES) {
    return FRIENDLY_MESSAGES[code];
  }
  return DEFAULT_FRIENDLY_MESSAGE;
}

export async function fetchAiAnswer(message: string, signal?: AbortSignal): Promise<ChatResult> {
  const workerUrl = process.env.NEXT_PUBLIC_CHAT_WORKER_URL;
  if (!workerUrl) {
    return { ok: false, error: DEFAULT_FRIENDLY_MESSAGE };
  }

  const timeoutController = new AbortController();
  const timeout = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS);
  signal?.addEventListener("abort", () => timeoutController.abort());

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
      signal: timeoutController.signal,
    });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => null)) as { code?: string } | null;
      return { ok: false, error: friendlyMessageForCode(errorBody?.code) };
    }

    const data = (await response.json()) as { reply?: string };
    if (!data.reply) {
      return { ok: false, error: DEFAULT_FRIENDLY_MESSAGE };
    }

    return { ok: true, reply: data.reply };
  } catch {
    return { ok: false, error: DEFAULT_FRIENDLY_MESSAGE };
  } finally {
    clearTimeout(timeout);
  }
}
