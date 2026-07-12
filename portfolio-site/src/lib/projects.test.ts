import { cleanup, render, screen, within } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { projects } from "@/content/projects";
import type { EvidencePoint } from "@/content/types";
import { isPublicEvidence } from "@/lib/projects";

const { notFoundMock } = vi.hoisted(() => ({
  notFoundMock: vi.fn((): never => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
}));

async function loadOverviewRoute() {
  try {
    return await vi.importActual<{
      default: () => ReactNode;
    }>("@/app/projects/page");
  } catch (cause) {
    throw new Error("项目总览路由尚未实现", { cause });
  }
}

async function loadDetailRoute() {
  try {
    return await vi.importActual<{
      default: (props: {
        params: Promise<{ slug: string }>;
      }) => Promise<ReactNode>;
      generateMetadata: (props: {
        params: Promise<{ slug: string }>;
      }) => Promise<{ title?: string }>;
      generateStaticParams: () => { slug: string }[];
    }>("@/app/projects/[slug]/page");
  } catch (cause) {
    throw new Error("项目详情路由尚未实现", { cause });
  }
}

async function loadNotFoundRoute() {
  try {
    return await vi.importActual<{
      default: () => ReactNode;
    }>("@/app/not-found");
  } catch (cause) {
    throw new Error("404 页面尚未实现", { cause });
  }
}

describe("项目静态路由契约", () => {
  beforeEach(() => {
    cleanup();
    notFoundMock.mockClear();
  });

  test("generateStaticParams 按批准顺序精确返回五个 slug", async () => {
    const { generateStaticParams } = await loadDetailRoute();

    expect(generateStaticParams()).toEqual([
      { slug: "hotel-service-system" },
      { slug: "car-vacuum" },
      { slug: "healing-glove" },
      { slug: "biomaterial-experiments" },
      { slug: "coffee-grinder" },
    ]);
  });

  test("项目总览保持固定顺序并默认显示性质、职责与摘要", async () => {
    const { default: ProjectsPage } = await loadOverviewRoute();

    render(createElement(ProjectsPage));

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "五个项目，五种从信息到方案的路径",
      }),
    ).toBeInTheDocument();

    const cards = screen.getAllByTestId("project-overview-item");
    expect(cards).toHaveLength(5);
    expect(cards.map((card) => card.dataset.projectSlug)).toEqual(
      projects.map((project) => project.slug),
    );

    projects.forEach((project, index) => {
      const card = within(cards[index]);
      expect(
        card.getByRole("heading", { level: 2, name: project.title }),
      ).toBeInTheDocument();
      expect(card.getByText(project.nature)).toBeInTheDocument();
      expect(card.getByText(project.summary)).toBeInTheDocument();

      for (const role of project.personalContributions.filter(isPublicEvidence)) {
        expect(card.getByText(role.claim)).toBeInTheDocument();
      }
    });
  });

  test("详情路由等待 Promise params 并从单一内容源显示摘要", async () => {
    const { default: ProjectPage, generateMetadata } = await loadDetailRoute();
    const project = projects[0];
    const params = Promise.resolve({ slug: project.slug });

    render(await ProjectPage({ params }));

    expect(screen.getByRole("heading", { level: 1, name: project.title })).toBeInTheDocument();
    expect(screen.getByText(project.nature)).toBeInTheDocument();
    expect(screen.getByText(project.summary)).toBeInTheDocument();
    for (const role of project.personalContributions.filter(isPublicEvidence)) {
      expect(screen.getByText(role.claim)).toBeInTheDocument();
    }
    await expect(generateMetadata({ params })).resolves.toMatchObject({
      title: `${project.title}｜${project.nature}`,
    });
  });

  test("详情不渲染 D 级、私有或未获 submission 阶段许可的职责", async () => {
    const { default: ProjectPage } = await loadDetailRoute();
    const project = projects[0];
    const originalRoles = project.personalContributions;
    const baseRole = originalRoles[0];
    const hiddenRoles: EvidencePoint[] = [
      {
        ...baseRole,
        evidenceId: "test_hidden_role_grade_d",
        claim: "测试职责：D 级证据",
        evidenceGrade: "D",
      },
      {
        ...baseRole,
        evidenceId: "test_hidden_role_private",
        claim: "测试职责：私有证据",
        privacyLevel: "private",
      },
      {
        ...baseRole,
        evidenceId: "test_hidden_role_without_submission",
        claim: "测试职责：未获公开阶段许可",
        allowedStages: ["internal", "draft", "review"],
      },
    ];

    Object.assign(project, {
      personalContributions: [...originalRoles, ...hiddenRoles],
    });

    try {
      render(await ProjectPage({ params: Promise.resolve({ slug: project.slug }) }));

      for (const role of originalRoles.filter(isPublicEvidence)) {
        expect(screen.getByText(role.claim)).toBeInTheDocument();
      }
      for (const role of hiddenRoles) {
        expect(screen.queryByText(role.claim)).not.toBeInTheDocument();
      }
    } finally {
      Object.assign(project, { personalContributions: originalRoles });
    }
  });

  test("未知 slug 触发 Next notFound", async () => {
    const { default: ProjectPage } = await loadDetailRoute();

    await expect(
      ProjectPage({ params: Promise.resolve({ slug: "unknown-project" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalledOnce();
  });

  test("中文 404 提供首页与项目总览返回路径", async () => {
    const { default: NotFoundPage } = await loadNotFoundRoute();

    render(createElement(NotFoundPage));

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("页面未找到");
    expect(screen.getByRole("link", { name: "返回首页" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "查看项目总览" })).toHaveAttribute(
      "href",
      "/projects",
    );
  });
});
