"use client";

import { siteProfile } from "@/data/site";
import { AIResponsePanel } from "@/components/command/ai-response-panel";
import { CommandHero } from "@/components/command/command-hero";
import { ZettelkastenGraph } from "@/components/graph";
import { projects } from "@/data/projects";
import { ProjectEvidenceGrid } from "@/components/portfolio/project-evidence-grid";
import { SiteStatusBar } from "@/components/portfolio/site-status-bar";
import { SectionShell } from "@/components/terminal/section-shell";
import { StatusBar } from "@/components/terminal/status-bar";
import { TerminalShell } from "@/components/terminal/terminal-shell";
import { usePortfolioIntelligence } from "@/hooks/use-portfolio-intelligence";

export function LandingPage() {
  const intelligence = usePortfolioIntelligence();

  return (
    <TerminalShell
      className="min-h-dvh"
      header={
        <SiteStatusBar
          name={siteProfile.name}
          role={siteProfile.role}
          status={siteProfile.status}
          nav={siteProfile.nav}
        />
      }
      footer={
        <StatusBar
          items={[
            {
              id: "shell",
              label: "shell",
              value: "portfolio-terminal",
              tone: "accent",
            },
            {
              id: "mode",
              label: "ai",
              value: "local",
            },
            {
              id: "graph",
              label: "nodes",
              value: intelligence.match
                ? String(intelligence.activeGraphNodeIds.length)
                : "—",
              hideOnMobile: true,
            },
            {
              id: "projects",
              label: "hits",
              value: intelligence.match
                ? String(intelligence.match.matchedProjectIds.length)
                : "—",
              tone: "success",
            },
          ]}
          right={
            <span className="font-terminal block max-w-full truncate text-titlebar-foreground sm:max-w-[12rem] md:max-w-none">
              {intelligence.selectionSource === "graph"
                ? `graph: ${intelligence.selectedNodeId ?? "—"}`
                : intelligence.submittedQuery
                  ? `query: ${intelligence.submittedQuery.slice(0, 28)}`
                  : "awaiting input"}
            </span>
          }
        />
      }
    >
      <div className="grid min-w-0 flex-1 gap-5 lg:grid-cols-12 lg:gap-6">
        <div className="flex min-w-0 flex-col gap-5 lg:col-span-7 lg:gap-6">
          <CommandHero
            systemLabel={siteProfile.systemLabel}
            headline={siteProfile.headline}
            subheading={siteProfile.subheading}
            query={intelligence.query}
            suggestions={intelligence.suggestions}
            onQueryChange={intelligence.setQuery}
            onSubmit={intelligence.handleSubmit}
            onSuggestionSelect={intelligence.handleSuggestionSelect}
          />

          <AIResponsePanel
            match={intelligence.match}
            displayQuery={intelligence.submittedQuery}
            hasSelection={intelligence.hasSelection}
            responseKey={intelligence.responseKey}
            isThinking={intelligence.isThinking}
            selectionSource={intelligence.selectionSource}
          />
        </div>

        <div className="min-w-0 lg:col-span-5">
          <ZettelkastenGraph
            activeNodeIds={intelligence.activeGraphNodeIds}
            selectedNodeId={intelligence.selectedNodeId}
            onNodeSelect={intelligence.selectGraphNode}
          />
        </div>
      </div>

      <SectionShell
        id="projects"
        kicker="evidence"
        title="Project evidence"
        description={
          intelligence.hasSelection
            ? "Matched projects highlighted; others dimmed below."
            : "Run a query or select a graph node to rank evidence."
        }
        className="mt-1 pb-4"
      >
        <ProjectEvidenceGrid
          projects={projects}
          activeProjectIds={intelligence.match?.matchedProjectIds ?? []}
          activeDomains={intelligence.match?.matchedDomains ?? []}
          query={intelligence.submittedQuery}
        />
      </SectionShell>
    </TerminalShell>
  );
}
