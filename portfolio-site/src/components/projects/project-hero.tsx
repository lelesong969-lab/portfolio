import Image from "next/image";
import Link from "next/link";

import type { BoundedProjectMedia, ProjectCase } from "@/content/types";

interface ProjectHeroProps {
  project: ProjectCase;
  media: Extract<BoundedProjectMedia, { purpose: "hero" }>;
}

function HeroMedia({ media }: { media: BoundedProjectMedia }) {
  return (
    <figure
      className="mx-auto m-0 w-full min-w-0 max-w-full lg:col-span-7"
      style={{ maxWidth: `${media.maxCssWidth}px` }}
    >
      <div className="flex justify-center overflow-hidden bg-[var(--color-surface)]">
        <Image
          className="mx-auto h-auto max-w-full object-contain"
          src={media.src}
          width={media.width}
          height={media.height}
          sizes="(min-width: 1024px) 58vw, 100vw"
          alt={media.alt}
          style={{
            width: "auto",
            height: "auto",
            maxWidth: `${media.maxCssWidth}px`,
            maxHeight: `${media.maxCssHeight}px`,
          }}
        />
      </div>
      <figcaption className="mt-3">{media.caption}</figcaption>
    </figure>
  );
}

export function ProjectHero({ project, media }: ProjectHeroProps) {
  return (
    <header className="grid min-w-0 max-w-full grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-12 lg:items-end">
      <div className="min-w-0 max-w-full lg:col-span-5">
        <Link
          className="mb-12 inline-flex min-h-11 items-center py-2 text-sm font-medium"
          href="/projects"
        >
          ← 返回项目总览
        </Link>
        <p className="mb-5 text-sm font-bold tracking-[0.12em] text-[var(--color-muted)]">
          {project.nature}
        </p>
        <h1 className="mb-5">{project.title}</h1>
        {project.englishTitle ? (
          <p className="mb-8 text-sm text-[var(--color-muted)]">{project.englishTitle}</p>
        ) : null}
        <p className="type-lead mb-0">{project.summary}</p>
      </div>

      <HeroMedia media={media} />
    </header>
  );
}
