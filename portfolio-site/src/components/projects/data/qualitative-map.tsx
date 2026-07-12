import type { NarrativeItem, QualitativeMapping } from "@/content/types";

interface QualitativeMapProps {
  categories: readonly NarrativeItem[];
  mappings: readonly QualitativeMapping[];
}

export function QualitativeMap({ categories, mappings }: QualitativeMapProps) {
  const categoryById = new Map(categories.map((item) => [item.id, item]));

  return (
    <section aria-label="定性需求地图" className="grid gap-10">
      <div>
        <h3>定性需求类别</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {categories.map((item) => (
            <article
              key={item.id}
              className="border-t-4 border-[var(--color-project-glove)] pt-4"
            >
              <h4>{item.label}</h4>
              <p className="mb-0">{item.description}</p>
            </article>
          ))}
        </div>
      </div>

      <div>
        <h3>需求到概念功能映射</h3>
        <dl className="m-0 grid gap-4">
          {mappings.map((item) => (
            <div
              key={item.id}
              className="grid gap-2 border border-[var(--color-divider)] p-5 sm:grid-cols-[minmax(8rem,0.7fr)_1fr]"
            >
              <dt className="font-bold">{categoryById.get(item.needId)?.label}</dt>
              <dd className="m-0">
                <p className="mb-1">{item.conceptFunction}</p>
                <p className="mb-0 text-sm text-[var(--color-muted)]">{item.caveat}</p>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
