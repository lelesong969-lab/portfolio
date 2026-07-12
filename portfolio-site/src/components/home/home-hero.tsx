import Image from "next/image";
import Link from "next/link";

import { revealConfig } from "@/components/motion/motion-config";
import { ParallaxMedia } from "@/components/motion/parallax-media";
import { Reveal } from "@/components/motion/reveal";
import { siteContent } from "@/content/site";
import type { ProjectCase } from "@/content/types";

interface HomeHeroProps {
  project: ProjectCase;
}

export function HomeHero({ project }: HomeHeroProps) {
  const hero = project.media.find((item) => item.purpose === "hero") ?? project.media[0];

  return (
    <section
      className="page-shell grid min-h-[calc(90svh-72px)] grid-cols-1 items-center gap-10 pb-12 pt-8 md:gap-12 md:pb-16 md:pt-8 lg:grid-cols-12 lg:gap-6 lg:pt-6"
      data-home-hero
      aria-labelledby="home-heading"
    >
      <div className="order-1 lg:col-span-6 lg:pr-5">
        <Reveal delay={revealConfig.heroStagger * 0} variant="hero-text">
          <p className="mb-7 text-xs font-bold tracking-[0.18em] text-[var(--color-project-hotel)]">
            {siteContent.hero.eyebrow}
          </p>
        </Reveal>
        <Reveal delay={revealConfig.heroStagger * 1} variant="hero-text">
          <h1 id="home-heading" className="type-home-h1 mb-8 max-w-[12em]">
            {siteContent.hero.title}
          </h1>
        </Reveal>
        <Reveal delay={revealConfig.heroStagger * 2} variant="hero-text">
          <p className="mb-9 max-w-[31rem] text-base leading-8 text-[var(--color-muted)] md:text-lg">
            {siteContent.hero.description}
          </p>
        </Reveal>
        <Reveal
          className="flex flex-wrap gap-3"
          delay={revealConfig.heroStagger * 3}
          variant="hero-text"
        >
          <Link
            className="inline-flex min-h-11 items-center justify-center bg-[var(--color-text)] px-5 py-3 text-sm font-bold no-underline transition-colors hover:bg-[var(--color-project-hotel)]"
            href={siteContent.hero.primaryAction.href}
            style={{ color: "var(--color-surface)" }}
          >
            {siteContent.hero.primaryAction.label}
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center border border-[var(--color-interactive-border)] px-5 py-3 text-sm font-bold no-underline transition-colors hover:border-[var(--color-link)]"
            href={siteContent.hero.secondaryAction.href}
            prefetch={false}
          >
            {siteContent.hero.secondaryAction.label}
          </Link>
        </Reveal>
      </div>

      <Reveal
        as="figure"
        className="relative order-2 m-0 aspect-[4/3] h-auto min-h-0 overflow-hidden bg-[#d9d6ce] md:aspect-[16/10] md:h-auto lg:col-span-6 lg:aspect-auto lg:h-[min(68vh,760px)]"
        variant="hero-media"
      >
        <ParallaxMedia className="absolute inset-x-0 top-0 h-full" overscan>
          <Image
            className="h-full w-full object-contain object-center lg:object-cover lg:object-[center_55%]"
            src={hero.src}
            width={hero.width}
            height={hero.height}
            sizes="(min-width: 1024px) 58vw, 100vw"
            priority
            alt={hero.alt}
          />
        </ParallaxMedia>
        <figcaption className="absolute bottom-0 right-0 bg-[var(--color-page)] px-3 py-2 text-xs text-[var(--color-muted)]">
          {hero.caption}
        </figcaption>
      </Reveal>
    </section>
  );
}
