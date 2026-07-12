import type { ProjectCase } from "@/content/types";
import { isPublicEvidence } from "@/lib/projects";

interface TeamAndContributionProps {
  project: ProjectCase;
}

export function TeamAndContribution({ project }: TeamAndContributionProps) {
  const teamOutputs = project.teamOutputs.filter(
    (item) => item.ownership === "team" && isPublicEvidence(item),
  );
  const personalContributions = project.personalContributions.filter(
    (item) => item.ownership === "personal" && isPublicEvidence(item),
  );

  return (
    <section id="my-contribution" aria-labelledby="contribution-heading">
      <h2 id="contribution-heading">团队与个人贡献</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <section
          className="border border-[var(--color-divider)] bg-[var(--color-surface)] p-6"
          aria-label="团队交付"
        >
          <h3>团队交付</h3>
          <ul className="m-0 pl-5">
            {teamOutputs.map((item) => (
              <li key={item.evidenceId}>{item.claim}</li>
            ))}
          </ul>
        </section>
        <section
          className="border border-[var(--color-divider)] bg-[var(--color-surface)] p-6"
          aria-label="我的贡献"
        >
          <h3>我的贡献</h3>
          <ul className="m-0 pl-5">
            {personalContributions.map((item) => (
              <li key={item.evidenceId}>个人职责：{item.claim}</li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}
