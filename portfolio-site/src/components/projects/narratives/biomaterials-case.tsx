import { BoundedProjectImage } from "@/components/projects/bounded-project-image";
import { ExperimentTimeline } from "@/components/projects/data/experiment-timeline";
import { EvidenceNote } from "@/components/projects/evidence-note";
import type { BoundedProjectMedia, ProjectCase } from "@/content/types";

interface BiomaterialsCaseProps {
  project: Extract<ProjectCase, { narrativeStyle: "lab-notebook" }>;
  section: "insights" | "outcome" | "process";
}

export function BiomaterialsCase({ project, section }: BiomaterialsCaseProps) {
  const narrative = project.supportingNarrative;

  if (section === "insights") {
    return (
      <ExperimentTimeline
        fieldLabels={narrative.fieldLabels}
        groups={narrative.groups}
      />
    );
  }

  if (section === "outcome") {
    const sampleMedia = narrative.sampleMediaOrder
      .map((src) => project.media.find((item) => item.src === src))
      .filter((item): item is BoundedProjectMedia => Boolean(item));

    return (
      <div className="grid gap-12">
        <p className="type-lead">{project.solutionResponse.claim}</p>
        <div className="grid items-start gap-8 md:grid-cols-2">
          {sampleMedia.map((item) => (
            <BoundedProjectImage key={item.src} media={item} />
          ))}
        </div>
      </div>
    );
  }

  return <EvidenceNote title="观察边界">{narrative.observationBoundary}</EvidenceNote>;
}
