export type NarrativeStyle =
  | "service-system"
  | "parallel-product-routes"
  | "concept-brief"
  | "lab-notebook"
  | "editorial-product";

export type VerificationStatus = "verified" | "partially_verified" | "unverified";
export type EvidenceGrade = "A" | "B" | "C" | "D";
export type Ownership = "personal" | "team" | "unknown";
export type ClaimKind = "fact" | "concept" | "benchmark" | "hypothesis";

export interface EvidenceDataPoint {
  label: string;
  value: number;
  unit: "%";
}

export interface RouteOption {
  id: string;
  label: string;
}

export interface NarrativeItem {
  id: string;
  label: string;
  description: string;
}

export interface QualitativeMapping {
  id: string;
  needId: string;
  conceptFunction: string;
  caveat: string;
}

export interface ExperimentRecord {
  id: string;
  round: number;
  sourcePage: string;
  input: string;
  observation: string;
  judgment: string;
  nextStep: string;
}

export interface ExperimentGroup {
  id: string;
  label: string;
  roundCount: number;
  records: readonly ExperimentRecord[];
}

export interface GloveSupportingNarrative {
  kind: "healing-glove";
  marketRoleEvidenceIds: readonly string[];
  needs: readonly NarrativeItem[];
  mappings: readonly QualitativeMapping[];
  mediaOrder: readonly `/projects/${string}.webp`[];
  boundaries: readonly string[];
}

export interface BiomaterialsSupportingNarrative {
  kind: "biomaterial-experiments";
  fieldLabels: readonly [string, string, string, string];
  groups: readonly ExperimentGroup[];
  sampleMediaOrder: readonly `/projects/${string}.webp`[];
  observationBoundary: string;
}

export interface GrinderMediaStage {
  id: string;
  label: string;
  description: string;
  mediaSrc?: `/projects/${string}.webp`;
}

export interface GrinderSupportingNarrative {
  kind: "coffee-grinder";
  teamInputEvidenceIds: readonly string[];
  denominatorEvidenceId: string;
  themes: readonly NarrativeItem[];
  decisionGap: string;
  personalContributionEvidenceIds: readonly string[];
  teamFormation: string;
  contextMediaSrc: `/projects/${string}.webp`;
  mediaStages: readonly GrinderMediaStage[];
}

export type SupportingNarrative =
  | GloveSupportingNarrative
  | BiomaterialsSupportingNarrative
  | GrinderSupportingNarrative;

export interface HotelCoreNarrative {
  kind: "hotel-service-system";
  dualUserTitle: string;
  dualUsers: readonly NarrativeItem[];
  researchEvidenceId: string;
  priorityItems: readonly NarrativeItem[];
  priorityCaveat: string;
  systemLayers: readonly NarrativeItem[];
  blueprintStages: readonly NarrativeItem[];
  systemMapSrc: `/projects/${string}.webp`;
  blueprintSrc: `/projects/${string}.webp`;
  usageProcessSrc: `/projects/${string}.webp`;
}

export interface CarVacuumCoreNarrative {
  kind: "car-vacuum";
  researchEvidenceId: string;
  teamMethodEvidenceId: string;
  routesEvidenceId: string;
  modelingEvidenceId: string;
  pricingEvidenceId: string;
  routeMediaSrc: `/projects/${string}.webp`;
  modelMediaSrc: `/projects/${string}.webp`;
  mechanismMediaSrc: `/projects/${string}.webp`;
  processNote: string;
}

export type CoreNarrative = HotelCoreNarrative | CarVacuumCoreNarrative;

export interface EvidencePoint {
  evidenceId: string;
  claim: string;
  projectOrExperience: string;
  teamOutput: string;
  personalContribution: string;
  method: string | null;
  result: string | null;
  sourceRefs: readonly string[];
  primarySupportSourceId: string | null;
  verificationStatus: VerificationStatus;
  evidenceGrade: EvidenceGrade;
  lastChecked: string;
  lastVerified: string | null;
  privacyLevel: "private" | "working_anonymized" | "submission";
  allowedTracks: readonly ["job_search"];
  allowedStages: readonly ("internal" | "draft" | "review" | "submission")[];
  ownership: Ownership;
  claimKind: ClaimKind;
  publicCaveat?: string;
  dataPoints?: readonly EvidenceDataPoint[];
  routeOptions?: readonly RouteOption[];
}

export type TeamEvidencePoint = EvidencePoint & { ownership: "team" };
export type PersonalEvidencePoint = EvidencePoint & { ownership: "personal" };

interface ProjectMediaBase {
  src: `/projects/${string}.webp`;
  width: number;
  height: number;
  alt: string;
  caption: string;
  maxCssWidth?: number;
  maxCssHeight?: number;
}

export type ProjectMedia =
  | (ProjectMediaBase & {
      purpose: "lightbox";
      htmlSummary: string;
    })
  | (ProjectMediaBase & {
      purpose: "hero";
      htmlSummary?: never;
    })
  | (ProjectMediaBase & {
      purpose: "evidence";
      htmlSummary?: never;
    })
  | (ProjectMediaBase & {
      purpose: "inline";
      htmlSummary?: never;
    });

export type BoundedProjectMedia = ProjectMedia & {
  maxCssWidth: number;
  maxCssHeight: number;
};

interface ProjectCaseBase {
  slug: string;
  order: number;
  featured: boolean;
  title: string;
  englishTitle?: string;
  nature: string;
  question: string;
  summary: string;
  personalContributions: readonly EvidencePoint[];
  methods: readonly EvidencePoint[];
  keyEvidence: readonly EvidencePoint[];
  solutionResponse: EvidencePoint;
  teamOutputs: readonly EvidencePoint[];
  limitations: readonly string[];
  media: readonly BoundedProjectMedia[];
  nextSlug: string | null;
}

export interface HotelProjectCase extends ProjectCaseBase {
  narrativeStyle: "service-system";
  coreNarrative: HotelCoreNarrative;
  supportingNarrative?: never;
  relationModel: "causal";
}

export interface CarVacuumProjectCase extends ProjectCaseBase {
  narrativeStyle: "parallel-product-routes";
  coreNarrative: CarVacuumCoreNarrative;
  supportingNarrative?: never;
  relationModel: "parallel";
}

export interface GloveProjectCase extends ProjectCaseBase {
  narrativeStyle: "concept-brief";
  coreNarrative?: never;
  supportingNarrative: GloveSupportingNarrative;
  relationModel: "conceptual-mapping";
}

export interface BiomaterialsProjectCase extends ProjectCaseBase {
  narrativeStyle: "lab-notebook";
  coreNarrative?: never;
  supportingNarrative: BiomaterialsSupportingNarrative;
  relationModel: "iterative";
}

export interface GrinderProjectCase extends ProjectCaseBase {
  narrativeStyle: "editorial-product";
  coreNarrative?: never;
  supportingNarrative: GrinderSupportingNarrative;
  relationModel: "chronological";
}

export type ProjectCase =
  | HotelProjectCase
  | CarVacuumProjectCase
  | GloveProjectCase
  | BiomaterialsProjectCase
  | GrinderProjectCase;
