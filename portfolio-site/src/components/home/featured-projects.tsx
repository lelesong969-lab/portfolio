import type { ProjectCase } from "@/content/types";
import { Reveal } from "@/components/motion/reveal";
import { ProjectCard } from "@/components/projects/project-card";

interface FeaturedProjectsProps {
  projects: readonly ProjectCase[];
}

export function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  const [lead, second, third] = projects;

  return (
    <section
      id="featured-projects"
      className="page-shell section-space"
      aria-labelledby="featured-heading"
    >
      <Reveal className="mb-16 grid gap-5 md:grid-cols-12 md:items-end">
        <div className="md:col-span-7">
          <p className="mb-4 text-xs font-bold tracking-[0.2em] text-[var(--color-project-hotel)]">
            SELECTED WORK
          </p>
          <h2 id="featured-heading" className="mb-0">
            三种把信息转化为方向的路径
          </h2>
        </div>
        <p className="m-0 max-w-[34rem] text-sm leading-7 text-[var(--color-muted)] md:col-span-5">
          从现场研究、信息整理到概念表达，以下项目优先呈现问题、已核实角色与团队输出。
        </p>
      </Reveal>

      {lead ? <ProjectCard project={lead} layout="wide" /> : null}

      <div className="mt-24 grid gap-16 md:grid-cols-12 md:items-start md:gap-6">
        {second ? (
          <div className="md:col-span-7">
            <ProjectCard project={second} layout="landscape" />
          </div>
        ) : null}
        {third ? (
          <div className="md:col-span-5 md:mt-28">
            <ProjectCard project={third} layout="portrait" />
          </div>
        ) : null}
      </div>
    </section>
  );
}
