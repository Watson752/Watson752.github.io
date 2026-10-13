import { notFound } from "next/navigation";
import { notes, notesBySlug } from "@/data/notes";
import { ProjectDetailChrome } from "@/components/project/project-detail-chrome";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const nonProjectNotes = notes.filter((note) => note.type !== "project");

export function generateStaticParams() {
  const params = nonProjectNotes.map((note) => ({ slug: note.slug }));
  // `output: "export"` treats an empty list as a missing generateStaticParams.
  // Keep a inert slug so the route builds when every published note is a project.
  return params.length > 0 ? params : [{ slug: "_" }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const note = notesBySlug[slug];
  if (!note || note.type === "project") return { title: "Note not found" };
  return {
    title: `${note.title} | Portfolio Terminal`,
    description: note.summary,
  };
}

export default async function NoteDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const note = notesBySlug[slug];

  if (!note || note.type === "project") {
    notFound();
  }

  return <ProjectDetailChrome project={note} />;
}
