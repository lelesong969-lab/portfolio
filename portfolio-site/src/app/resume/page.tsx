import type { Metadata } from "next";
import Link from "next/link";

import { ContactPrivacyNotice } from "@/components/site/contact-privacy-notice";
import { projects } from "@/content/projects";
import { resumeContent } from "@/content/resume";
import { isPublicEvidence } from "@/lib/projects";
import { createStaticMetadata } from "@/lib/seo";

export const metadata: Metadata = createStaticMetadata("resume");

export default function ResumePage() {
  const projectSummaries = resumeContent.projectSummaries.map((summary) => {
    const project = projects.find((item) => item.slug === summary.slug);

    if (!project) {
      throw new Error(`Resume project is missing: ${summary.slug}`);
    }

    const personalContributions = project.personalContributions.filter(
      (item) => item.ownership === "personal" && isPublicEvidence(item),
    );

    return { ...summary, project, personalContributions };
  });

  return (
    <article className="page-shell section-space">
      <header className="grid gap-8 border-b border-[var(--color-divider)] pb-16 md:grid-cols-12 md:items-end">
        <div className="md:col-span-7">
          <p className="mb-5 text-xs font-bold tracking-[0.2em] text-[var(--color-project-hotel)]">
            HTML RESUME
          </p>
          <h1 className="mb-6">{resumeContent.name}</h1>
          <p className="type-lead mb-0">{resumeContent.positioning}</p>
        </div>

        <dl className="m-0 grid gap-5 border-l border-[var(--color-divider)] pl-6 md:col-span-5">
          <div>
            <dt className="text-xs font-bold tracking-[0.16em] text-[var(--color-muted)]">
              主方向
            </dt>
            <dd className="m-0 mt-1 text-lg font-bold">
              {resumeContent.primaryDirection}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold tracking-[0.16em] text-[var(--color-muted)]">
              次方向
            </dt>
            <dd className="m-0 mt-2">
              <ul className="m-0 flex flex-wrap gap-x-5 gap-y-1 p-0" aria-label="次方向">
                {resumeContent.secondaryDirections.map((direction) => (
                  <li className="list-none" key={direction}>
                    {direction}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
      </header>

      <section className="grid gap-8 border-b border-[var(--color-divider)] py-20 md:grid-cols-12" aria-labelledby="resume-method-heading">
        <div className="md:col-span-4">
          <h2 id="resume-method-heading" className="max-w-[10ch]">
            工作方法
          </h2>
        </div>
        <ol className="m-0 grid gap-4 p-0 sm:grid-cols-2 md:col-span-8">
          {resumeContent.workingMethod.map((step, index) => (
            <li
              className="list-none border-t-2 border-[var(--color-project-hotel)] pt-4"
              key={step}
            >
              <span className="mr-3 text-xs font-bold text-[var(--color-muted)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section className="py-20" aria-labelledby="resume-projects-heading">
        <div className="mb-12 grid gap-6 md:grid-cols-12">
          <h2 id="resume-projects-heading" className="mb-0 md:col-span-7">
            项目摘要与个人职责
          </h2>
          <p className="m-0 text-sm leading-7 text-[var(--color-muted)] md:col-span-5">
            以下职责仅呈现已经核实并允许公开的个人贡献；团队成果仍保留团队归属。
          </p>
        </div>

        <ul className="m-0 grid gap-0 p-0" aria-label="项目摘要与个人职责">
          {projectSummaries.map(({ project, summary, personalContributions }, index) => (
            <li
              className="list-none border-t border-[var(--color-divider)] py-10"
              key={project.slug}
            >
              <article className="grid gap-7 md:grid-cols-12">
                <div className="md:col-span-1">
                  <p className="m-0 text-xs font-bold tracking-[0.16em] text-[var(--color-muted)]">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                </div>
                <div className="md:col-span-5">
                  <h3 className="mb-3">
                    <Link href={`/projects/${project.slug}`} prefetch={false}>
                      {project.title}
                    </Link>
                  </h3>
                  <p className="m-0 text-sm leading-7 text-[var(--color-muted)]">
                    {summary}
                  </p>
                </div>
                <div className="md:col-span-6">
                  <p className="mb-3 text-xs font-bold tracking-[0.16em] text-[var(--color-muted)]">
                    已核实个人职责
                  </p>
                  <ul className="m-0 grid gap-2 pl-5">
                    {personalContributions.map((contribution) => (
                      <li key={contribution.evidenceId}>{contribution.claim}</li>
                    ))}
                  </ul>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-[var(--color-divider)] pt-16" aria-labelledby="contact-heading">
        <div className="grid gap-8 md:grid-cols-12">
          <h2 id="contact-heading" className="mb-0 md:col-span-4">
            联系方式
          </h2>
          <div className="md:col-span-8">
            <ContactPrivacyNotice />
          </div>
        </div>
      </section>
    </article>
  );
}
