import type {
  PersonalEvidencePoint,
  TeamEvidencePoint,
} from "@/content/types";

interface ResearchStreamProps {
  teamInputs: readonly TeamEvidencePoint[];
  personalOutputs: readonly PersonalEvidencePoint[];
}

function StreamItems({
  entries,
}: {
  entries: readonly (TeamEvidencePoint | PersonalEvidencePoint)[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {entries.map((item) => (
        <article
          key={item.evidenceId}
          className="border-t border-[var(--color-divider)] pt-4"
        >
          <h4>{item.claim}</h4>
          {item.method ? <p className="mb-0">{item.method}</p> : null}
        </article>
      ))}
    </div>
  );
}

export function ResearchStream({
  teamInputs,
  personalOutputs,
}: ResearchStreamProps) {
  if (teamInputs.some((item) => item.ownership !== "team")) {
    throw new TypeError("ResearchStream team input ownership must be team");
  }
  if (personalOutputs.some((item) => item.ownership !== "personal")) {
    throw new TypeError("ResearchStream personal output ownership must be personal");
  }

  return (
    <div className="grid gap-10">
      {teamInputs.length ? (
        <section aria-label="团队研究输入">
          <h3>团队研究输入</h3>
          <StreamItems entries={teamInputs} />
        </section>
      ) : null}
      {personalOutputs.length ? (
        <section aria-label="我的设计输出">
          <h3>我的设计输出</h3>
          <StreamItems entries={personalOutputs} />
        </section>
      ) : null}
    </div>
  );
}
