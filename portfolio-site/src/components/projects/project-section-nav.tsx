"use client";

import { useEffect, useState } from "react";

const sections = [
  ["quick-summary", "快速摘要"],
  ["key-insights", "关键洞察"],
  ["final-outcome", "最终成果"],
  ["my-contribution", "我的贡献"],
  ["full-process", "完整过程"],
] as const;

export function ProjectSectionNav() {
  const [current, setCurrent] = useState<(typeof sections)[number][0]>(
    sections[0][0],
  );

  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

        if (visible) {
          setCurrent(visible.target.id as (typeof sections)[number][0]);
        }
      },
      { rootMargin: "-20% 0px -65%", threshold: 0 },
    );

    for (const [id] of sections) {
      const target = document.getElementById(id);
      if (target) observer.observe(target);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <nav
      data-project-section-nav
      aria-label="项目章节"
      className="sticky top-[72px] z-20 -mx-5 self-start overflow-x-auto border-y border-[var(--color-divider)] bg-[var(--color-page)] px-5 py-3 xl:top-24 xl:col-span-3 xl:mx-0 xl:border-y-0 xl:px-0 xl:py-0"
    >
      <ol className="m-0 flex min-w-max gap-6 p-0 xl:min-w-0 xl:flex-col xl:gap-2">
        {sections.map(([id, label]) => (
          <li key={id} className="list-none">
            <a
              className="inline-flex min-h-11 items-center text-sm font-medium no-underline"
              href={`#${id}`}
              aria-current={current === id ? "location" : undefined}
            >
              {label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
