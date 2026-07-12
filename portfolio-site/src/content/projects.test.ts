import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { projects } from "@/content/projects";
import * as projectContent from "@/content/projects";
import { publicContact, publicContactPrivacyMessage, resumeContent } from "@/content/resume";
import { siteContent } from "@/content/site";
import type { EvidencePoint, ProjectCase } from "@/content/types";
import type { BoundedProjectMedia } from "@/content/types";
import {
  getFeaturedProjects,
  getProject,
  getPublicEvidence,
  isPublicEvidence,
} from "@/lib/projects";
import publicOutputRules from "../../scripts/public-output-rules.cjs";

const { forbiddenPatterns } = publicOutputRules;

const projectSlugs = [
  "hotel-service-system",
  "car-vacuum",
  "healing-glove",
  "biomaterial-experiments",
  "coffee-grinder",
] as const;

const personalClaims = {
  "hotel-service-system": [
    "负责实地调研",
    "负责服务蓝图撰写",
    "负责调研数据整理框架搭建",
  ],
  "car-vacuum": ["负责用户调研", "负责产品建模", "负责发布价格设计"],
  "healing-glove": ["负责市场调研", "负责数据分析", "负责海报设计"],
  "biomaterial-experiments": ["负责实验记录并参与实验执行"],
  "coffee-grinder": ["参与团队设计简报整理，并负责情绪板与视觉方向探索"],
} as const;

function evidenceFor(projectIndex: number): readonly EvidencePoint[] {
  const project = projects[projectIndex];

  return [
    ...project.personalContributions,
    ...project.methods,
    ...project.keyEvidence,
    project.solutionResponse,
    ...project.teamOutputs,
  ];
}

describe("project content contract", () => {
  it("keeps every media record aligned with the generated asset manifest", () => {
    const manifest = JSON.parse(
      readFileSync(resolve(process.cwd(), "scripts/asset-manifest.json"), "utf8"),
    ) as {
      assets: readonly {
        output: string;
        outputSize: readonly [number, number];
        purpose: string;
        maxCssWidth: number;
        maxCssHeight: number;
      }[];
    };
    const media: BoundedProjectMedia[] = [];
    for (const project of projects) media.push(...project.media);

    expect(media).toHaveLength(18);
    expect(manifest.assets).toHaveLength(18);
    for (const item of media) {
      const output = item.src.replace("/projects/", "");
      const asset = manifest.assets.find((candidate) => candidate.output === output);

      expect(asset, output).toBeDefined();
      expect(
        {
          path: output,
          width: item.width,
          height: item.height,
          purpose: item.purpose,
          maxCssWidth: item.maxCssWidth,
          maxCssHeight: item.maxCssHeight,
        },
        output,
      ).toEqual({
        path: asset?.output,
        width: asset?.outputSize[0],
        height: asset?.outputSize[1],
        purpose: asset?.purpose,
        maxCssWidth: asset?.maxCssWidth,
        maxCssHeight: asset?.maxCssHeight,
      });
    }
  });

  it("rejects invalid percentage points at content construction time", () => {
    const createPercentageDataPoints = (
      projectContent as unknown as {
        createPercentageDataPoints?: (
          points: readonly { label: string; value: number }[],
        ) => readonly { label: string; value: number; unit: "%" }[];
      }
    ).createPercentageDataPoints;

    expect(createPercentageDataPoints).toBeTypeOf("function");
    if (!createPercentageDataPoints) return;

    for (const value of [Number.NaN, Number.POSITIVE_INFINITY, -1, 101]) {
      expect(() => createPercentageDataPoints([{ label: "invalid", value }])).toThrow(
        RangeError,
      );
    }
    expect(
      createPercentageDataPoints([
        { label: "lower", value: 0 },
        { label: "upper", value: 100 },
      ]),
    ).toEqual([
      { label: "lower", value: 0, unit: "%" },
      { label: "upper", value: 100, unit: "%" },
    ]);
  });
  it("locks five unique projects, their order, featured subset, H1 titles, and next links", () => {
    expect(projects.map((item) => item.slug)).toEqual(projectSlugs);
    expect(new Set(projects.map((item) => item.slug))).toHaveLength(5);
    expect(projects.map((item) => item.order)).toEqual([1, 2, 3, 4, 5]);
    expect(projects.map((item) => item.featured)).toEqual([true, true, true, false, false]);
    expect(getFeaturedProjects().map((item) => item.slug)).toEqual(projectSlugs.slice(0, 3));
    expect(projects.map((item) => item.nextSlug)).toEqual([
      "car-vacuum",
      "healing-glove",
      "biomaterial-experiments",
      "coffee-grinder",
      null,
    ]);
    expect(projects.every((item) => item.title.trim().length > 0)).toBe(true);
    expect(new Set(projects.map((item) => item.title))).toHaveLength(5);
  });

  it("locks supporting narrative discriminants to their intended page rhythms", () => {
    expect(getProject("healing-glove")).toMatchObject({
      narrativeStyle: "concept-brief",
      supportingNarrative: { kind: "healing-glove" },
    });
    expect(getProject("biomaterial-experiments")).toMatchObject({
      narrativeStyle: "lab-notebook",
      supportingNarrative: { kind: "biomaterial-experiments" },
    });
    expect(getProject("coffee-grinder")).toMatchObject({
      narrativeStyle: "editorial-product",
      supportingNarrative: { kind: "coffee-grinder" },
    });
  });

  it("requires exactly one explicit hero for every project", () => {
    for (const project of projects) {
      expect(project.media.filter((item) => item.purpose === "hero"), project.slug).toHaveLength(1);
    }
  });

  it("makes narrative style, narrative record, and relation model one discriminated contract", () => {
    type HotelCase = Extract<ProjectCase, { narrativeStyle: "service-system" }>;
    type VacuumCase = Extract<ProjectCase, { narrativeStyle: "parallel-product-routes" }>;
    type GloveCase = Extract<ProjectCase, { narrativeStyle: "concept-brief" }>;
    type BiomaterialsCase = Extract<ProjectCase, { narrativeStyle: "lab-notebook" }>;
    type GrinderCase = Extract<ProjectCase, { narrativeStyle: "editorial-product" }>;

    const relations: readonly [
      HotelCase["relationModel"],
      VacuumCase["relationModel"],
      GloveCase["relationModel"],
      BiomaterialsCase["relationModel"],
      GrinderCase["relationModel"],
    ] = ["causal", "parallel", "conceptual-mapping", "iterative", "chronological"];

    expect(relations).toEqual([
      "causal",
      "parallel",
      "conceptual-mapping",
      "iterative",
      "chronological",
    ]);

    // @ts-expect-error a service-system project cannot carry a parallel relation
    const invalidRelation: ProjectCase = { ...projects[0], relationModel: "parallel" };
    // @ts-expect-error a concept brief cannot use the hotel core narrative contract
    const invalidNarrative: ProjectCase = { ...projects[0], narrativeStyle: "concept-brief" };
    void invalidRelation;
    void invalidNarrative;
  });

  it("uses personalContributions as the only canonical responsibility source", () => {
    for (const slug of projectSlugs) {
      const project = getProject(slug);
      expect(project.personalContributions.map((item) => item.claim)).toEqual(
        personalClaims[slug],
      );
      expect(project.personalContributions.every((item) => item.ownership === "personal")).toBe(
        true,
      );
      expect(
        project.personalContributions.every(
          (item) => item.personalContribution === item.claim,
        ),
      ).toBe(true);
    }

    const duplicatedResponsibilityText = JSON.stringify({ siteContent, resumeContent });
    for (const claims of Object.values(personalClaims)) {
      for (const claim of claims) {
        expect(duplicatedResponsibilityText).not.toContain(claim);
      }
    }
  });

  it("keeps team delivery separate from personal responsibility", () => {
    for (const project of projects) {
      expect(project.teamOutputs.length).toBeGreaterThan(0);
      expect(project.teamOutputs.every((item) => item.ownership === "team")).toBe(true);
      expect(project.teamOutputs.every((item) => item.personalContribution.length > 0)).toBe(
        true,
      );
      expect(project.teamOutputs.every((item) => item.teamOutput.length > 0)).toBe(true);
    }
  });

  it("preserves parallel and conceptual-mapping boundaries", () => {
    const car = getProject("car-vacuum");
    expect(car.nature).toContain("团队概念设计探索");
    expect(car.relationModel).toBe("parallel");
    expect(car.keyEvidence.map((item) => item.claim)).toEqual([
      "团队形成黑色高功率概念与蓝色轻量环保概念两条产品路线",
    ]);
    expect(car.limitations).toContain(
      "以下环节并列呈现，现有材料未记录其因果关系。",
    );

    const publicCarEvidence = getPublicEvidence(car);
    for (const responsibility of car.personalContributions) {
      expect(
        publicCarEvidence.filter(
          (item) =>
            item.ownership === "personal" &&
            item.personalContribution === responsibility.claim,
        ),
      ).toEqual([responsibility]);
    }

    const glove = getProject("healing-glove");
    expect(glove.nature).toContain("团队概念提案");
    expect(glove.relationModel).toBe("conceptual-mapping");
    expect(glove.solutionResponse.claimKind).toBe("concept");
    expect(glove.solutionResponse.publicCaveat).toBe(
      "需求与功能仅为概念对应，尚未通过真实用户、原型或医疗验证。",
    );
  });

  it("locks sample and iteration wording without inventing denominators", () => {
    const hotel = getProject("hotel-service-system");
    const hotelText = JSON.stringify(hotel);
    expect(hotelText).toContain("总体收到 30 份问卷记录");
    expect(hotelText).toContain("单题有效分母待核验");
    expect(hotelText).toContain("刷卡位置不清晰 72%；房卡消磁 72%；刷卡后无响应 65%；无问题 28%")
    expect(hotelText).toContain("蓝牙不稳定 65%；流程繁琐 52%；信号或电量失败 48%；无问题 25%")
    expect(hotelText).toContain("临时密码 68%；双重低电量提醒 55%；手机查看锁状态 52%；只需基本开锁 30%")
    expect(hotelText).toContain("手机 58%；门牌 42%；消息 45%；保洁人员 28%；前台 25%")
    expect(hotelText).not.toContain("n=30");
    expect(
      hotel.keyEvidence
        .filter((item) => item.dataPoints)
        .map((item) => item.dataPoints?.map((point) => point.value)),
    ).toEqual([
      [72, 72, 65, 28],
      [65, 52, 48, 25],
      [68, 55, 52, 30],
      [58, 42, 45, 28, 25],
    ]);

    const biomaterialText = JSON.stringify(getProject("biomaterial-experiments"));
    expect(biomaterialText).toContain("山竹皮材料共记录 7 轮");
    expect(biomaterialText).toContain("菠萝叶材料共记录 5 轮");
    expect(biomaterialText).toContain("定性观察");

    const grinderText = JSON.stringify(getProject("coffee-grinder"));
    expect(grinderText).toContain("团队材料记录了 57 份问卷");
    expect(grinderText).toContain("各题有效分母不一致");
  });

  it("excludes unsupported performance, market, causal, and outcome claims", () => {
    const serialized = JSON.stringify(projects);
    for (const { label, pattern } of forbiddenPatterns.filter(({ label }) =>
      label.startsWith("unsupported"),
    )) {
      expect(serialized, `projects contain ${label}`).not.toMatch(pattern);
    }
  });

  it("requires a distinct explanatory HTML summary for every complex diagram", () => {
    const lightboxMedia = projects.flatMap((project) =>
      project.media.filter((item) => item.purpose === "lightbox"),
    );

    expect(lightboxMedia).toHaveLength(3);
    for (const media of lightboxMedia) {
      expect(media.htmlSummary.trim().length).toBeGreaterThan(20);
      expect(media.htmlSummary).not.toBe(media.alt);
      expect(media.htmlSummary).toMatch(/概念|未验证|未完成/);
    }
  });
});

describe("evidence and privacy gates", () => {
  it("keeps evidence IDs unique and PRD-compatible", () => {
    const evidence = projects.flatMap((_, index) => evidenceFor(index));
    const ids = evidence.map((item) => item.evidenceId);

    expect(new Set(ids)).toHaveLength(ids.length);
    expect(ids.every((id) => /^[a-z][a-z0-9_]{2,63}$/.test(id))).toBe(true);

    for (const item of evidence) {
      expect(item.allowedTracks).toEqual(["job_search"]);
      expect(item.sourceRefs.length).toBeGreaterThan(0);

      if (item.verificationStatus === "verified") {
        expect(item.primarySupportSourceId).not.toBeNull();
        expect(item.sourceRefs).toContain(item.primarySupportSourceId);
        expect(item.lastVerified).not.toBeNull();
      } else if (item.verificationStatus === "partially_verified") {
        expect(item.primarySupportSourceId).toBeNull();
        expect(item.lastVerified).not.toBeNull();
        expect(item.evidenceGrade).toBe("D");
      } else {
        expect(item.primarySupportSourceId).toBeNull();
        expect(item.lastVerified).toBeNull();
        expect(item.evidenceGrade).toBe("D");
      }

      if (item.evidenceGrade === "D") {
        expect(item.allowedStages).not.toContain("review");
        expect(item.allowedStages).not.toContain("submission");
      }
      if (item.privacyLevel === "private") {
        expect(item.allowedStages).toEqual(["internal"]);
      }
      if (item.privacyLevel === "working_anonymized") {
        expect(item.allowedStages).not.toContain("submission");
      }
    }
  });

  it("only exposes A, B, or C evidence explicitly allowed for submission", () => {
    for (const project of projects) {
      const publicEvidence = getPublicEvidence(project);
      expect(publicEvidence.length).toBe(evidenceFor(project.order - 1).length);
      expect(publicEvidence.every((item) => ["A", "B", "C"].includes(item.evidenceGrade))).toBe(
        true,
      );
      expect(publicEvidence.every((item) => item.allowedStages.includes("submission"))).toBe(
        true,
      );
    }
  });

  it("rejects malformed or non-public evidence independently", () => {
    const valid = getProject("hotel-service-system").personalContributions[0];
    const candidates: readonly [string, EvidencePoint][] = [
      [
        "unverified A-grade submission evidence",
        {
          ...valid,
          verificationStatus: "unverified",
          primarySupportSourceId: null,
          lastVerified: null,
        },
      ],
      ["missing primary source", { ...valid, primarySupportSourceId: null }],
      [
        "empty primary source",
        { ...valid, sourceRefs: [""], primarySupportSourceId: "" },
      ],
      [
        "primary source outside sourceRefs",
        { ...valid, primarySupportSourceId: "src_not_in_source_refs" },
      ],
      ["missing lastVerified", { ...valid, lastVerified: null }],
      ["empty lastVerified", { ...valid, lastVerified: "" }],
      ["D-grade evidence", { ...valid, evidenceGrade: "D" }],
      [
        "private evidence",
        { ...valid, privacyLevel: "private", allowedStages: ["internal"] },
      ],
      [
        "evidence without submission stage",
        { ...valid, allowedStages: ["internal", "draft", "review"] },
      ],
    ];

    for (const [label, candidate] of candidates) {
      expect(isPublicEvidence(candidate), label).toBe(false);
    }
    expect(isPublicEvidence(valid)).toBe(true);
  });

  it("keeps every public contact action empty until specific publication approval", () => {
    expect(publicContact).toEqual({
      publicationApproval: null,
      email: null,
      phone: null,
      links: [],
      resumePdf: null,
    });
    expect(publicContactPrivacyMessage).toBe(
      "为保护隐私，公开版未展示联系方式；请通过收到本作品集链接的招聘平台联系。",
    );
  });
});

describe("resume content contract", () => {
  it("keeps one typed summary per project in canonical order", () => {
    const summarySlugs = resumeContent.projectSummaries.map((item) => item.slug);

    expect(summarySlugs).toHaveLength(projects.length);
    expect(new Set(summarySlugs)).toHaveLength(projects.length);
    expect(summarySlugs).toEqual(projects.map((project) => project.slug));
  });
});
