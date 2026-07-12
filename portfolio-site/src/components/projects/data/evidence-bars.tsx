import type { EvidenceDataPoint, EvidencePoint } from "@/content/types";

type EvidenceSeries = EvidencePoint & {
  dataPoints: readonly EvidenceDataPoint[];
};

interface EvidenceBarsProps {
  series: readonly EvidenceSeries[];
}

export function EvidenceBars({ series }: EvidenceBarsProps) {
  return (
    <div className="grid gap-10">
      {series.map((item) => (
        <section
          key={item.evidenceId}
          aria-label={item.claim}
          className="border-t border-[var(--color-divider)] pt-5"
        >
          <table className="w-full border-collapse">
            <caption className="mb-4 text-left text-[length:var(--size-h3)] font-medium text-[var(--color-text)]">
              {item.claim}
            </caption>
            <thead>
              <tr className="border-b border-[var(--color-divider)] text-left">
                <th className="pb-3 pr-4" scope="col">选项</th>
                <th className="pb-3" scope="col">原版比例</th>
              </tr>
            </thead>
            <tbody>
              {item.dataPoints.map((point) => (
                <tr key={point.label} className="border-b border-[var(--color-divider)]">
                  <th className="py-4 pr-4 text-left font-normal" scope="row">
                    {point.label}
                  </th>
                  <td className="py-4">
                    <div className="grid grid-cols-[1fr_4rem] items-center gap-4">
                      <meter
                        className="h-3 w-full"
                        min={0}
                        max={100}
                        value={point.value}
                        aria-label={`${point.label} ${point.value}${point.unit}`}
                      />
                      <span className="font-bold tabular-nums text-right">
                        {point.value}{point.unit}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}
