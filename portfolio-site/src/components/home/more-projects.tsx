import Image from "next/image";
import Link from "next/link";

import { publicContactPrivacyMessage, resumeContent } from "@/content/resume";
import type { ProjectCase } from "@/content/types";
import { isPublicEvidence } from "@/lib/projects";

interface MoreProjectsProps {
  projects: readonly ProjectCase[];
}

export function MoreProjects({ projects }: MoreProjectsProps) {
  return (
    <>
      <section
        className="page-shell pb-24 md:pb-36"
        data-more-projects
        aria-labelledby="more-projects-heading"
      >
        <div className="mb-9 flex flex-wrap items-end justify-between gap-5 border-b border-[var(--color-divider)] pb-6">
          <h2 id="more-projects-heading" className="mb-0">
            更多项目
          </h2>
          <Link
            className="min-h-11 py-2 font-medium"
            href="/projects"
            prefetch={false}
          >
            查看全部项目
          </Link>
        </div>

        <div>
          {projects.map((project) => {
            const media = project.media.find((item) => item.purpose === "hero") ?? project.media[0];
            const roles = project.personalContributions.filter(isPublicEvidence);

            return (
              <Link
                className="group grid min-h-28 grid-cols-[2.5rem_minmax(0,1fr)_4rem] items-center gap-3 border-b border-[var(--color-divider)] py-5 no-underline sm:grid-cols-[3rem_minmax(0,1fr)_5rem] sm:gap-4 md:grid-cols-[5rem_minmax(0,1fr)_18rem] md:gap-6"
                href={`/projects/${project.slug}`}
                prefetch={false}
                key={project.slug}
                aria-label={`查看案例：${project.title}`}
              >
                <span className="text-xs font-bold tracking-[0.16em] text-[var(--color-muted)]">
                  {String(project.order).padStart(2, "0")}
                </span>
                <span>
                  <span className="flex items-start gap-1 text-base font-bold sm:gap-3 sm:text-lg md:text-2xl">
                    <span>{project.title}</span>
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-[220ms] group-hover:translate-x-[6px] motion-reduce:duration-0 motion-reduce:group-hover:translate-none motion-reduce:transition-none motion-reduce:transform-none"
                    >
                      ↗
                    </span>
                  </span>
                  <span className="mt-1 hidden text-sm text-[var(--color-muted)] sm:block">
                    {roles.map((role) => role.claim).join(" / ")}
                  </span>
                </span>
                <span className="relative block aspect-[16/7] overflow-hidden bg-[#e8e5de]">
                  <Image
                    className="h-full w-full object-cover transition-transform duration-[220ms] group-hover:scale-[1.02] motion-reduce:duration-0 motion-reduce:group-hover:scale-none motion-reduce:transition-none motion-reduce:transform-none"
                    src={media.src}
                    width={media.width}
                    height={media.height}
                    sizes="(max-width: 767px) 80px, 288px"
                    alt={media.alt}
                  />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="bg-[var(--color-text)] text-[var(--color-surface)]" aria-labelledby="about-cta-heading">
        <div className="page-shell grid gap-12 py-20 md:grid-cols-12 md:items-end md:py-28">
          <div className="md:col-span-8">
            <p className="mb-5 text-xs font-bold tracking-[0.2em] text-[#a9c7df]">ABOUT THE WORK</p>
            <h2 id="about-cta-heading" className="mb-6 max-w-[16ch] text-[var(--color-surface)]">
              从工业设计训练到证据驱动的产品判断
            </h2>
            <p className="m-0 max-w-[44rem] text-base leading-8 text-[#c9cbc8]">
              {resumeContent.positioning}
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 md:col-span-4 md:items-end">
            <Link
              className="inline-flex min-h-11 items-center border-b border-[#a9c7df] py-2 font-bold text-[var(--color-surface)] no-underline hover:text-[#a9c7df]"
              href="/about"
              prefetch={false}
            >
              了解更多
            </Link>
            <Link
              className="inline-flex min-h-11 items-center border-b border-[#a9c7df] py-2 font-bold text-[var(--color-surface)] no-underline hover:text-[#a9c7df]"
              href="/resume"
              prefetch={false}
            >
              简历与联系方式
            </Link>
            <p className="m-0 max-w-72 text-left text-xs leading-6 text-[#9fa39f] md:text-right">
              {publicContactPrivacyMessage}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
