import { notFound } from "next/navigation";
import { projects, projectsBySlug } from "@/data/projects";
import { ProjectDetailChrome } from "@/components/project/project-detail-chrome";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = projectsBySlug[slug];
  if (!project) return { title: "Project not found" };
  return {
    title: `${project.title} — Portfolio Terminal`,
    description: project.shortDescription,
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = projectsBySlug[slug];

  if (!project) {
    notFound();
  }

  return <ProjectDetailChrome project={project} />;
}
