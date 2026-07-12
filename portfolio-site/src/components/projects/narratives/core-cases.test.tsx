import { cleanup, render, screen, within } from "@testing-library/react";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import ProjectPage from "@/app/projects/[slug]/page";
import { BoundedProjectImage } from "@/components/projects/bounded-project-image";
import { ParallelRoutes } from "@/components/projects/data/parallel-routes";
import { HotelCase } from "@/components/projects/narratives/hotel-case";
import { VacuumCase } from "@/components/projects/narratives/vacuum-case";
import * as projectContent from "@/content/projects";
import { getProject } from "@/lib/projects";

afterEach(cleanup);

async function renderProject(slug: "hotel-service-system" | "car-vacuum") {
  return render(await ProjectPage({ params: Promise.resolve({ slug }) }));
}

function readSource(path: string) {
  const fullPath = resolve(process.cwd(), path);
  return existsSync(fullPath) ? readFileSync(fullPath, "utf8") : "";
}

describe("hotel service-system narrative", () => {
  it("renders the survey scope, four source-locked series, and denominator boundary", async () => {
    const hotel = getProject("hotel-service-system");
    const view = await renderProject("hotel-service-system");

    expect(screen.getAllByText(/总体收到 30 份问卷记录/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/单题有效分母待核验/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/不换算人数/).length).toBeGreaterThan(0);
    expect(view.container.textContent).not.toContain("n=30");

    const structuredSeries = hotel.keyEvidence.filter((item) => item.dataPoints);
    expect(structuredSeries).toHaveLength(4);

    for (const item of structuredSeries) {
      const title = item.claim;
      const values = item.dataPoints?.map((point) => point.value) ?? [];
      const region = screen.getByRole("region", { name: title });
      const table = within(region).getByRole("table", { name: title });
      expect(within(table).getByRole("columnheader", { name: "选项" })).toBeVisible();
      expect(within(table).getByRole("columnheader", { name: "原版比例" })).toBeVisible();
      expect(within(table).getAllByRole("row")).toHaveLength(values.length + 1);
      expect(table.querySelectorAll("meter")).toHaveLength(values.length);
      for (const value of values) {
        expect(within(table).getAllByText(`${value}%`).length).toBeGreaterThan(0);
      }
    }
  });

  it("renders hotel narrative copy from a replaceable content record", () => {
    const hotel = getProject("hotel-service-system");
    const coreNarrative =
      hotel.coreNarrative?.kind === "hotel-service-system"
        ? hotel.coreNarrative
        : null;

    expect(coreNarrative?.kind).toBe("hotel-service-system");
    expect(coreNarrative?.dualUserTitle).toBe("住客与保洁的双用户场景");
    if (!coreNarrative) return;

    const sentinel = "临时替换的住客行为说明";
    const modified = {
      ...hotel,
      coreNarrative: {
        ...coreNarrative,
        dualUsers: [
          { ...coreNarrative.dualUsers[0], description: sentinel },
          ...coreNarrative.dualUsers.slice(1),
        ],
      },
    };
    render(<HotelCase project={modified} section="insights" />);

    expect(screen.getByText(sentinel)).toBeVisible();
  });

  it("keeps the service-system layers, blueprint, mobile HTML summary, and ownership boundary explicit", async () => {
    await renderProject("hotel-service-system");

    expect(screen.getByText("住客与保洁的双用户场景")).toBeVisible();
    expect(screen.getByText("实体触点")).toBeVisible();
    expect(screen.getByText("房态信息")).toBeVisible();
    expect(screen.getByText("服务响应")).toBeVisible();
    expect(screen.getAllByText("团队服务蓝图").length).toBeGreaterThan(0);

    const mobileSummary = screen.getByRole("region", { name: "服务蓝图纵向阶段摘要" });
    for (const label of ["住客动作", "前台触点", "后台响应", "未验证事项"]) {
      expect(within(mobileSummary).getByText(label)).toBeVisible();
    }

    const contribution = screen.getByRole("region", { name: "我的贡献" });
    for (const responsibility of [
      "负责实地调研",
      "负责服务蓝图撰写",
      "负责调研数据整理框架搭建",
    ]) {
      expect(within(contribution).getByText(new RegExp(responsibility))).toBeVisible();
    }
    expect(screen.getByRole("region", { name: "团队交付" })).toBeVisible();
  });
});

describe("car-vacuum parallel narrative", () => {
  it("uses one shared bounded renderer for ordinary project images", () => {
    const shared = readSource("src/components/projects/bounded-project-image.tsx");
    expect(shared).toMatch(/BoundedProjectMedia/);
    expect(shared).toMatch(/maxCssWidth/);
    expect(shared).toMatch(/maxCssHeight/);
    expect(shared).toMatch(/figcaption/);

    for (const path of [
      "src/components/projects/narratives/hotel-case.tsx",
      "src/components/projects/narratives/vacuum-case.tsx",
      "src/components/projects/narratives/glove-case.tsx",
      "src/components/projects/narratives/biomaterials-case.tsx",
      "src/components/projects/narratives/grinder-case.tsx",
    ]) {
      const source = readSource(path);
      expect(source, path).not.toMatch(/function ProjectImage/);
      expect(source, path).toMatch(/BoundedProjectImage/);
    }
  });

  it("keeps shared image bounds, alt text, classes, and caption content-driven", () => {
    const sourceMedia = getProject("car-vacuum").media.find(
      (item) => item.purpose === "inline",
    );
    expect(sourceMedia).toBeDefined();
    if (!sourceMedia) throw new Error("Missing ordinary media fixture");

    const media = {
      ...sourceMedia,
      alt: "共享图片替代文本",
      caption: "共享图片说明",
      maxCssWidth: 431,
      maxCssHeight: 287,
    };
    const view = render(
      <BoundedProjectImage
        media={media}
        figureClass="figure-sentinel"
        imageClass="image-sentinel"
      />,
    );

    const image = screen.getByRole("img", { name: media.alt });
    const figure = image.closest("figure");
    expect(figure).toHaveClass("figure-sentinel", "min-w-0", "max-w-full");
    expect(figure).toHaveStyle({ maxWidth: `${media.maxCssWidth}px` });
    expect(image).toHaveClass("image-sentinel", "object-contain");
    expect(image).toHaveStyle({
      maxWidth: "100%",
      maxHeight: `${media.maxCssHeight}px`,
    });
    expect(screen.getByText(media.caption).tagName).toBe("FIGCAPTION");

    view.rerender(<BoundedProjectImage media={media} caption={false} />);
    expect(screen.queryByText(media.caption)).toBeNull();
  });

  it("renders four independent stages with the fixed non-causal notice", async () => {
    const car = getProject("car-vacuum");
    const view = await renderProject("car-vacuum");

    expect(car.relationModel).toBe("parallel");
    expect(
      screen.getAllByText("以下环节并列呈现，现有材料未记录其因果关系。").length,
    ).toBeGreaterThan(0);
    const insights = screen.getByRole("region", { name: "关键洞察" });
    expect(
      Array.from(insights.querySelectorAll("h3"), (heading) => heading.textContent),
    ).toEqual([
      "调研职责说明",
      "团队过程",
      "黑色高功率概念",
      "蓝色轻量环保概念",
    ]);
    expect(within(insights).getByRole("region", { name: "黑色高功率概念" })).toBeVisible();
    expect(within(insights).getByRole("region", { name: "蓝色轻量环保概念" })).toBeVisible();
    expect(within(insights).getByRole("region", { name: "团队双路线" })).toBeVisible();
    expect(within(insights).queryByRole("region", { name: "产品建模" })).toBeNull();
    expect(within(insights).queryByRole("region", { name: "概念定价" })).toBeNull();

    const outcome = screen.getByRole("region", { name: "最终成果" });
    expect(
      Array.from(outcome.querySelectorAll("h3"), (heading) => heading.textContent),
    ).toEqual(["产品建模", "概念定价", "最终概念"]);
    expect(within(outcome).getAllByText("负责产品建模")).toHaveLength(1);
    expect(within(outcome).getAllByText("负责发布价格设计")).toHaveLength(1);

    expect(view.container.textContent).not.toMatch(
      /因此|从而|据此|基于调研|调研推动|调研决定|导向|验证了/,
    );
    expect(view.container.textContent).toContain(
      "不代表真实成本、上市价格或市场验证",
    );
  });

  it("exposes an independent-array component API without causal fields or arrows", () => {
    const source = readSource(
      "src/components/projects/data/parallel-routes.tsx",
    );

    expect(source).toMatch(/items:\s*readonly ParallelRouteItem\[\]/);
    expect(source).not.toMatch(/derivedFrom|arrow|→|⇒|➜/);
  });

  it("fixes the non-causal notice outside the component API", () => {
    const notice = "以下环节并列呈现，现有材料未记录其因果关系。";
    const constant = (
      projectContent as unknown as { PARALLEL_RELATION_NOTICE?: string }
    ).PARALLEL_RELATION_NOTICE;

    render(
      <ParallelRoutes
        items={[
          { id: "one", label: "路线一", description: "独立路线" },
          { id: "two", label: "路线二", description: "独立路线" },
        ]}
      />,
    );

    expect(screen.getByText(notice)).toBeVisible();
    expect(constant).toBe(notice);

    const source = readSource("src/components/projects/data/parallel-routes.tsx");
    const propsBody = source.match(/interface ParallelRoutesProps\s*{([\s\S]*?)}/)?.[1];
    expect(propsBody).toBeDefined();
    expect(propsBody).not.toMatch(/\bnotice\b|\bgroupLabel\b/);
    expect(source).toMatch(/PARALLEL_RELATION_NOTICE/);
  });

  it("keeps black and blue route labels in content as the single source", () => {
    const car = getProject("car-vacuum");
    const routeEvidence = car.keyEvidence.find(
      (item) => item.evidenceId === "car_parallel_team_routes",
    );

    expect(routeEvidence?.routeOptions).toEqual([
      { id: "black-high-power", label: "黑色高功率概念" },
      { id: "blue-lightweight", label: "蓝色轻量环保概念" },
    ]);
  });

  it("keeps percentage facts in content rather than duplicating them in the renderer", () => {
    const source = readSource(
      "src/components/projects/data/evidence-bars.tsx",
    );

    expect(source).not.toMatch(/72|65|28|52|48|25|68|55|30|58|42|45/);
    expect(source).toMatch(/dataPoints/);
  });

  it("renders vacuum media within content-defined CSS limits", async () => {
    const car = getProject("car-vacuum");
    await renderProject("car-vacuum");

    for (const media of car.media.filter((item) => item.purpose !== "hero")) {
      const limits = media as typeof media & {
        maxCssWidth?: number;
        maxCssHeight?: number;
      };
      const image = screen.getByRole("img", { name: media.alt });
      const figure = image.closest("figure");

      expect(limits.maxCssWidth).toBeTypeOf("number");
      expect(limits.maxCssHeight).toBeTypeOf("number");
      expect(figure).toHaveStyle({ maxWidth: `${limits.maxCssWidth}px` });
      expect(image).toHaveStyle({ maxHeight: `${limits.maxCssHeight}px` });
    }
  });

  it("renders vacuum process notes from a replaceable content record", () => {
    const car = getProject("car-vacuum");
    const coreNarrative =
      car.coreNarrative?.kind === "car-vacuum"
        ? car.coreNarrative
        : null;

    expect(coreNarrative?.kind).toBe("car-vacuum");
    if (!coreNarrative) return;

    const sentinel = "临时替换的过程边界";
    const modified = {
      ...car,
      coreNarrative: { ...coreNarrative, processNote: sentinel },
    };
    render(<VacuumCase project={modified} section="process" />);

    expect(screen.getByText(sentinel)).toBeVisible();
  });
});
