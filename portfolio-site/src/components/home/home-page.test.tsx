import { cleanup, render, screen, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import HomePage from "@/app/page";
import { EvidenceStrip } from "@/components/home/evidence-strip";

afterEach(cleanup);

function renderHomePage() {
  return render(<HomePage />);
}

describe("home page", () => {
  it("establishes the candidate positioning and a single primary visual", () => {
    const view = renderHomePage();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "从用户、场景与数据中，找到可执行的方向。",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/宋乐扬｜工业设计背景/)).toBeInTheDocument();
    expect(screen.getByText("工业设计 × 用户研究 × 产品判断")).toBeInTheDocument();

    const hero = view.container.querySelector("[data-home-hero]");
    expect(hero).not.toBeNull();
    expect(within(hero as HTMLElement).getAllByRole("img")).toHaveLength(1);
    expect(
      screen.getByRole("link", { name: "查看精选项目" }),
    ).toHaveAttribute("href", "#featured-projects");
    expect(
      within(hero as HTMLElement).getByRole("link", { name: "简历与联系方式" }),
    ).toHaveAttribute("href", "/resume");
  });

  it("keeps the primary call to action readable against its dark background", () => {
    renderHomePage();
    const primaryAction = screen.getByRole("link", { name: "查看精选项目" });

    expect(primaryAction).toHaveStyle({ color: "var(--color-surface)" });
  });

  it("keeps tablet layouts stacked and postpones the 5:7 crop to desktop", () => {
    const view = renderHomePage();
    const hero = view.container.querySelector("[data-home-hero]");
    const figure = hero?.querySelector("figure");
    const image = figure?.querySelector("img");

    expect(hero).toHaveClass("lg:grid-cols-12");
    expect(hero).not.toHaveClass("md:grid-cols-12");
    expect(figure).toHaveClass("md:aspect-[16/10]", "md:h-auto");
    expect(figure).toHaveClass("lg:aspect-auto", "lg:h-[min(68vh,760px)]");
    expect(image).toHaveClass("object-contain", "lg:object-cover");
    expect(image).toHaveAttribute("sizes", "(min-width: 1024px) 58vw, 100vw");
  });

  it("keeps the horizontal glove artwork complete inside the portrait card", () => {
    const view = renderHomePage();
    const portraitImage = view.container.querySelector(
      '[data-project-layout="portrait"] img',
    );

    expect(portraitImage).toHaveAttribute(
      "alt",
      "老年疗愈智能手套概念插画",
    );
    expect(portraitImage).toHaveClass("object-contain");
    expect(portraitImage).not.toHaveClass("object-cover");
  });

  it("keeps the wide project media inside the tablet grid without stretch overflow", () => {
    const view = renderHomePage();
    const wideCard = view.container.querySelector('[data-project-layout="wide"]');
    const layout = wideCard?.firstElementChild;
    const mediaLink = wideCard?.querySelector('a[aria-label^="查看案例"]');

    expect(layout).toHaveClass("md:items-start");
    expect(layout).not.toHaveClass("md:items-stretch");
    expect(mediaLink).toHaveClass("w-full", "min-w-0");
  });

  it("shows a continuous research, organization and delivery evidence strip", () => {
    const view = renderHomePage();

    const strip = view.container.querySelector("[data-evidence-strip]");
    expect(strip).not.toBeNull();
    for (const label of ["研究", "整理", "落地"]) {
      expect(within(strip as HTMLElement).getByText(label)).toBeInTheDocument();
    }
    expect(within(strip as HTMLElement).getByText(/用户调研/)).toBeInTheDocument();
    expect(within(strip as HTMLElement).getByText(/服务蓝图/)).toBeInTheDocument();
    expect(within(strip as HTMLElement).getByText(/产品建模/)).toBeInTheDocument();
  });

  it("renders evidence stage labels from content without index-based aliases", () => {
    render(
      <EvidenceStrip
        groups={[
          { label: "发现", items: ["现场"] },
          { label: "结构", items: ["归纳"] },
          { label: "行动", items: ["验证"] },
        ]}
      />,
    );

    expect(screen.getByText("发现")).toBeInTheDocument();
    expect(screen.getByText("结构")).toBeInTheDocument();
    expect(screen.getByText("行动")).toBeInTheDocument();
    expect(screen.queryByText("研究")).not.toBeInTheDocument();
    expect(screen.queryByText("落地")).not.toBeInTheDocument();
  });

  it("orders three featured projects and keeps verified roles visible", () => {
    const view = renderHomePage();

    const featured = view.container.querySelector("#featured-projects");
    expect(featured).not.toBeNull();
    const cards = within(featured as HTMLElement).getAllByRole("article");
    expect(cards).toHaveLength(3);

    const titles = cards.map(
      (card) => within(card).getByRole("heading", { level: 3 }).textContent,
    );
    expect(titles).toEqual([
      "酒店门把手与服务系统",
      "车载吸尘器",
      "老年疗愈智能手套",
    ]);

    expect(within(cards[0]).getByText("负责实地调研")).toBeVisible();
    expect(within(cards[0]).getByText("负责服务蓝图撰写")).toBeVisible();
    expect(within(cards[1]).getByText("负责用户调研")).toBeVisible();
    expect(within(cards[1]).getByText("负责产品建模")).toBeVisible();
    expect(within(cards[2]).getByText("负责市场调研")).toBeVisible();
    expect(within(cards[2]).getByText("负责数据分析")).toBeVisible();
  });

  it("keeps two supporting projects lightweight and exposes safe next actions", () => {
    const view = renderHomePage();

    const more = view.container.querySelector("[data-more-projects]");
    expect(more).not.toBeNull();
    expect(
      within(more as HTMLElement).getByRole("link", { name: /生物材料实验/ }),
    ).toBeInTheDocument();
    expect(
      within(more as HTMLElement).getByRole("link", { name: /手摇咖啡磨豆机/ }),
    ).toBeInTheDocument();
    expect(
      within(more as HTMLElement).getByRole("link", { name: "查看全部项目" }),
    ).toHaveAttribute("href", "/projects");
    expect(screen.queryByRole("link", { name: /下载/ })).not.toBeInTheDocument();
    expect(view.container.querySelector('a[href^="mailto:"]')).toBeNull();
  });

  it("does not introduce disallowed portfolio patterns", () => {
    const view = renderHomePage();

    expect(view.container.querySelector('[aria-roledescription="carousel"]')).toBeNull();
    expect(view.container.querySelector('[role="progressbar"]')).toBeNull();
    expect(view.container.querySelector("[data-logo-cloud]")).toBeNull();
    expect(view.container.querySelector("[data-uniform-five-grid]")).toBeNull();
  });

  it("disables prefetch for every link to a route not built at this checkpoint", () => {
    const expectedPrefetchCounts = new Map([
      ["src/components/home/home-hero.tsx", 1],
      ["src/components/projects/project-card.tsx", 3],
      ["src/components/home/more-projects.tsx", 4],
      ["src/components/site/site-header.tsx", 1],
      ["src/components/site/mobile-menu.tsx", 1],
      ["src/components/site/site-footer.tsx", 1],
    ]);

    for (const [file, expectedCount] of expectedPrefetchCounts) {
      const source = readFileSync(resolve(process.cwd(), file), "utf8");
      expect(source.match(/prefetch=\{false\}/g)?.length ?? 0, file).toBe(
        expectedCount,
      );
    }
  });
});
