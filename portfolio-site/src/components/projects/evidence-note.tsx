import type { ReactNode } from "react";

interface EvidenceNoteProps {
  title?: string;
  children: ReactNode;
}

export function EvidenceNote({ title = "证据口径", children }: EvidenceNoteProps) {
  return (
    <aside className="border-l-4 border-[var(--color-divider)] pl-5 text-sm text-[var(--color-muted)]">
      <p className="mb-1 font-bold text-[var(--color-text)]">{title}</p>
      <div>{children}</div>
    </aside>
  );
}
