"use client";

import { useEffect, useState } from "react";
import { TerminalWindow } from "@/components/terminal/terminal-window";
import { TerminalBadge } from "@/components/portfolio/terminal-badge";
import { cn } from "@/lib/utils";
import type { Experience } from "@/types/portfolio";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parseMonth(iso: string) {
  const [year, month] = iso.split("-").map(Number);
  return { year, month };
}

function formatMonth(iso: string) {
  const { year, month } = parseMonth(iso);
  return `${MONTHS[month - 1]} ${year}`;
}

/** Inclusive month count, LinkedIn-style (Feb–Sep = 8 mos). */
function durationLabel(start: string, end: string) {
  const s = parseMonth(start);
  const e = parseMonth(end);
  const months = (e.year - s.year) * 12 + (e.month - s.month) + 1;
  return months === 1 ? "1 mo" : `${months} mos`;
}

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export type ExperienceLogProps = {
  experiences: Experience[];
  /** Status line shown above the roles, e.g. internship availability. */
  availability?: string;
  className?: string;
};

/**
 * Roles rendered as a `git log`-style list; each entry expands to show details.
 */
export function ExperienceLog({ experiences, availability, className }: ExperienceLogProps) {
  const [openId, setOpenId] = useState<string | null>(experiences[0]?.id ?? null);
  // Read the date after mount so the static export and the client agree on
  // first render. Until then a role with a future end date counts as active.
  const [nowMonth, setNowMonth] = useState("");
  useEffect(() => setNowMonth(currentMonth()), []);

  return (
    <TerminalWindow title="experience" path="git log --roles" className={className}>
      <div className="font-terminal p-3 text-[12px] sm:p-4 sm:text-[13px]">
        <p className="mb-3 text-muted-foreground">
          <span className="text-success">$</span> git log --roles
        </p>
        {availability && (
          <p className="mb-3 inline-flex items-center gap-2 rounded border border-success/30 bg-success/10 px-2 py-1 text-success">
            <span
              className="size-1.5 rounded-full bg-success shadow-[0_0_8px_hsl(var(--success)/0.55)]"
              aria-hidden
            />
            {availability}
          </p>
        )}
        <ol className="flex flex-col gap-1">
          {experiences.map((role) => {
            const isOpen = openId === role.id;
            const panelId = `experience-${role.id}`;
            // Ongoing: open-ended, or a fixed term that hasn't ended yet.
            const active = role.end === null || nowMonth <= role.end;

            return (
              <li key={role.id} className="min-w-0">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenId(isOpen ? null : role.id)}
                  className={cn(
                    "flex w-full min-w-0 flex-col gap-0.5 rounded px-2 py-1.5 text-left transition-colors sm:flex-row sm:items-baseline sm:gap-3",
                    "hover:bg-surface-inset focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border",
                    isOpen && "bg-surface-inset",
                  )}
                >
                  <span className="flex min-w-0 items-baseline gap-2 sm:flex-1">
                    <span className="text-warning" aria-hidden>
                      *
                    </span>
                    <span className="shrink-0 text-muted-foreground">{role.start}</span>
                    <span className="min-w-0 break-anywhere text-foreground">
                      {role.title}
                      <span className="text-muted-foreground"> @{role.org}</span>
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3 pl-5 text-[11px] sm:pl-0">
                    <span className="text-titlebar-foreground">[{role.employmentType}]</span>
                    {active || role.end === null ? (
                      <span className="inline-flex items-center gap-1.5 text-success">
                        <span
                          className="size-1.5 rounded-full bg-success shadow-[0_0_8px_hsl(var(--success)/0.55)]"
                          aria-hidden
                        />
                        active
                      </span>
                    ) : (
                      <span className="text-muted-foreground">{durationLabel(role.start, role.end)}</span>
                    )}
                  </span>
                </button>

                {isOpen && (
                  <div id={panelId} className="ml-4 border-l border-border-subtle py-2 pl-4 sm:ml-5">
                    <p className="text-muted-foreground">
                      <span aria-hidden>└─ </span>
                      {formatMonth(role.start)} – {role.end ? formatMonth(role.end) : "Present"} ·{" "}
                      {role.location} · {role.mode}
                    </p>
                    {role.highlights.length > 0 && (
                      <ul className="mt-2 flex flex-col gap-1 font-sans text-prose">
                        {role.highlights.map((item, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-muted-foreground" aria-hidden>
                              -
                            </span>
                            <span className="min-w-0 break-anywhere">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {role.skills.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {role.skills.map((skill) => (
                          <TerminalBadge key={skill}>{skill}</TerminalBadge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </TerminalWindow>
  );
}
