import type { ExperimentGroup } from "@/content/types";

interface ExperimentTimelineProps {
  fieldLabels: readonly [string, string, string, string];
  groups: readonly ExperimentGroup[];
}

export function ExperimentTimeline({
  fieldLabels,
  groups,
}: ExperimentTimelineProps) {
  return (
    <section aria-label="实验迭代时间线" className="grid gap-12">
      {groups.map((group) => (
        <section
          key={group.id}
          aria-label={`${group.label} ${group.roundCount} 轮`}
          className="border-l-4 border-[var(--color-project-biomaterials)] pl-6"
        >
          <h3>{group.label} · {group.roundCount} 轮</h3>
          <div className="grid gap-6">
            {group.records.map((record) => (
              <article
                key={record.id}
                className="border-t border-[var(--color-divider)] pt-5"
              >
                <h4>第 {record.round} 轮</h4>
                <p className="text-sm text-[var(--color-muted)]">
                  来源页：{record.sourcePage}
                </p>
                <dl className="m-0 grid gap-4 md:grid-cols-2">
                  {[
                    [fieldLabels[0], record.input],
                    [fieldLabels[1], record.observation],
                    [fieldLabels[2], record.judgment],
                    [fieldLabels[3], record.nextStep],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="mb-1 font-bold">{label}</dt>
                      <dd className="m-0">{value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}
