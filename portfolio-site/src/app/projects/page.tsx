import type { Metadata } from "next";

import type { ProjectCardLayout } from "@/components/projects/project-card";
import { ProjectCard } from "@/components/projects/project-card";
import { projects } from "@/content/projects";
import { createStaticMetadata } from "@/lib/seo";

export const metadata: Metadata = createStaticMetadata("projects");

const overviewLayouts: readonly {
  layout: ProjectCardLayout;
  wrapperClassName: string;
}[] = [
  { layout: "wide", wrapperClassName: "" },
  { layout: "landscape", wrapperClassName: "xl:col-span-7" },
  { layout: "portrait", wrapperClassName: "xl:col-span-5 xl:mt-28" },
  { layout: "portrait", wrapperClassName: "xl:col-span-5 xl:mt-20" },
  { layout: "landscape", wrapperClassName: "xl:col-span-7" },
];

function OverviewItem({ index }: { index: number }) {
  const project = projects[index];
  const presentation = overviewLayouts[index];

  return (
    <div
      className={presentation.wrapperClassName}
      data-testid="project-overview-item"
      data-project-slug={project.slug}
    >
      <ProjectCard
        project={project}
        layout={presentation.layout}
        headingLevel={2}
      />
      <p
        className="m-0 mt-5 max-w-[44rem] border-l-2 border-[var(--color-divider)] pl-4 text-sm leading-7 text-[var(--color-muted)]"
        data-project-summary
      >
        {project.summary}
      </p>
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <section className="page-shell section-space" aria-labelledby="projects-heading">
      <header className="mb-20 grid gap-6 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <p className="mb-4 text-xs font-bold tracking-[0.2em] text-[var(--color-project-hotel)]">
            ALL PROJECTS
          </p>
          <h1 id="projects-heading" className="mb-0 max-w-[18ch]">
            五个项目，五种从信息到方案的路径
          </h1>
        </div>
        <p className="m-0 max-w-[32rem] text-sm leading-7 text-[var(--color-muted)] md:col-span-4">
          按项目性质、已核实职责与证据边界阅读每个案例。
        </p>
      </header>

      <OverviewItem index={0} />

      <div className="mt-24 grid gap-x-6 gap-y-20 md:grid-cols-2 xl:grid-cols-12 xl:gap-y-28">
        {projects.slice(1).map((project, offset) => (
          <OverviewItem key={project.slug} index={offset + 1} />
        ))}
      </div>
    </section>
  );
}
