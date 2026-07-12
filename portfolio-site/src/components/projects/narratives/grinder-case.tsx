import { Lightbox } from "@/components/media/lightbox";
import { BoundedProjectImage } from "@/components/projects/bounded-project-image";
import { ResearchStream } from "@/components/projects/data/research-stream";
import { EvidenceNote } from "@/components/projects/evidence-note";
import type {
  EvidencePoint,
  PersonalEvidencePoint,
  ProjectCase,
  TeamEvidencePoint,
} from "@/content/types";
import { isPublicEvidence } from "@/lib/projects";

type GrinderProject = Extract<ProjectCase, { narrativeStyle: "editorial-product" }>;

interface GrinderCaseProps {
  project: GrinderProject;
  section: "insights" | "outcome" | "process";
}

function requireOwnedEvidence<T extends "team" | "personal">(
  evidence: readonly EvidencePoint[],
  evidenceId: string,
  ownership: T,
): T extends "team" ? TeamEvidencePoint : PersonalEvidencePoint {
  const item = evidence.find((candidate) => candidate.evidenceId === evidenceId);

  if (!item) {
    throw new Error(`Missing evidence reference: ${evidenceId}`);
  }
  if (!isPublicEvidence(item) || item.ownership !== ownership) {
    throw new TypeError(
      `Invalid evidence ownership or public status for ${evidenceId}: expected ${ownership}`,
    );
  }

  return item as T extends "team" ? TeamEvidencePoint : PersonalEvidencePoint;
}

export function GrinderCase({ project, section }: GrinderCaseProps) {
  const narrative = project.supportingNarrative;

  if (section === "insights") {
    const teamInputs = narrative.teamInputEvidenceIds.map((evidenceId) =>
      requireOwnedEvidence(project.methods, evidenceId, "team"),
    );
    const denominator = requireOwnedEvidence(
      project.keyEvidence,
      narrative.denominatorEvidenceId,
      "team",
    );

    return (
      <div className="grid gap-12">
        <ResearchStream teamInputs={teamInputs} personalOutputs={[]} />

        <section aria-labelledby="grinder-data-scope">
          <h3 id="grinder-data-scope">数据口径说明</h3>
          <p>{denominator.result ?? denominator.claim}</p>
          {denominator.publicCaveat ? (
            <EvidenceNote>{denominator.publicCaveat}</EvidenceNote>
          ) : null}
        </section>

        <section aria-labelledby="grinder-research-themes">
          <h3 id="grinder-research-themes">研究主题</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {narrative.themes.map((theme) => (
              <article
                key={theme.id}
                className="border-t-4 border-[var(--color-project-grinder)] pt-4"
              >
                <h4>{theme.label}</h4>
                <p className="mb-0">{theme.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="grinder-decision-gap">
          <h3 id="grinder-decision-gap">决策缺口</h3>
          <EvidenceNote>{narrative.decisionGap}</EvidenceNote>
        </section>
      </div>
    );
  }

  if (section === "outcome") {
    const personalOutputs = narrative.personalContributionEvidenceIds.map(
      (evidenceId) =>
        requireOwnedEvidence(project.personalContributions, evidenceId, "personal"),
    );
    const contextMedia = project.media.find(
      (item) => item.src === narrative.contextMediaSrc,
    );

    return (
      <div className="grid gap-12">
        <ResearchStream teamInputs={[]} personalOutputs={personalOutputs} />
        <section aria-labelledby="grinder-team-formation">
          <h3 id="grinder-team-formation">团队方案形成</h3>
          <p>{narrative.teamFormation}</p>
          {contextMedia ? <BoundedProjectImage media={contextMedia} /> : null}
        </section>
      </div>
    );
  }

  return (
    <div className="grid gap-12">
      {narrative.mediaStages.map((stage) => {
        const media = stage.mediaSrc
          ? project.media.find((item) => item.src === stage.mediaSrc)
          : null;

        return (
          <section key={stage.id} aria-labelledby={`grinder-stage-${stage.id}`}>
            <h3 id={`grinder-stage-${stage.id}`}>{stage.label}</h3>
            <p>{stage.description}</p>
            {media?.purpose === "lightbox" ? (
              <Lightbox media={media} />
            ) : media ? (
              <BoundedProjectImage media={media} />
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
