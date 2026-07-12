import { projects, type ProjectSlug } from "@/content/projects";
import type { EvidencePoint, ProjectCase } from "@/content/types";

export function getProjectBySlug(slug: string): ProjectCase | undefined {
  return projects.find((project) => project.slug === slug);
}

type ProjectBySlug<Slug extends ProjectSlug> = Extract<
  (typeof projects)[number],
  { slug: Slug }
>;

export function getProject<Slug extends ProjectSlug>(slug: Slug): ProjectBySlug<Slug> {
  const project = getProjectBySlug(slug);

  if (!project) {
    throw new Error(`Unknown project slug: ${slug}`);
  }

  return project as ProjectBySlug<Slug>;
}

export function getFeaturedProjects(): readonly ProjectCase[] {
  return projects.filter((project) => project.featured);
}

export function isPublicEvidence(point: EvidencePoint): boolean {
  return (
    point.verificationStatus === "verified" &&
    point.primarySupportSourceId !== null &&
    point.primarySupportSourceId.length > 0 &&
    point.sourceRefs.includes(point.primarySupportSourceId) &&
    point.lastVerified !== null &&
    point.lastVerified.length > 0 &&
    point.evidenceGrade !== "D" &&
    point.privacyLevel === "submission" &&
    point.allowedStages.includes("submission")
  );
}

export function getPublicEvidence(project: ProjectCase): readonly EvidencePoint[] {
  const seenSemanticClaims = new Set<string>();

  return [
    ...project.personalContributions,
    ...project.methods,
    ...project.keyEvidence,
    project.solutionResponse,
    ...project.teamOutputs,
  ]
    .filter(isPublicEvidence)
    .filter((point) => {
      const semanticKey =
        point.ownership === "personal"
          ? `personal:${point.personalContribution}`
          : `${point.ownership}:${point.claim}`;

      if (seenSemanticClaims.has(semanticKey)) {
        return false;
      }

      seenSemanticClaims.add(semanticKey);
      return true;
    });
}
