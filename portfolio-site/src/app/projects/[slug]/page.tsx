import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NextProject } from "@/components/projects/next-project";
import { ProjectHero } from "@/components/projects/project-hero";
import { ProjectSectionNav } from "@/components/projects/project-section-nav";
import { QuickSummary } from "@/components/projects/quick-summary";
import { TeamAndContribution } from "@/components/projects/team-and-contribution";
import { BiomaterialsCase } from "@/components/projects/narratives/biomaterials-case";
import { GloveCase } from "@/components/projects/narratives/glove-case";
import { GrinderCase } from "@/components/projects/narratives/grinder-case";
import { HotelCase } from "@/components/projects/narratives/hotel-case";
import { VacuumCase } from "@/components/projects/narratives/vacuum-case";
import { projects } from "@/content/projects";
import type { BoundedProjectMedia, ProjectCase } from "@/content/types";
import { getProjectBySlug } from "@/lib/projects";
import {
  createProjectJsonLd,
  createProjectMetadata,
  StructuredData,
} from "@/lib/seo";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

type HeroMedia = Extract<BoundedProjectMedia, { purpose: "hero" }>;
type NarrativeSection = "insights" | "outcome" | "process";

function isHeroMedia(media: BoundedProjectMedia): media is HeroMedia {
  return media.purpose === "hero";
}

export function requireHeroMedia(project: ProjectCase): HeroMedia {
  const hero = project.media.find(isHeroMedia);

  if (!hero) {
    throw new Error(`Project ${project.slug} is missing its required hero media`);
  }

  return hero;
}

function ProjectNarrative({
  project,
  section,
}: {
  project: ProjectCase;
  section: NarrativeSection;
}) {
  switch (project.narrativeStyle) {
    case "service-system":
      return <HotelCase project={project} section={section} />;
    case "parallel-product-routes":
      return <VacuumCase project={project} section={section} />;
    case "concept-brief":
      return <GloveCase project={project} section={section} />;
    case "lab-notebook":
      return <BiomaterialsCase project={project} section={section} />;
    case "editorial-product":
      return <GrinderCase project={project} section={section} />;
  }
}

function getSupportingNarrativeLabel(project: ProjectCase): string | undefined {
  switch (project.narrativeStyle) {
    case "concept-brief":
      return "手套概念提案叙事";
    case "lab-notebook":
      return "生物材料实验叙事";
    case "editorial-product":
      return "磨豆机编辑式叙事";
    default:
      return undefined;
  }
}

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return createProjectMetadata(project);
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const hero = requireHeroMedia(project);
  const supportingNarrativeLabel = getSupportingNarrativeLabel(project);

  return (
    <article className="page-shell section-space">
      <StructuredData data={createProjectJsonLd(project)} />
      <ProjectHero project={project} media={hero} />
      <QuickSummary project={project} />

      <div
        data-project-detail-layout
        className="mt-16 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-12 xl:grid-cols-12"
      >
        <ProjectSectionNav />

        <div
          data-project-detail-content
          className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-24 xl:col-span-9"
          role={supportingNarrativeLabel ? "region" : undefined}
          aria-label={supportingNarrativeLabel}
        >
          <section id="key-insights" aria-labelledby="key-insights-heading">
            <h2 id="key-insights-heading">关键洞察</h2>
            <ProjectNarrative project={project} section="insights" />
          </section>

          <section id="final-outcome" aria-labelledby="final-outcome-heading">
            <h2 id="final-outcome-heading">最终成果</h2>
            <ProjectNarrative project={project} section="outcome" />
          </section>

          <TeamAndContribution project={project} />

          <section id="full-process" aria-labelledby="full-process-heading">
            <h2 id="full-process-heading">完整过程</h2>
            <ProjectNarrative project={project} section="process" />
          </section>

          <footer className="border-t border-[var(--color-divider)] pt-8">
            <NextProject project={project} />
          </footer>
        </div>
      </div>
    </article>
  );
}
