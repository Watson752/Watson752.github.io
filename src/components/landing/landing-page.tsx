"use client";

import { siteProfile } from "@/data/site";
import { AIResponsePanel } from "@/components/command/ai-response-panel";
import { CommandHero } from "@/components/command/command-hero";
import { NoteGraph } from "@/components/graph";
import { projectNotes } from "@/data/notes";
import { CollabForm } from "@/components/portfolio/collab-form";
import { ContactLinks } from "@/components/portfolio/contact-links";
import { ProjectEvidenceGrid } from "@/components/portfolio/project-evidence-grid";
import { SiteDock } from "@/components/portfolio/site-dock";
import { SectionShell } from "@/components/terminal/section-shell";
import { TerminalShell } from "@/components/terminal/terminal-shell";
import { usePortfolioIntelligence } from "@/hooks/use-portfolio-intelligence";

export function LandingPage() {
  const intelligence = usePortfolioIntelligence();

  return (
    <>
      <TerminalShell className="min-h-dvh pb-24 sm:pb-24">
        <div className="grid min-w-0 flex-1 gap-5 lg:grid-cols-12 lg:gap-6">
          <div className="flex min-w-0 flex-col gap-5 lg:col-span-7 lg:gap-6">
            <CommandHero
              systemLabel={siteProfile.systemLabel}
              headline={siteProfile.headline}
              subheading={siteProfile.subheading}
              query={intelligence.query}
              suggestions={intelligence.suggestions}
              commandMatches={intelligence.commandMatches}
              onQueryChange={intelligence.setQuery}
              onSubmit={intelligence.handleSubmit}
              onSuggestionSelect={intelligence.handleSuggestionSelect}
              onCommandSelect={intelligence.handleCommandSelect}
            />

            <AIResponsePanel
              match={intelligence.match}
              commandResult={intelligence.commandResult}
              displayQuery={intelligence.submittedQuery}
              hasSelection={intelligence.hasSelection}
              responseKey={intelligence.responseKey}
              isThinking={intelligence.isThinking}
              aiError={intelligence.aiError}
              selectionSource={intelligence.selectionSource}
            />
          </div>

          <div id="graph" className="min-w-0 lg:col-span-5">
            <NoteGraph
              activeNodeIds={intelligence.activeGraphNodeIds}
              selectedNodeId={intelligence.selectedNodeId}
              onNodeSelect={intelligence.selectGraphNode}
            />
          </div>
        </div>

        <SectionShell
          id="projects"
          kicker="/ projects"
          title="Project evidence"
          description={
            intelligence.hasSelection
              ? "Matched projects highlighted; others dimmed below."
              : "Run a query or select a graph node to rank evidence."
          }
          className="mt-1 pb-4"
        >
          <ProjectEvidenceGrid
            projects={projectNotes}
            activeProjectIds={intelligence.match?.matchedProjectIds ?? []}
            activeDomains={intelligence.match?.matchedDomains ?? []}
            query={intelligence.submittedQuery}
          />
        </SectionShell>

        <SectionShell
          id="contact"
          kicker="/ contact"
          title="Get in touch"
          description="Reach out directly, or send a note below about what you'd like to collaborate on."
          className="pb-4"
        >
          <div className="flex flex-col gap-6">
            <ContactLinks />
            <CollabForm />
          </div>
        </SectionShell>
      </TerminalShell>

      <SiteDock name={siteProfile.name} status={siteProfile.status} nav={siteProfile.nav} />
    </>
  );
}
