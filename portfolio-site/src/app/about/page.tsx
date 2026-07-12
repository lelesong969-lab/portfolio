import type { Metadata } from "next";
import Link from "next/link";

import { aboutContent } from "@/content/resume";
import { getProject, getPublicEvidence } from "@/lib/projects";
import { createStaticMetadata } from "@/lib/seo";

export const metadata: Metadata = createStaticMetadata("about");

const methodAccentClasses = [
  "border-[var(--color-project-hotel)]",
  "border-[var(--color-project-hotel)]",
  "border-[var(--color-project-hotel)]",
  "border-[var(--color-project-car)]",
] as const;

export default function AboutPage() {
  const workingMethod = aboutContent.workingMethod.map((step) => {
    const project = getProject(step.projectSlug);
    const evidence = getPublicEvidence(project).find(
      (item) => item.evidenceId === step.evidenceId,
    );

    if (!evidence) {
      throw new Error(`About method evidence is not public: ${step.evidenceId}`);
    }

    return { ...step, project, evidence };
  });

  return (
    <article className="page-shell section-space">
      <header className="grid gap-8 border-b border-[var(--color-divider)] pb-16 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <p className="mb-5 text-xs font-bold tracking-[0.2em] text-[var(--color-project-hotel)]">
            ABOUT
          </p>
          <h1 className="mb-0 max-w-[18ch]">
            从工业设计训练到证据驱动的产品判断
          </h1>
        </div>
        <p
          className="type-lead m-0 text-[var(--color-muted)] md:col-span-4"
          data-about-transition
        >
          {aboutContent.transition}
        </p>
      </header>

      <section className="pt-20" aria-labelledby="working-method-heading">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="mb-4 text-xs font-bold tracking-[0.2em] text-[var(--color-muted)]">
              WORKING METHOD
            </p>
            <h2 id="working-method-heading" className="max-w-[10ch]">
              四步工作方式
            </h2>
          </div>

          <ol
            className="m-0 grid gap-6 p-0 sm:grid-cols-2 md:col-span-8"
            aria-label="四步工作方式"
          >
            {workingMethod.map((step, index) => (
              <li
                className={`list-none border-t-4 bg-[var(--color-surface)] p-6 ${methodAccentClasses[index]}`}
                data-evidence-id={step.evidenceId}
                key={step.label}
              >
                <p className="mb-8 text-xs font-bold tracking-[0.16em] text-[var(--color-muted)]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mb-5">{step.label}</h3>
                <p className="mb-5 text-sm leading-7 text-[var(--color-muted)]">
                  {step.evidence.claim}
                </p>
                <Link
                  className="inline-flex min-h-11 items-center font-medium"
                  href={`/projects/${step.projectSlug}#${step.sectionId}`}
                  prefetch={false}
                >
                  查看{step.project.title}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </article>
  );
}
