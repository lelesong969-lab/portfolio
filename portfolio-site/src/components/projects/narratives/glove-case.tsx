import { BoundedProjectImage } from "@/components/projects/bounded-project-image";
import { QualitativeMap } from "@/components/projects/data/qualitative-map";
import { EvidenceNote } from "@/components/projects/evidence-note";
import type { BoundedProjectMedia, ProjectCase } from "@/content/types";
import { isPublicEvidence } from "@/lib/projects";

interface GloveCaseProps {
  project: Extract<ProjectCase, { narrativeStyle: "concept-brief" }>;
  section: "insights" | "outcome" | "process";
}

export function GloveCase({ project, section }: GloveCaseProps) {
  const narrative = project.supportingNarrative;

  if (section === "insights") {
    const marketRoles = narrative.marketRoleEvidenceIds
      .map((id) =>
        project.personalContributions.find(
          (item) => item.evidenceId === id && isPublicEvidence(item),
        ),
      )
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    return (
      <div className="grid gap-12">
        <section aria-labelledby="glove-market-role">
          <h3 id="glove-market-role">市场信息职责</h3>
          <ul className="m-0 pl-5">
            {marketRoles.map((item) => (
              <li key={item.evidenceId}>{item.claim}</li>
            ))}
          </ul>
        </section>
        <QualitativeMap categories={narrative.needs} mappings={narrative.mappings} />
      </div>
    );
  }

  if (section === "outcome") {
    return (
      <div>
        <p className="type-lead">{project.solutionResponse.claim}</p>
        {project.solutionResponse.publicCaveat ? (
          <EvidenceNote title="概念边界">
            {project.solutionResponse.publicCaveat}
          </EvidenceNote>
        ) : null}
      </div>
    );
  }

  const media = narrative.mediaOrder
    .map((src) => project.media.find((item) => item.src === src))
    .filter((item): item is BoundedProjectMedia => Boolean(item));

  return (
    <div className="grid gap-12">
      {media.map((item) => (
        <BoundedProjectImage key={item.src} media={item} />
      ))}
      <section aria-labelledby="glove-validation-boundary">
        <h3 id="glove-validation-boundary">仍需验证</h3>
        <ul className="m-0 pl-5">
          {narrative.boundaries.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
