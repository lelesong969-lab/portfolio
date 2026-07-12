import Image from "next/image";
import Link from "next/link";

import type { ProjectCase, ProjectMedia } from "@/content/types";
import { isPublicEvidence } from "@/lib/projects";

export type ProjectCardLayout = "wide" | "landscape" | "portrait";
export type ProjectCardHeadingLevel = 2 | 3;

interface ProjectCardProps {
  project: ProjectCase;
  layout: ProjectCardLayout;
  headingLevel?: ProjectCardHeadingLevel;
}

const layoutStyles: Record<
  ProjectCardLayout,
  { body: string; figure: string; mediaSizes: string }
> = {
  wide: {
    body: "md:grid md:grid-cols-12 md:items-start md:gap-8",
    figure: "w-full min-w-0 aspect-[8/5] md:col-span-7",
    mediaSizes: "(max-width: 767px) 100vw, 58vw",
  },
  landscape: {
    body: "flex h-full flex-col",
    figure: "aspect-[4/3]",
    mediaSizes: "(max-width: 767px) 100vw, 58vw",
  },
  portrait: {
    body: "flex h-full flex-col",
    figure: "aspect-[5/6]",
    mediaSizes: "(max-width: 767px) 100vw, 42vw",
  },
};

function getHeroMedia(project: ProjectCase): ProjectMedia {
  return project.media.find((item) => item.purpose === "hero") ?? project.media[0];
}

export function ProjectCard({
  project,
  layout,
  headingLevel = 3,
}: ProjectCardProps) {
  const media = getHeroMedia(project);
  const verifiedRoles = project.personalContributions.filter(isPublicEvidence);
  const primaryMethod = project.methods.find(isPublicEvidence);
  const teamOutput = project.teamOutputs.find(isPublicEvidence);
  const styles = layoutStyles[layout];
  const imageFit =
    layout === "portrait" || media.height > media.width
      ? "object-contain"
      : "object-cover";
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <article
      className="border-t border-[var(--color-divider)] pt-5"
      data-project-card
      data-project-layout={layout}
    >
      <div className={styles.body}>
        <Link
          className={`group relative overflow-hidden bg-[#e8e5de] ${styles.figure}`}
          href={`/projects/${project.slug}`}
          prefetch={false}
          aria-label={`查看案例：${project.title}`}
        >
          <Image
            className={`h-full w-full ${imageFit} transition-transform duration-[220ms] group-hover:scale-[1.02] motion-reduce:duration-0 motion-reduce:group-hover:scale-none motion-reduce:transition-none motion-reduce:transform-none`}
            src={media.src}
            width={media.width}
            height={media.height}
            sizes={styles.mediaSizes}
            alt={media.alt}
          />
          <span className="absolute bottom-0 left-0 bg-[var(--color-page)] px-3 py-2 text-xs font-medium text-[var(--color-muted)]">
            {media.caption}
          </span>
        </Link>

        <div
          className={
            layout === "wide"
              ? "flex min-w-0 flex-col justify-between py-6 md:col-span-5 md:py-3"
              : "flex flex-1 flex-col pt-6"
          }
        >
          <div>
            <p className="mb-5 flex items-center gap-3 text-xs font-bold tracking-[0.16em] text-[var(--color-muted)]">
              <span>{String(project.order).padStart(2, "0")}</span>
              <span aria-hidden="true" className="h-px w-8 bg-[var(--color-divider)]" />
              <span>{project.nature}</span>
            </p>
            <Heading className="mb-4 text-2xl font-bold leading-tight md:text-3xl">
              <Link
                className="no-underline"
                href={`/projects/${project.slug}`}
                prefetch={false}
              >
                {project.title}
              </Link>
            </Heading>
            <p className="mb-7 text-lg leading-relaxed text-[var(--color-text)]">
              {project.question}
            </p>
          </div>

          <dl className="mb-7 border-y border-[var(--color-divider)] text-sm leading-relaxed">
            <div className="grid grid-cols-[5rem_1fr] gap-3 border-b border-[var(--color-divider)] py-3">
              <dt className="font-medium text-[var(--color-muted)]">已核实工作</dt>
              <dd className="m-0 flex flex-wrap gap-x-3 gap-y-1">
                {verifiedRoles.map((role) => (
                  <span key={role.evidenceId}>{role.claim}</span>
                ))}
              </dd>
            </div>
            {primaryMethod ? (
              <div className="grid grid-cols-[5rem_1fr] gap-3 border-b border-[var(--color-divider)] py-3">
                <dt className="font-medium text-[var(--color-muted)]">方法</dt>
                <dd className="m-0">{primaryMethod.method ?? primaryMethod.claim}</dd>
              </div>
            ) : null}
            {teamOutput ? (
              <div className="grid grid-cols-[5rem_1fr] gap-3 py-3">
                <dt className="font-medium text-[var(--color-muted)]">团队输出</dt>
                <dd className="m-0">{teamOutput.claim}</dd>
              </div>
            ) : null}
          </dl>

          <Link
            className="group inline-flex min-h-11 w-fit items-center gap-3 border-b border-[var(--color-text)] font-medium no-underline transition-colors hover:border-[var(--color-link)]"
            href={`/projects/${project.slug}`}
            prefetch={false}
          >
            查看案例
            <span
              aria-hidden="true"
              className="transition-transform duration-[220ms] group-hover:translate-x-[6px] motion-reduce:duration-0 motion-reduce:group-hover:translate-none motion-reduce:transition-none motion-reduce:transform-none"
            >
              ↗
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}
