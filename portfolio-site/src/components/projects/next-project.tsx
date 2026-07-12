import Link from "next/link";

import type { ProjectCase } from "@/content/types";
import { getProjectBySlug } from "@/lib/projects";

interface NextProjectProps {
  project: ProjectCase;
}

export function NextProject({ project }: NextProjectProps) {
  const nextProject = project.nextSlug ? getProjectBySlug(project.nextSlug) : null;

  if (!nextProject) {
    return (
      <Link
        className="inline-flex min-h-11 items-center text-lg font-bold"
        href="/projects"
      >
        返回项目总览
      </Link>
    );
  }

  return (
    <Link
      className="inline-flex min-h-11 items-center text-lg font-bold"
      href={`/projects/${nextProject.slug}`}
    >
      下一个项目：{nextProject.title} →
    </Link>
  );
}
