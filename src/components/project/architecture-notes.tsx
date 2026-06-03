import { cn } from "@/lib/utils";
import type { ArchitectureNote } from "@/types/portfolio";

export type ArchitectureNotesProps = {
  notes: ArchitectureNote[];
  className?: string;
};

export function ArchitectureNotes({ notes, className }: ArchitectureNotesProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {notes.map((note) => (
        <div
          key={note.component}
          className="rounded-md border border-border-subtle/80 bg-surface-inset/80 px-3 py-2.5 transition-colors hover:border-border-subtle"
        >
          <p className="font-terminal text-[11px] text-accent-cyan">
            {note.component}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {note.responsibility}
          </p>
        </div>
      ))}
    </div>
  );
}
