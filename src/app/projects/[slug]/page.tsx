import { notFound } from "next/navigation";
import { notesBySlug, projectNotes } from "@/data/notes";
import { ProjectDetailChrome } from "@/components/project/project-detail-chrome";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return projectNotes.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = notesBySlug[slug];
  if (!project || project.type !== "project") return { title: "Project not found" };
  return {
    title: `${project.title} — Portfolio Terminal`,
    description: project.summary,
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = notesBySlug[slug];

  if (!project || project.type !== "project") {
    notFound();
  }

  return <ProjectDetailChrome project={project} />;
}
