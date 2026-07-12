import { act, cleanup, render, screen, within } from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import ProjectPage, { requireHeroMedia } from "@/app/projects/[slug]/page";
import { projects } from "@/content/projects";
import type { EvidencePoint } from "@/content/types";
import { ProjectHero } from "@/components/projects/project-hero";
import { QuickSummary } from "@/components/projects/quick-summary";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

async function renderProject(slug = "hotel-service-system") {
  return render(await ProjectPage({ params: Promise.resolve({ slug }) }));
}

describe("project detail shell", () => {
  it("uses content-defined hero media bounds without a full-width image override", () => {
    const project = projects[0];
    const media = {
      ...project.media[0],
      maxCssWidth: 731,
      maxCssHeight: 419,
    };

    render(<ProjectHero project={project} media={media} />);

    const image = screen.getByRole("img", { name: media.alt });
    const figure = image.closest("figure");
    expect(figure).toHaveStyle({ maxWidth: `${media.maxCssWidth}px` });
    expect(figure).toHaveClass("mx-auto");
    expect(image).toHaveStyle({ maxHeight: `${media.maxCssHeight}px` });
    expect(image).toHaveClass("max-w-full", "h-auto", "object-contain");
    expect(image).not.toHaveClass("w-full");
  });

  it("lets the mobile hero grid shrink below media min-content width", () => {
    const project = projects[4];
    const media = project.media.find((item) => item.purpose === "hero");
    expect(media).toBeDefined();
    if (!media || media.purpose !== "hero") throw new Error("Missing hero fixture");

    render(<ProjectHero project={project} media={media} />);

    const image = screen.getByRole("img", { name: media.alt });
    const figure = image.closest("figure");
    const header = image.closest("header");
    const textColumn = header?.firstElementChild;

    expect(header).toHaveClass(
      "grid-cols-[minmax(0,1fr)]",
      "min-w-0",
      "max-w-full",
      "lg:grid-cols-12",
    );
    expect(textColumn).toHaveClass("min-w-0", "max-w-full");
    expect(figure).toHaveClass("min-w-0", "max-w-full");
  });

  it("requires one explicit hero and never falls back to another media purpose", () => {
    const project = projects[0];
    const hero = project.media.find((item) => item.purpose === "hero");
    const withoutHero = {
      ...project,
      media: project.media.filter((item) => item.purpose !== "hero"),
    };

    expect(hero).toBeDefined();
    expect(requireHeroMedia(project)).toBe(hero);
    expect(() => requireHeroMedia(withoutHero)).toThrow(/hero/i);

    // @ts-expect-error lightbox media cannot be passed into the hero media prop
    const invalidHero: ComponentProps<typeof ProjectHero>["media"] = project.media[1];
    void invalidHero;
  });

  it("keeps the complete decision summary visible near the start", async () => {
    const view = await renderProject();
    const summary = view.container.querySelector("#quick-summary");

    expect(summary).not.toBeNull();
    for (const label of [
      "问题",
      "个人职责",
      "关键证据",
      "方案回应",
      "最终成果",
      "边界",
    ]) {
      expect(within(summary as HTMLElement).getByText(label)).toBeVisible();
    }
    expect(
      within(summary as HTMLElement).getByText(
        "门口为何成为住客与保洁共同的高摩擦触点？",
      ),
    ).toBeVisible();
    expect(
      within(summary as HTMLElement).getByText("负责实地调研"),
    ).toBeVisible();
  });

  it("separates team delivery from verified personal contribution", async () => {
    const view = await renderProject();
    const contribution = view.container.querySelector("#my-contribution");

    expect(contribution).not.toBeNull();
    const team = within(contribution as HTMLElement).getByRole("region", {
      name: "团队交付",
    });
    const personal = within(contribution as HTMLElement).getByRole("region", {
      name: "我的贡献",
    });
    expect(within(team).getByText(/团队交付酒店门把手/)).toBeVisible();
    expect(within(personal).getByText(/负责实地调研/)).toBeVisible();
    expect(within(personal).queryByText(/团队交付酒店门把手/)).toBeNull();
  });

  it("offers five stable chapter anchors in the approved order", async () => {
    const view = await renderProject();
    const nav = view.container.querySelector("[data-project-section-nav]");

    expect(nav).not.toBeNull();
    const links = within(nav as HTMLElement).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual([
      "快速摘要",
      "关键洞察",
      "最终成果",
      "我的贡献",
      "完整过程",
    ]);
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "#quick-summary",
      "#key-insights",
      "#final-outcome",
      "#my-contribution",
      "#full-process",
    ]);
    for (const id of [
      "quick-summary",
      "key-insights",
      "final-outcome",
      "my-contribution",
      "full-process",
    ]) {
      expect(view.container.querySelector(`#${id}`)).not.toBeNull();
    }
  });

  it("keeps the horizontal sticky chapter bar through 1024px and uses a long sticky parent", async () => {
    const view = await renderProject();
    const layout = view.container.querySelector("[data-project-detail-layout]");
    const nav = view.container.querySelector("[data-project-section-nav]");

    expect(layout).not.toBeNull();
    expect(nav).not.toBeNull();
    expect(nav?.parentElement).toBe(layout);
    expect(nav).toHaveClass("self-start", "xl:col-span-3");
    expect(nav).not.toHaveClass("lg:col-span-3");

    const list = nav?.querySelector("ol");
    expect(list).toHaveClass("flex", "xl:flex-col");
    expect(list).not.toHaveClass("lg:flex-col");
    expect(layout?.querySelector("#full-process")).not.toBeNull();
  });

  it("lets the mobile detail grid shrink around the full-bleed chapter bar", async () => {
    const view = await renderProject("coffee-grinder");
    const layout = view.container.querySelector("[data-project-detail-layout]");
    const content = layout?.querySelector("[data-project-detail-content]");

    expect(layout).toHaveClass("grid-cols-[minmax(0,1fr)]", "min-w-0");
    expect(content).toHaveClass("min-w-0", "grid-cols-[minmax(0,1fr)]");
  });

  it("tracks the intersecting section and disconnects its observer on unmount", async () => {
    const observe = vi.fn();
    const disconnect = vi.fn();
    let observerCallback: IntersectionObserverCallback | undefined;

    class ObserverMock {
      constructor(callback: IntersectionObserverCallback) {
        observerCallback = callback;
      }

      observe = observe;
      disconnect = disconnect;
      unobserve = vi.fn();
      takeRecords = vi.fn(() => []);
      root = null;
      rootMargin = "";
      thresholds = [];
    }

    vi.stubGlobal("IntersectionObserver", ObserverMock);
    const view = await renderProject();
    const target = view.container.querySelector("#final-outcome");

    expect(target).not.toBeNull();
    expect(observe).toHaveBeenCalledWith(target);
    expect(observerCallback).toBeDefined();

    act(() => {
      observerCallback?.(
        [
          {
            isIntersecting: true,
            target,
            boundingClientRect: { top: 100 },
          } as unknown as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver,
      );
    });

    expect(screen.getByRole("link", { name: "最终成果" })).toHaveAttribute(
      "aria-current",
      "location",
    );
    expect(screen.getByRole("link", { name: "快速摘要" })).not.toHaveAttribute(
      "aria-current",
    );

    view.unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it("offsets anchors below both fixed bars until the 1280px desktop layout", () => {
    const css = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");

    expect(css).toMatch(/--project-anchor-offset:\s*160px/);
    expect(css).toMatch(/scroll-margin-top:\s*var\(--project-anchor-offset\)/);
    expect(css).toMatch(
      /@media\s*\(min-width:\s*1280px\)[\s\S]*--project-anchor-offset:\s*96px/,
    );
  });

  it("follows the approved next-project chain and returns the final case to overview", async () => {
    for (const [slug, nextHref] of [
      ["hotel-service-system", "/projects/car-vacuum"],
      ["car-vacuum", "/projects/healing-glove"],
      ["healing-glove", "/projects/biomaterial-experiments"],
      ["biomaterial-experiments", "/projects/coffee-grinder"],
    ] as const) {
      const view = await renderProject(slug);
      expect(screen.getByRole("link", { name: /下一个项目/ })).toHaveAttribute(
        "href",
        nextHref,
      );
      view.unmount();
    }

    await renderProject("coffee-grinder");
    expect(screen.getByRole("link", { name: "返回项目总览" })).toHaveAttribute(
      "href",
      "/projects",
    );
  });

  it("omits unverified years and filters non-public evidence from the summary", () => {
    const project = projects[0];
    const hiddenEvidence: EvidencePoint = {
      ...project.keyEvidence[0],
      evidenceId: "hidden-evidence",
      claim: "不得公开的测试证据",
      verificationStatus: "unverified",
      evidenceGrade: "D",
      primarySupportSourceId: null,
      lastVerified: null,
      privacyLevel: "working_anonymized",
      allowedStages: ["internal", "draft", "review"],
    };

    render(
      <QuickSummary
        project={{
          ...project,
          keyEvidence: [...project.keyEvidence, hiddenEvidence],
        }}
      />,
    );

    expect(screen.queryByText("不得公开的测试证据")).not.toBeInTheDocument();
    expect(screen.queryByText(/年份|待核实时间/)).not.toBeInTheDocument();
  });

  it("renders approved complex-diagram summaries outside the dialog instead of reusing alt", async () => {
    const project = projects[0];
    const complexMedia = project.media.filter((item) => item.purpose === "lightbox");
    await renderProject(project.slug);

    for (const media of complexMedia) {
      expect(media.htmlSummary.trim()).not.toBe("");
      expect(media.htmlSummary).not.toBe(media.alt);
      const summary = screen.getByText(media.htmlSummary);
      expect(summary.closest("dialog")).toBeNull();
    }
  });
});
