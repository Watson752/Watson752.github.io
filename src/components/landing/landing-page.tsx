"use client";

import { useEffect } from "react";
import { experiences, siteProfile } from "@/data/site";
import { AIResponsePanel } from "@/components/command/ai-response-panel";
import { CommandHero } from "@/components/command/command-hero";
import { NoteGraph } from "@/components/graph";
import { projectNotes } from "@/data/notes";
import { CollabForm } from "@/components/portfolio/collab-form";
import { ContactLinks } from "@/components/portfolio/contact-links";
import { ExperienceLog } from "@/components/portfolio/experience-log";
import { ProjectEvidenceGrid } from "@/components/portfolio/project-evidence-grid";
import { SiteDock } from "@/components/portfolio/site-dock";
import { TerminalBadge } from "@/components/portfolio/terminal-badge";
import { SectionShell } from "@/components/terminal/section-shell";
import { TerminalShell } from "@/components/terminal/terminal-shell";
import { usePortfolioIntelligence } from "@/hooks/use-portfolio-intelligence";
import { useActiveSection } from "@/hooks/use-active-section";
import { useFitEnlarge } from "@/hooks/use-fit-enlarge";
import { SectionRail } from "@/components/landing/section-rail";

const SECTIONS = [
  { id: "experience", label: "experience" },
  { id: "terminal", label: "ask" },
  { id: "projects", label: "projects" },
  { id: "contact", label: "contact" },
] as const;

const SECTION_IDS = SECTIONS.map((s) => s.id);

export function LandingPage() {
  const intelligence = usePortfolioIntelligence();
  const { activeId, visibleIds } = useActiveSection(SECTION_IDS);
  useFitEnlarge();

  // Reveal styles only hide content once JS is running, so the static export
  // (and anyone without JS) still sees every section.
  useEffect(() => {
    document.documentElement.classList.add("js-ready");
  }, []);

  return (
    <>
      <TerminalShell className="landing-snap min-h-dvh" flow="intro">
        <SectionShell
          id="experience"
          kicker="/ experience"
          title="My experience"
          actions={<TerminalBadge variant="muted">{siteProfile.systemLabel}</TerminalBadge>}
          panel
          visible={visibleIds.has("experience")}
          active={activeId === "experience"}
          enlarge
        >
          <ExperienceLog experiences={experiences} availability={siteProfile.availability} />
        </SectionShell>

        <SectionShell
          id="terminal"
          kicker="/ ask"
          panel
          visible={visibleIds.has("terminal")}
          active={activeId === "terminal"}
          enlarge
        >
          <div className="grid min-w-0 flex-1 gap-5 lg:grid-cols-12 lg:gap-6">
            <div data-enlarge className="flex min-w-0 flex-col gap-5 lg:col-span-7 lg:gap-6">
              <CommandHero
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

            <div id="graph" className="h-[340px] min-w-0 sm:h-[380px] lg:col-span-5 lg:h-auto">
              <NoteGraph
                activeNodeIds={intelligence.activeGraphNodeIds}
                selectedNodeId={intelligence.selectedNodeId}
                onNodeSelect={intelligence.selectGraphNode}
              />
            </div>
          </div>
        </SectionShell>

        <SectionShell
          id="projects"
          kicker="/ projects"
          title="Project evidence"
          description={
            intelligence.hasSelection
              ? "Matched projects highlighted; others dimmed below."
              : "Run a query or select a graph node to rank evidence."
          }
          panel
          visible={visibleIds.has("projects")}
          active={activeId === "projects"}
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
          description="Reach out directly, or send a note below about what you'd like to talk about."
          panel
          visible={visibleIds.has("contact")}
          active={activeId === "contact"}
          enlarge
        >
          <div className="flex flex-col gap-6">
            <ContactLinks />
            <CollabForm />
          </div>
        </SectionShell>
      </TerminalShell>

      <SectionRail sections={SECTIONS} activeId={activeId} />
      <SiteDock name={siteProfile.name} status={siteProfile.status} nav={siteProfile.nav} />
    </>
  );
}
