import type { ProjectCase } from "@/content/types";
import { isPublicEvidence } from "@/lib/projects";

interface QuickSummaryProps {
  project: ProjectCase;
}

export function QuickSummary({ project }: QuickSummaryProps) {
  const roles = project.personalContributions.filter(isPublicEvidence);
  const evidence = project.keyEvidence.filter(isPublicEvidence).slice(0, 3);
  const solution = isPublicEvidence(project.solutionResponse)
    ? project.solutionResponse
    : null;
  const outcomes = project.teamOutputs.filter(isPublicEvidence);

  return (
    <section
      id="quick-summary"
      className="mt-20 border-y border-[var(--color-divider)] py-10"
      aria-labelledby="quick-summary-heading"
    >
      <h2 id="quick-summary-heading">快速摘要</h2>
      <dl className="m-0 grid gap-x-8 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="mb-2 font-bold">问题</dt>
          <dd className="m-0">{project.question}</dd>
        </div>
        <div>
          <dt className="mb-2 font-bold">个人职责</dt>
          <dd className="m-0">
            <ul className="m-0 pl-5">
              {roles.map((item) => (
                <li key={item.evidenceId}>{item.claim}</li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt className="mb-2 font-bold">关键证据</dt>
          <dd className="m-0">
            <ul className="m-0 pl-5">
              {evidence.map((item) => (
                <li key={item.evidenceId}>{item.result ?? item.claim}</li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt className="mb-2 font-bold">方案回应</dt>
          <dd className="m-0">{solution?.claim}</dd>
        </div>
        <div>
          <dt className="mb-2 font-bold">最终成果</dt>
          <dd className="m-0">
            <ul className="m-0 pl-5">
              {outcomes.map((item) => (
                <li key={item.evidenceId}>{item.claim}</li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt className="mb-2 font-bold">边界</dt>
          <dd className="m-0">
            <ul className="m-0 pl-5">
              {project.limitations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>
    </section>
  );
}
