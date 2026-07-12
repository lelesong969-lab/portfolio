import {
  PARALLEL_RELATION_NOTICE,
  PARALLEL_ROUTE_GROUP_LABEL,
} from "@/content/projects";

export interface ParallelRouteItem {
  id: string;
  label: string;
  description: string;
  caveat?: string;
}

interface ParallelRoutesProps {
  items: readonly ParallelRouteItem[];
}

export function ParallelRoutes({ items }: ParallelRoutesProps) {
  return (
    <section aria-label={PARALLEL_ROUTE_GROUP_LABEL}>
      <p className="mb-6 border-l-4 border-[var(--color-project-car)] pl-5 font-medium">
        {PARALLEL_RELATION_NOTICE}
      </p>
      <div className="grid gap-5 md:grid-cols-2">
        {items.map((item) => (
          <section
            key={item.id}
            aria-label={item.label}
            className="border border-[var(--color-divider)] bg-[var(--color-surface)] p-6"
          >
            <h3>{item.label}</h3>
            <p>{item.description}</p>
            {item.caveat ? (
              <p className="mb-0 text-sm text-[var(--color-muted)]">{item.caveat}</p>
            ) : null}
          </section>
        ))}
      </div>
    </section>
  );
}
