"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import emailjs from "@emailjs/browser";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TerminalBadge } from "@/components/portfolio/terminal-badge";
import { cn } from "@/lib/utils";

type SubmitState = "idle" | "sending" | "success" | "error";

const fieldRowClass =
  "flex items-center gap-3 border-b border-border-subtle/60 py-2.5 last:border-b-0";
const labelClass =
  "w-16 shrink-0 font-terminal text-[11px] uppercase tracking-[0.08em] text-muted-foreground";
const fieldInputClass =
  "min-w-0 flex-1 bg-transparent font-terminal text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none";

export function CollabForm({ className }: { className?: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<SubmitState>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      setState("error");
      return;
    }

    try {
      // Template variable names must match the EmailJS template dashboard.
      // Each value is sent under both EmailJS's default "Contact Us" names
      // (name/email/title) and the custom names, so either template works.
      await emailjs.send(
        serviceId,
        templateId,
        {
          name,
          from_name: name,
          email,
          from_email: email,
          reply_to: email,
          title: subject,
          subject,
          message,
        },
        { publicKey },
      );
      setState("success");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      setState("error");
    }
  }

  return (
    <div className={cn("mx-auto w-full max-w-xl", className)}>
      <div className="overflow-hidden rounded-md border border-border-subtle/50 bg-surface/30">
        <div className="titlebar-chrome flex items-center justify-between px-3.5 py-2 sm:px-4">
          <span className="font-terminal text-[10px] text-titlebar-foreground">
            compose / <span className="text-foreground/75">new-message</span>
          </span>
          <TerminalBadge variant="muted">draft</TerminalBadge>
        </div>

        <form onSubmit={handleSubmit} className="p-3.5 sm:p-4">
          <div className={fieldRowClass}>
            <span className={labelClass}>To</span>
            <span className="min-w-0 flex-1 truncate font-terminal text-[13px] text-foreground">
              watson.cu.28@gmail.com
            </span>
          </div>
          <div className={fieldRowClass}>
            <span className={labelClass}>From</span>
            <input
              required
              placeholder="your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="Name"
              className={fieldInputClass}
            />
            <input
              required
              type="email"
              placeholder="your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email"
              className={fieldInputClass}
            />
          </div>
          <div className={fieldRowClass}>
            <span className={labelClass}>Subject</span>
            <input
              required
              placeholder="what would you like to talk about?"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              aria-label="Subject"
              className={fieldInputClass}
            />
          </div>

          <textarea
            required
            placeholder="Write your message…"
            rows={7}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            aria-label="Message"
            className="mt-3 w-full resize-none bg-transparent font-terminal text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />

          <div className="mt-3 flex items-center gap-3 border-t border-border-subtle/60 pt-3">
            <Button type="submit" variant="terminal" disabled={state === "sending"}>
              {state === "sending" ? "sending…" : "send"}
              <Send strokeWidth={1.75} />
            </Button>
            {state === "success" && (
              <p className="text-[12px] text-success">✓ message sent — thanks!</p>
            )}
            {state === "error" && (
              <p className="text-[12px] text-destructive">
                ✗ couldn&apos;t send — email watson.cu.28@gmail.com directly instead.
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
