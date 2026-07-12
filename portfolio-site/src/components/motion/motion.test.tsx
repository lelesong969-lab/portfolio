import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { useContext, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MotionConfigContext } from "motion/react";

import Template from "@/app/template";
import HomePage from "@/app/page";
import {
  pageTransitionConfig,
  parallaxMediaConfig,
  revealConfig,
} from "@/components/motion/motion-config";
import { MotionProvider } from "@/components/motion/motion-provider";
import { PageTransition } from "@/components/motion/page-transition";
import { ParallaxMedia } from "@/components/motion/parallax-media";
import { Reveal } from "@/components/motion/reveal";

beforeEach(() => {
  setMotionEnvironment({ desktop: false, reducedMotion: false });
  vi.stubGlobal(
    "IntersectionObserver",
    class IntersectionObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function setMotionEnvironment({
  desktop,
  reducedMotion,
}: {
  desktop: boolean;
  reducedMotion: boolean;
}) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("prefers-reduced-motion")
        ? reducedMotion
        : desktop,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

function setMutableMotionEnvironment() {
  const state = { desktop: true, reducedMotion: false };
  const listeners = new Map<string, Set<() => void>>();
  const mediaQueries = new Map<string, MediaQueryList>();

  const matchMedia = vi.fn((query: string) => {
    const existing = mediaQueries.get(query);
    if (existing) {
      return existing;
    }

    const queryListeners = new Set<() => void>();
    listeners.set(query, queryListeners);
    const mediaQuery = {
      get matches() {
        return query.includes("prefers-reduced-motion")
          ? state.reducedMotion
          : state.desktop;
      },
      media: query,
      onchange: null,
      addEventListener: (_type: string, listener: () => void) => {
        queryListeners.add(listener);
      },
      removeEventListener: (_type: string, listener: () => void) => {
        queryListeners.delete(listener);
      },
      addListener: (listener: () => void) => {
        queryListeners.add(listener);
      },
      removeListener: (listener: () => void) => {
        queryListeners.delete(listener);
      },
      dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList;
    mediaQueries.set(query, mediaQuery);
    return mediaQuery;
  });

  vi.stubGlobal("matchMedia", matchMedia);

  return {
    setReducedMotion(value: boolean) {
      state.reducedMotion = value;
      for (const [query, queryListeners] of listeners) {
        if (query.includes("prefers-reduced-motion")) {
          for (const listener of queryListeners) {
            listener();
          }
        }
      }
    },
  };
}

function MotionPreferenceProbe() {
  const { reducedMotion } = useContext(MotionConfigContext);

  return <output>{reducedMotion}</output>;
}

function AllMotionSurfaces({ children }: { children?: ReactNode }) {
  return (
    <MotionProvider>
      <Reveal>{children ?? "Reveal content"}</Reveal>
      <ParallaxMedia>{children ?? "Parallax content"}</ParallaxMedia>
      <PageTransition>{children ?? "Page content"}</PageTransition>
    </MotionProvider>
  );
}

describe("motion accessibility contract", () => {
  it("keeps every enhanced surface visible in server and initial HTML", () => {
    const markup = renderToStaticMarkup(<AllMotionSurfaces />);

    expect(markup).toContain("Reveal content");
    expect(markup).toContain("Parallax content");
    expect(markup).toContain("Page content");
    expect(markup).not.toMatch(/opacity\s*:\s*0(?:[;\"]|$)/);

    const view = render(<AllMotionSurfaces />);
    for (const selector of [
      "[data-motion]",
      "[data-parallax]",
      "[data-page-transition]",
    ]) {
      const element = view.container.querySelector(selector);
      expect(element).toBeVisible();
      expect(element).not.toHaveStyle({ opacity: "0" });
    }
  });

  it("keeps MotionConfig tied to the user's reduced-motion preference", () => {
    setMotionEnvironment({ desktop: true, reducedMotion: true });

    render(
      <MotionProvider>
        <MotionPreferenceProbe />
      </MotionProvider>,
    );

    expect(screen.getByText("user")).toBeInTheDocument();
  });

  it("does not activate parallax on phones", async () => {
    setMotionEnvironment({ desktop: false, reducedMotion: false });
    const view = render(<HomePage />);

    await waitFor(() => {
      const parallax = view.container.querySelector("[data-parallax]");
      expect(parallax).toHaveAttribute(
        "data-parallax-active",
        "false",
      );
      expect(parallax).not.toHaveClass("-top-[1.5%]", "h-[103%]");
      expect(parallax).not.toHaveStyle({ top: "-1.5%", height: "103%" });
    });
  });

  it("removes movement, delays and smooth scrolling for reduced motion", () => {
    setMotionEnvironment({ desktop: true, reducedMotion: true });
    const view = render(
      <MotionProvider>
        <Reveal>Reveal content</Reveal>
        <ParallaxMedia>Parallax content</ParallaxMedia>
        <PageTransition>Page content</PageTransition>
      </MotionProvider>,
    );

    for (const selector of [
      "[data-motion]",
      "[data-parallax]",
      "[data-page-transition]",
    ]) {
      const element = view.container.querySelector(selector) as HTMLElement;
      expect(element.style.transform).not.toMatch(/translate|scale/);
      expect(element.style.transitionDelay).toBe("");
      expect(element.style.animationDelay).toBe("");
    }

    expect(
      view.container.querySelector("[data-parallax]"),
    ).toHaveAttribute("data-parallax-active", "false");

    const css = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");
    const reducedMotionBlock = css.match(
      /@media \(prefers-reduced-motion: reduce\) \{([\s\S]*)\}\s*$/,
    )?.[1];

    expect(reducedMotionBlock).toBeDefined();
    expect(reducedMotionBlock).toMatch(/scroll-behavior:\s*auto/);
    expect(reducedMotionBlock).toContain("[data-motion]");
    expect(reducedMotionBlock).toContain("[data-parallax]");
    expect(reducedMotionBlock).toContain("[data-page-transition]");
    expect(reducedMotionBlock).toMatch(/transition-delay:\s*0s/);
    expect(reducedMotionBlock).toMatch(/animation-delay:\s*0s/);
    expect(reducedMotionBlock).toMatch(/opacity:\s*1\s*!important/);
    expect(reducedMotionBlock).toMatch(/transform:\s*none/);
    expect(reducedMotionBlock).not.toMatch(/(^|,)\s*\*/m);
  });
});

describe("motion runtime safety", () => {
  it("keeps pure configuration outside client component modules", () => {
    const configPath = resolve(
      process.cwd(),
      "src/components/motion/motion-config.ts",
    );
    const homeHeroSource = readFileSync(
      resolve(process.cwd(), "src/components/home/home-hero.tsx"),
      "utf8",
    );
    const configSource = existsSync(configPath)
      ? readFileSync(configPath, "utf8")
      : "";

    expect(existsSync(configPath)).toBe(true);
    expect(configSource).not.toMatch(/^\s*["']use client["']/);
    expect(homeHeroSource).toContain(
      'from "@/components/motion/motion-config"',
    );
    expect(homeHeroSource).not.toMatch(
      /import\s*\{[^}]*revealConfig[^}]*\}\s*from\s*"@\/components\/motion\/reveal"/,
    );
  });

  it("matches visible SSR styles to the client first frame without a reverse jump", () => {
    const surfaces = (
      <>
        <Reveal variant="hero-text">Hero</Reveal>
        <Reveal>Scroll</Reveal>
        <PageTransition>Page</PageTransition>
      </>
    );
    const markup = renderToStaticMarkup(surfaces);
    const server = document.createElement("div");
    server.innerHTML = markup;
    const client = render(surfaces);

    for (const selector of [
      '[data-motion="hero-text"]',
      '[data-motion="reveal"]',
      "[data-page-transition]",
    ]) {
      const serverElement = server.querySelector(selector) as HTMLElement;
      const clientElement = client.container.querySelector(selector) as HTMLElement;
      expect(serverElement.style.opacity).toBe("0.94");
      expect(clientElement.style.opacity).toBe(serverElement.style.opacity);
      expect(clientElement.style.transform).toBe(serverElement.style.transform);
    }

    expect(
      (server.querySelector('[data-motion="hero-text"]') as HTMLElement).style
        .transform,
    ).toContain("8px");
    expect(
      (server.querySelector('[data-motion="reveal"]') as HTMLElement).style
        .transform,
    ).toContain("16px");

    for (const file of ["reveal.tsx", "page-transition.tsx"]) {
      expect(
        readFileSync(
          resolve(process.cwd(), `src/components/motion/${file}`),
          "utf8",
        ),
      ).not.toContain("requestAnimationFrame");
    }
  });

  it("updates all motion surfaces in both directions when the user preference changes", async () => {
    const environment = setMutableMotionEnvironment();
    const view = render(
      <MotionProvider>
        <Reveal variant="hero-text">Reveal</Reveal>
        <PageTransition>Page</PageTransition>
        <ParallaxMedia overscan>Parallax</ParallaxMedia>
      </MotionProvider>,
    );
    const reveal = view.container.querySelector("[data-motion]");
    const page = view.container.querySelector("[data-page-transition]");
    const parallax = view.container.querySelector("[data-parallax]");

    await waitFor(() => {
      expect(reveal).toHaveAttribute("data-motion-runtime", "normal");
      expect(page).toHaveAttribute("data-page-transition-runtime", "normal");
      expect(parallax).toHaveAttribute("data-parallax-active", "true");
      expect(parallax).toHaveStyle({ top: "-1.5%", height: "103%" });
    });

    act(() => environment.setReducedMotion(true));
    await waitFor(() => {
      expect(reveal).toHaveAttribute("data-motion-runtime", "reduced");
      expect(reveal).toHaveAttribute("data-motion-runtime-duration", "0");
      expect(page).toHaveAttribute("data-page-transition-runtime", "reduced");
      expect(page).toHaveAttribute("data-page-transition-runtime-duration", "0");
      expect(parallax).toHaveAttribute("data-parallax-active", "false");
      expect(parallax).not.toHaveStyle({ top: "-1.5%", height: "103%" });
    });

    act(() => environment.setReducedMotion(false));
    await waitFor(() => {
      expect(reveal).toHaveAttribute("data-motion-runtime", "normal");
      expect(page).toHaveAttribute("data-page-transition-runtime", "normal");
      expect(parallax).toHaveAttribute("data-parallax-active", "true");
      expect(parallax).toHaveStyle({ top: "-1.5%", height: "103%" });
    });
  });
});

describe("motion integration", () => {
  it("wraps route content in the non-blocking page transition", () => {
    const view = render(
      <Template>
        <h1>Route content</h1>
      </Template>,
    );

    expect(screen.getByRole("heading", { name: "Route content" })).toBeVisible();
    expect(view.container.querySelector("[data-page-transition]")).toBeVisible();
  });

  it("uses shared motion wrappers for the home hero and featured work", () => {
    const view = render(<HomePage />);
    const hero = view.container.querySelector("[data-home-hero]") as HTMLElement;
    const featured = view.container.querySelector("#featured-projects") as HTMLElement;

    expect(hero.querySelectorAll('[data-motion="hero-text"]')).toHaveLength(4);
    expect(hero.querySelector('[data-motion="hero-media"]')).toBeVisible();
    expect(featured.querySelector('[data-motion="reveal"]')).toBeVisible();
  });

  it("keeps project information visible while hover motion stays restrained", () => {
    const view = render(<HomePage />);
    const cards = view.container.querySelectorAll("[data-project-card]");
    expect(cards).toHaveLength(3);

    for (const card of cards) {
      expect(card.textContent).toContain("已核实工作");
      const image = card.querySelector("img");
      const arrow = Array.from(card.querySelectorAll("span")).find(
        (element) => element.textContent === "↗",
      );
      expect(image).toHaveClass(
        "duration-[220ms]",
        "group-hover:scale-[1.02]",
        "motion-reduce:duration-0",
        "motion-reduce:group-hover:scale-none",
        "motion-reduce:transform-none",
      );
      expect(arrow).toHaveClass(
        "duration-[220ms]",
        "group-hover:translate-x-[6px]",
        "motion-reduce:duration-0",
        "motion-reduce:group-hover:translate-none",
        "motion-reduce:transform-none",
      );
    }

    const supportingImages = view.container.querySelectorAll(
      "[data-more-projects] a.group img",
    );
    expect(supportingImages).toHaveLength(2);
    for (const image of supportingImages) {
      expect(image).toHaveClass(
        "duration-[220ms]",
        "group-hover:scale-[1.02]",
        "motion-reduce:duration-0",
        "motion-reduce:group-hover:scale-none",
        "motion-reduce:transform-none",
      );
    }

    const supportingArrows = view.container.querySelectorAll(
      '[data-more-projects] a.group span[aria-hidden="true"]',
    );
    expect(supportingArrows).toHaveLength(2);
    for (const arrow of supportingArrows) {
      expect(arrow).toHaveClass(
        "duration-[220ms]",
        "group-hover:translate-x-[6px]",
        "motion-reduce:duration-0",
        "motion-reduce:group-hover:translate-none",
        "motion-reduce:transform-none",
      );
    }
  });
});

describe("motion parameter contract", () => {
  it("freezes the restrained values used by each motion component", () => {
    expect(Object.isFrozen(revealConfig)).toBe(true);
    expect(revealConfig.heroDuration).toBeGreaterThanOrEqual(0.52);
    expect(revealConfig.heroDuration).toBeLessThanOrEqual(0.6);
    expect(revealConfig.heroStagger).toBe(0.06);
    expect(revealConfig.revealDuration).toBe(0.42);
    expect(revealConfig.revealDistance).toBe(16);
    expect(revealConfig.viewportOnce).toBe(true);

    expect(Object.isFrozen(pageTransitionConfig)).toBe(true);
    expect(pageTransitionConfig.duration).toBe(0.34);
    expect(pageTransitionConfig.distance).toBe(8);

    expect(Object.isFrozen(parallaxMediaConfig)).toBe(true);
    expect(parallaxMediaConfig.breakpoint).toBe(1024);
    expect(parallaxMediaConfig.range).toEqual(["-1.5%", "1.5%"]);
    expect(Object.isFrozen(parallaxMediaConfig.range)).toBe(true);
  });

  it("renders the shared hero, reveal, page and parallax values at their consumers", () => {
    const home = render(<HomePage />);
    const heroLines = Array.from(
      home.container.querySelectorAll('[data-motion="hero-text"]'),
    );
    expect(heroLines.map((line) => line.getAttribute("data-motion-delay"))).toEqual([
      "0",
      "0.06",
      "0.12",
      "0.18",
    ]);
    for (const line of heroLines) {
      expect(line).toHaveAttribute(
        "data-motion-duration",
        String(revealConfig.heroDuration),
      );
    }

    const reveal = home.container.querySelector('[data-motion="reveal"]');
    expect(reveal).toHaveAttribute(
      "data-motion-duration",
      String(revealConfig.revealDuration),
    );
    expect(reveal).toHaveAttribute(
      "data-motion-distance",
      String(revealConfig.revealDistance),
    );
    expect(reveal).toHaveAttribute("data-motion-once", "true");

    const parallax = home.container.querySelector("[data-parallax]");
    expect(parallax).toHaveAttribute("data-parallax-breakpoint", "1024");
    expect(parallax).toHaveAttribute("data-parallax-range", "-1.5%,1.5%");

    cleanup();
    const page = render(
      <PageTransition>
        <span>Page</span>
      </PageTransition>,
    ).container.querySelector("[data-page-transition]");
    expect(page).toHaveAttribute(
      "data-page-transition-duration",
      String(pageTransitionConfig.duration),
    );
    expect(page).toHaveAttribute(
      "data-page-transition-distance",
      String(pageTransitionConfig.distance),
    );
  });
});
