import notesJson from "./generated/notes.json";
import type { Note } from "@/types/portfolio";

export const notes = notesJson as Note[];

export const notesBySlug: Record<string, Note> = Object.fromEntries(
  notes.map((note) => [note.slug, note]),
);

export const notesById = notesBySlug;

export const projectNotes = notes.filter((note) => note.type === "project");
