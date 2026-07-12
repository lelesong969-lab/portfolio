interface CapabilityGroup {
  label: string;
  items: readonly string[];
}

interface EvidenceStripProps {
  groups: readonly CapabilityGroup[];
}

export function EvidenceStrip({ groups }: EvidenceStripProps) {
  return (
    <section
      className="border-y border-[var(--color-divider)]"
      data-evidence-strip
      aria-label="能力证据"
    >
      <div className="page-shell grid md:grid-cols-3">
        {groups.map((group) => (
          <div
            className="grid grid-cols-[4.5rem_1fr] items-start gap-4 border-b border-[var(--color-divider)] py-5 last:border-b-0 md:block md:border-b-0 md:border-r md:px-7 md:py-7 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
            key={group.label}
          >
            <p className="m-0 text-xs font-bold tracking-[0.2em] text-[var(--color-project-hotel)]">
              {group.label}
            </p>
            <p className="m-0 text-sm leading-7 text-[var(--color-muted)] md:mt-3">
              {group.items.join(" / ")}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
