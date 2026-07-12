import { Lightbox } from "@/components/media/lightbox";
import { BoundedProjectImage } from "@/components/projects/bounded-project-image";
import { EvidenceBars } from "@/components/projects/data/evidence-bars";
import { EvidenceNote } from "@/components/projects/evidence-note";
import type { EvidencePoint, ProjectCase } from "@/content/types";
import { isPublicEvidence } from "@/lib/projects";

interface HotelCaseProps {
  project: Extract<ProjectCase, { narrativeStyle: "service-system" }>;
  section: "insights" | "outcome" | "process";
}

type SurveySeries = EvidencePoint & {
  dataPoints: NonNullable<EvidencePoint["dataPoints"]>;
};

function isSurveySeries(item: EvidencePoint): item is SurveySeries {
  return Boolean(item.dataPoints?.length) && isPublicEvidence(item);
}

export function HotelCase({ project, section }: HotelCaseProps) {
  const narrative = project.coreNarrative;

  if (section === "insights") {
    const questionnaireScope = project.keyEvidence.find(
      (item) => item.evidenceId === narrative.researchEvidenceId,
    );
    const surveySeries = project.keyEvidence.filter(isSurveySeries);

    return (
      <div className="grid gap-14">
        <section aria-labelledby="hotel-dual-users">
          <h3 id="hotel-dual-users">{narrative.dualUserTitle}</h3>
          <div className="grid gap-5 md:grid-cols-2">
            {narrative.dualUsers.map((user) => (
              <p key={user.id} className="border-t border-[var(--color-divider)] pt-4">
                <strong>{user.label}：</strong>{user.description}
              </p>
            ))}
          </div>
        </section>

        {questionnaireScope && isPublicEvidence(questionnaireScope) ? (
          <section aria-labelledby="hotel-research-scope">
            <h3 id="hotel-research-scope">研究口径</h3>
            <p>{questionnaireScope.claim}</p>
            {questionnaireScope.result ? <p>{questionnaireScope.result}</p> : null}
            {questionnaireScope.publicCaveat ? (
              <EvidenceNote>{questionnaireScope.publicCaveat}</EvidenceNote>
            ) : null}
          </section>
        ) : null}

        <EvidenceBars series={surveySeries} />

        <section aria-labelledby="hotel-priority-frame">
          <h3 id="hotel-priority-frame">问题优先级整理框架</h3>
          <ol className="grid gap-3 pl-5 sm:grid-cols-2">
            {narrative.priorityItems.map((item) => (
              <li key={item.id}>{item.label}：{item.description}</li>
            ))}
          </ol>
          <EvidenceNote>{narrative.priorityCaveat}</EvidenceNote>
        </section>
      </div>
    );
  }

  if (section === "outcome") {
    const systemMap = project.media.find(
      (media): media is Extract<(typeof project.media)[number], { purpose: "lightbox" }> =>
        media.src === narrative.systemMapSrc && media.purpose === "lightbox",
    );
    const blueprint = project.media.find(
      (media): media is Extract<(typeof project.media)[number], { purpose: "lightbox" }> =>
        media.src === narrative.blueprintSrc && media.purpose === "lightbox",
    );

    return (
      <div className="grid gap-14">
        <div className="grid gap-5 md:grid-cols-3" aria-label="酒店服务系统三层结构">
          {narrative.systemLayers.map((layer) => (
            <section key={layer.id} className="border-t-4 border-[var(--color-project-hotel)] pt-5">
              <h3>{layer.label}</h3>
              <p className="mb-0">{layer.description}</p>
            </section>
          ))}
        </div>

        {systemMap ? <Lightbox media={systemMap} /> : null}
        {blueprint ? <Lightbox media={blueprint} /> : null}
      </div>
    );
  }

  const usageProcess = project.media.find(
    (media) => media.src === narrative.usageProcessSrc,
  );

  return (
    <div className="grid gap-12">
      <section
        aria-label="服务蓝图纵向阶段摘要"
        className="grid gap-5 md:grid-cols-2"
      >
        {narrative.blueprintStages.map((stage) => (
          <article key={stage.id} className="border border-[var(--color-divider)] p-5">
            <h3>{stage.label}</h3>
            <p className="mb-0">{stage.description}</p>
          </article>
        ))}
      </section>

      {usageProcess ? <BoundedProjectImage media={usageProcess} /> : null}
    </div>
  );
}
