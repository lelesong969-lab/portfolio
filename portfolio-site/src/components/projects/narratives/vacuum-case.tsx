import {
  ParallelRoutes,
  type ParallelRouteItem,
} from "@/components/projects/data/parallel-routes";
import { BoundedProjectImage } from "@/components/projects/bounded-project-image";
import { EvidenceNote } from "@/components/projects/evidence-note";
import type { ProjectCase } from "@/content/types";
import { isPublicEvidence } from "@/lib/projects";

interface VacuumCaseProps {
  project: Extract<ProjectCase, { narrativeStyle: "parallel-product-routes" }>;
  section: "insights" | "outcome" | "process";
}

export function VacuumCase({ project, section }: VacuumCaseProps) {
  const narrative = project.coreNarrative;

  const userResearch = project.personalContributions.find(
    (item) => item.evidenceId === narrative.researchEvidenceId && isPublicEvidence(item),
  );
  const modeling = project.personalContributions.find(
    (item) => item.evidenceId === narrative.modelingEvidenceId && isPublicEvidence(item),
  );
  const pricing = project.personalContributions.find(
    (item) => item.evidenceId === narrative.pricingEvidenceId && isPublicEvidence(item),
  );
  const teamRoutes = project.keyEvidence.find(
    (item) => item.evidenceId === narrative.routesEvidenceId && isPublicEvidence(item),
  );

  if (section === "insights") {
    const items: readonly ParallelRouteItem[] =
      teamRoutes?.routeOptions?.map((route) => ({
        ...route,
        description: teamRoutes.teamOutput,
      })) ?? [];
    const teamMethod = project.methods.find(
      (item) => item.evidenceId === narrative.teamMethodEvidenceId && isPublicEvidence(item),
    );
    const routeMedia = project.media.find(
      (media) => media.src === narrative.routeMediaSrc,
    );

    return (
      <div className="grid gap-12">
        <section aria-labelledby="vacuum-research-role">
          <h3 id="vacuum-research-role">调研职责说明</h3>
          <p>{userResearch?.claim}</p>
          {userResearch?.publicCaveat ? (
            <EvidenceNote>{userResearch.publicCaveat}</EvidenceNote>
          ) : null}
        </section>

        <section aria-labelledby="vacuum-team-process">
          <h3 id="vacuum-team-process">团队过程</h3>
          <p>{teamMethod?.claim}</p>
        </section>

        <ParallelRoutes items={items} />
        {routeMedia ? <BoundedProjectImage media={routeMedia} /> : null}
      </div>
    );
  }

  if (section === "outcome") {
    const modelMedia = project.media.find(
      (media) => media.src === narrative.modelMediaSrc,
    );
    const mechanismMedia = project.media.find(
      (media) => media.src === narrative.mechanismMediaSrc,
    );

    return (
      <div className="grid gap-12">
        <section aria-labelledby="vacuum-modeling-expression">
          <h3 id="vacuum-modeling-expression">产品建模</h3>
          <p>{modeling?.claim}</p>
          {modelMedia ? <BoundedProjectImage media={modelMedia} /> : null}
        </section>

        <section aria-labelledby="vacuum-concept-pricing">
          <h3 id="vacuum-concept-pricing">概念定价</h3>
          <p>{pricing?.claim}</p>
          {pricing?.publicCaveat ? (
            <EvidenceNote title="定价边界">{pricing.publicCaveat}</EvidenceNote>
          ) : null}
        </section>

        <section aria-labelledby="vacuum-final-concept">
          <h3 id="vacuum-final-concept">最终概念</h3>
          <p>{project.solutionResponse.claim}</p>
          {mechanismMedia ? <BoundedProjectImage media={mechanismMedia} /> : null}
        </section>
      </div>
    );
  }

  return (
    <div>
      <EvidenceNote>{narrative.processNote}</EvidenceNote>
    </div>
  );
}
