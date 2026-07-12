import { cleanup, render, screen, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ComponentProps } from "react";
import { afterEach, describe, expect, it } from "vitest";

import ProjectPage from "@/app/projects/[slug]/page";
import { ExperimentTimeline } from "@/components/projects/data/experiment-timeline";
import { QualitativeMap } from "@/components/projects/data/qualitative-map";
import { ResearchStream } from "@/components/projects/data/research-stream";
import { BiomaterialsCase } from "@/components/projects/narratives/biomaterials-case";
import { GloveCase } from "@/components/projects/narratives/glove-case";
import { GrinderCase } from "@/components/projects/narratives/grinder-case";
import type {
  EvidencePoint,
  PersonalEvidencePoint,
  TeamEvidencePoint,
} from "@/content/types";
import { getProject } from "@/lib/projects";

afterEach(cleanup);

type SupportingSlug =
  | "healing-glove"
  | "biomaterial-experiments"
  | "coffee-grinder";

async function renderProject(slug: SupportingSlug) {
  return render(await ProjectPage({ params: Promise.resolve({ slug }) }));
}

function readSource(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function isTeamEvidence(item: EvidencePoint): item is TeamEvidencePoint {
  return item.ownership === "team";
}

function isPersonalEvidence(item: EvidencePoint): item is PersonalEvidencePoint {
  return item.ownership === "personal";
}

function expectTextOrder(container: HTMLElement, expected: readonly string[]) {
  const text = container.textContent ?? "";
  let previous = -1;

  for (const item of expected) {
    expect(item, "ordered contract must not contain an empty sentinel").not.toBe("");
    const current = text.indexOf(item, previous + 1);
    expect(current, `missing ordered text: ${item}`).toBeGreaterThan(previous);
    previous = current;
  }
}

describe("supporting narrative content contract", () => {
  it("locks each supporting kind to its narrative style", () => {
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

  it("locks literal glove, biomaterials, and grinder contracts independently of render data", () => {
    const glove = getProject("healing-glove");
    expect(glove.personalContributions.map((item) => item.claim)).toEqual([
      "负责市场调研",
      "负责数据分析",
      "负责海报设计",
    ]);
    expect(glove.supportingNarrative.needs.map((item) => item.label)).toEqual([
      "抓握",
      "简化操作",
      "安全反馈",
      "陪伴",
    ]);
    const gloveMedia = [
      "/projects/glove/sketches.webp",
      "/projects/glove/final-illustration.webp",
      "/projects/glove/interface.webp",
    ] as const;
    expect(glove.supportingNarrative.mediaOrder).toEqual(gloveMedia);
    for (const src of gloveMedia) {
      expect(glove.media.find((item) => item.src === src), src).toBeDefined();
    }

    const biomaterials = getProject("biomaterial-experiments");
    expect(
      biomaterials.supportingNarrative.groups.map((group) => [group.label, group.roundCount]),
    ).toEqual([
      ["山竹皮", 7],
      ["菠萝叶", 5],
    ]);
    const biomaterialsMedia = [
      "/projects/biomaterials/mangosteen-samples.webp",
      "/projects/biomaterials/pineapple-sample-03.webp",
    ] as const;
    expect(biomaterials.supportingNarrative.sampleMediaOrder).toEqual(biomaterialsMedia);
    for (const src of biomaterialsMedia) {
      expect(biomaterials.media.find((item) => item.src === src), src).toBeDefined();
    }

    const grinder = getProject("coffee-grinder");
    expect(grinder.supportingNarrative.themes.map((item) => item.label)).toEqual([
      "便携",
      "费力",
      "稳定",
      "仪式感",
    ]);
    expect(grinder.supportingNarrative.personalContributionEvidenceIds).toEqual([
      "grinder_role_brief_moodboard",
    ]);
    expect(grinder.personalContributions.map((item) => item.claim)).toEqual([
      "参与团队设计简报整理，并负责情绪板与视觉方向探索",
    ]);
    expect(grinder.supportingNarrative.contextMediaSrc).toBe(
      "/projects/grinder/context.webp",
    );
    expect(grinder.supportingNarrative.mediaStages).toEqual([
      {
        id: "sketch",
        label: "草图",
        description: "团队方案草图阶段；当前页面不将其写为个人独立完成。",
      },
      {
        id: "lightbox",
        label: "灯箱图",
        description: "团队概念结构表达。",
        mediaSrc: "/projects/grinder/exploded.webp",
      },
      {
        id: "final-render",
        label: "最终渲染",
        description: "团队最终概念表达。",
        mediaSrc: "/projects/grinder/final.webp",
      },
    ]);
    for (const src of [
      grinder.supportingNarrative.contextMediaSrc,
      ...grinder.supportingNarrative.mediaStages.flatMap((item) =>
        "mediaSrc" in item ? [item.mediaSrc] : [],
      ),
    ]) {
      expect(grinder.media.find((item) => item.src === src), src).toBeDefined();
    }
  });

  it("keeps all supporting narrative facts in replaceable content records", () => {
    const glove = getProject("healing-glove");
    const gloveNarrative =
      glove.supportingNarrative?.kind === "healing-glove"
        ? glove.supportingNarrative
        : null;
    expect(gloveNarrative).not.toBeNull();
    if (!gloveNarrative) return;

    const gloveSentinel = "临时替换的定性需求类别";
    render(
      <GloveCase
        project={{
          ...glove,
          supportingNarrative: {
            ...gloveNarrative,
            needs: [
              { ...gloveNarrative.needs[0], label: gloveSentinel },
              ...gloveNarrative.needs.slice(1),
            ],
          },
        }}
        section="insights"
      />,
    );
    expect(screen.getAllByText(gloveSentinel).length).toBeGreaterThan(0);
    cleanup();

    const biomaterials = getProject("biomaterial-experiments");
    const biomaterialsNarrative =
      biomaterials.supportingNarrative?.kind === "biomaterial-experiments"
        ? biomaterials.supportingNarrative
        : null;
    expect(biomaterialsNarrative).not.toBeNull();
    if (!biomaterialsNarrative) return;

    const experimentSentinel = "临时替换的定性观察";
    render(
      <BiomaterialsCase
        project={{
          ...biomaterials,
          supportingNarrative: {
            ...biomaterialsNarrative,
            groups: [
              {
                ...biomaterialsNarrative.groups[0],
                records: [
                  {
                    ...biomaterialsNarrative.groups[0].records[0],
                    observation: experimentSentinel,
                  },
                ],
              },
              ...biomaterialsNarrative.groups.slice(1),
            ],
          },
        }}
        section="insights"
      />,
    );
    expect(screen.getByText(experimentSentinel)).toBeVisible();
    cleanup();

    const grinder = getProject("coffee-grinder");
    const grinderNarrative =
      grinder.supportingNarrative?.kind === "coffee-grinder"
        ? grinder.supportingNarrative
        : null;
    expect(grinderNarrative).not.toBeNull();
    if (!grinderNarrative) return;

    const grinderSentinel = "临时替换的团队研究输入";
    render(
      <GrinderCase
        project={{
          ...grinder,
          methods: [{ ...grinder.methods[0], claim: grinderSentinel }],
        }}
        section="insights"
      />,
    );
    expect(screen.getByText(grinderSentinel)).toBeVisible();
  });
});

describe("healing-glove short concept brief", () => {
  it("renders the required qualitative sequence and exact personal boundary", async () => {
    const glove = getProject("healing-glove");
    const narrative =
      glove.supportingNarrative?.kind === "healing-glove"
        ? glove.supportingNarrative
        : null;
    expect(narrative).not.toBeNull();
    if (!narrative) return;

    const view = await renderProject("healing-glove");
    const narrativeRegion = screen.getByRole("region", { name: "手套概念提案叙事" });

    expectTextOrder(narrativeRegion, [
      ...glove.personalContributions.map((item) => item.claim),
      ...narrative.needs.map((item) => item.label),
      ...narrative.mappings.map((item) => item.conceptFunction),
      ...narrative.mediaOrder.map(
        (src) => glove.media.find((media) => media.src === src)?.caption ?? "",
      ),
      ...narrative.boundaries,
    ]);

    const contribution = screen.getByRole("region", { name: "我的贡献" });
    expect(
      within(contribution)
        .getAllByRole("listitem")
        .map((item) => item.textContent?.replace("个人职责：", "")),
    ).toEqual(glove.personalContributions.map((item) => item.claim));
    expect(view.container.textContent).toContain("团队概念");
    expect(view.container.textContent).toContain("非医疗器械");
    expect(view.container.textContent).toContain("非可用原型");
    expect(view.container.textContent).toContain("原始市场底稿缺失");
  });

  it("does not publish forbidden market, price, subsidy, medical-performance, or persona material", async () => {
    const view = await renderProject("healing-glove");
    const text = view.container.textContent ?? "";

    expect(text).not.toMatch(/市场规模|市场容量|补贴|售价|定价|价格|Persona|用户画像/);
    expect(text).not.toMatch(/治愈率|康复率|疗效|血压|心率|血氧|准确率|灵敏度|\d+(?:\.\d+)?%/);
  });

  it("keeps QualitativeMap qualitative-only and free of causal or ownership fields", () => {
    const source = readSource("src/components/projects/data/qualitative-map.tsx");
    const propsBody = source.match(/interface QualitativeMapProps\s*{([\s\S]*?)}/)?.[1];

    expect(propsBody).toBeDefined();
    expect(propsBody).toMatch(/categories/);
    expect(propsBody).toMatch(/mappings/);
    expect(propsBody).not.toMatch(/score|value|amount|size|market|cause|effect|owner|personal/i);
    expect(source).not.toMatch(/meter|progress|→|⇒|➜/);

    render(
      <QualitativeMap
        categories={[{ id: "need", label: "定性类别", description: "文字归纳" }]}
        mappings={[
          { id: "map", needId: "need", conceptFunction: "概念功能", caveat: "仅作对应" },
        ]}
      />,
    );
    expect(screen.getAllByText("定性类别").length).toBeGreaterThan(0);
    expect(screen.getByText("概念功能")).toBeVisible();
  });
});

describe("biomaterials lab notebook", () => {
  it("locks all twelve source-page-backed rounds without splitting aggregate findings", () => {
    const biomaterials = getProject("biomaterial-experiments");
    const expected = {
      mangosteen: [
        {
          id: "mangosteen-round-1",
          round: 1,
          sourcePage: "page10–page12",
          input: "山竹皮粉末与凝胶基材料，采用较少的水进行首次成型。",
          observation: "样品在干燥与存放后出现可见霉变。",
          judgment: "页面将有机组分、常温慢速干燥与器具卫生列为可能因素。",
          nextStep: "下一轮增加水量，并继续比较干燥与防霉处理。",
        },
        {
          id: "mangosteen-round-2",
          round: 2,
          sourcePage: "page10–page12",
          input: "山竹皮粉末与凝胶基材料，在第一轮基础上增加水量。",
          observation: "增加水量后的样品仍出现可见霉变。",
          judgment: "只调整水量没有解决霉变，页面仍指向干燥与卫生等可能因素。",
          nextStep: "转向加入酸性成分，并改进器具卫生与干燥方式。",
        },
        {
          id: "mangosteen-round-3",
          round: 3,
          sourcePage: "page13–page15",
          input: "山竹皮粉末与凝胶基材料，加入酸性成分并分成两种厚度。",
          observation: "两种厚度样品存在轻微差异，干燥与存放期间未见明显霉变。",
          judgment: "页面认为酸性成分可能与未见霉变有关，但只作为解释而非因果验证。",
          nextStep: "继续比较材料体系与厚度，同时保留清洁和干燥控制。",
        },
        {
          id: "mangosteen-round-4",
          round: 4,
          sourcePage: "page17–page19",
          input: "山竹皮粉末与淀粉基材料，并加入塑化与酸性成分。",
          observation: "样品干燥后大面积碎裂，呈现明显开裂与脆化。",
          judgment: "页面把塑化不足、淀粉体系、混合不均与干燥条件列为可能因素。",
          nextStep: "调整塑化、材料比例、混合均匀性与干燥条件。",
        },
        {
          id: "mangosteen-round-5",
          round: 5,
          sourcePage: "page20–page24",
          input: "山竹皮粉末与蜂蜡组成蜡基样品。",
          observation: "样品较厚，表面略湿但光滑，容易划伤、缺少弹性与韧性并容易断裂。",
          judgment: "样品能够固化，但页面判断其结构完整性仍不足。",
          nextStep: "继续改善结构完整性与抗断裂表现，不将主观量表当作科学性能。",
        },
        {
          id: "mangosteen-round-6",
          round: 6,
          sourcePage: "page25–page28",
          input: "山竹皮粉末与凝胶基材料，加入塑化与酸性成分。",
          observation: "样品初期可变形且较有弹性，暴露在空气中后逐渐变硬并失去柔性。",
          judgment: "页面认为环境失水可能影响长期柔性。",
          nextStep: "调整塑化方式或增加表面封护，继续观察长期状态。",
        },
        {
          id: "mangosteen-round-7",
          round: 7,
          sourcePage: "page29–page32",
          input: "在上一轮凝胶基体系上提高塑化成分，并改用柠檬汁。",
          observation: "样品初期柔软、可变形，长期暴露后仍会变硬并失去柔性。",
          judgment: "初期柔性有所保留，但长期空气暴露问题仍未解决。",
          nextStep: "继续解决长期变硬与柔性保持问题。",
        },
      ],
      pineapple: [
        {
          id: "pineapple-round-1",
          round: 1,
          sourcePage: "page37–page39",
          input: "菠萝叶纤维与果胶基材料，采用较少的水进行首次成型。",
          observation: "果胶不易溶解，最终混合物过黏。",
          judgment: "页面认为果胶需要预先溶解，且水量不足使混合物过黏。",
          nextStep: "先预溶果胶，并在下一轮增加水量。",
        },
        {
          id: "pineapple-round-2",
          round: 2,
          sourcePage: "page37–page39",
          input: "相同果胶基材料，增加水量并加入酸性成分。",
          observation: "样品仍呈黏液状态，难以成型。",
          judgment: "增加水量与酸性成分后仍未形成可用样品。",
          nextStep: "更换成型材料体系，不把黏液状态视为成品。",
        },
        {
          id: "pineapple-round-3",
          round: 3,
          sourcePage: "page40–page43",
          input: "菠萝叶纤维加入蜡基材料，并以植物粉末调色。",
          observation: "样品较硬、颜色偏深，可见纤维纹理且表面相对光滑。",
          judgment: "页面认为纤维形成纹理，而调色成分使颜色过深。",
          nextStep: "减少调色成分，并尝试颜色更浅的蜡基材料。",
        },
        {
          id: "pineapple-round-4",
          round: 4,
          sourcePage: "page44–page46",
          input: "菠萝叶纤维加入淀粉基材料，并加入塑化、酸性与调色成分。",
          observation: "样品干燥后开裂，难以继续使用。",
          judgment: "页面把塑化不足、淀粉重结晶、混合不均与干燥条件列为可能因素。",
          nextStep: "改善塑化、混合均匀性与干燥条件。",
        },
        {
          id: "pineapple-round-5",
          round: 5,
          sourcePage: "page47–page50",
          input: "菠萝叶粉末加入凝胶基材料，并以柠檬汁作为酸性成分。",
          observation: "样品保留绿色，并呈现清晰的菠萝叶纤维纹理。",
          judgment: "页面只记录纤维带来纹理与保留绿色，未给出标准化性能结论。",
          nextStep: "页面未记录后续调整；需补充成型与长期状态观察。",
        },
      ],
    } as const;

    for (const [groupId, expectedRecords] of Object.entries(expected)) {
      const group = biomaterials.supportingNarrative.groups.find(
        (item) => item.id === groupId,
      );
      expect(group, groupId).toBeDefined();
      if (!group) throw new Error(`Missing experiment group ${groupId}`);
      expect(group.records).toHaveLength(group.roundCount);
      expect(group.records.map((record) => record.round)).toEqual(
        Array.from({ length: group.roundCount }, (_, index) => index + 1),
      );
      expect(group.records).toEqual(expectedRecords);
      for (const record of group.records) {
        expect(record.sourcePage.trim()).not.toBe("");
        expect(record.input.trim()).not.toBe("");
        expect(record.observation.trim()).not.toBe("");
        expect(record.judgment.trim()).not.toBe("");
        expect(record.nextStep.trim()).not.toBe("");
      }
    }
  });

  it("renders grouped 7 and 5 round records with the fixed qualitative structure", async () => {
    const biomaterials = getProject("biomaterial-experiments");
    const narrative =
      biomaterials.supportingNarrative?.kind === "biomaterial-experiments"
        ? biomaterials.supportingNarrative
        : null;
    expect(narrative).not.toBeNull();
    if (!narrative) return;

    await renderProject("biomaterial-experiments");
    const timeline = screen.getByRole("region", { name: "实验迭代时间线" });
    expect(narrative.groups.map((group) => [group.label, group.roundCount])).toEqual([
      ["山竹皮", 7],
      ["菠萝叶", 5],
    ]);

    for (const group of narrative.groups) {
      const region = within(timeline).getByRole("region", {
        name: `${group.label} ${group.roundCount} 轮`,
      });
      for (const label of narrative.fieldLabels) {
        expect(within(region).getAllByText(label).length).toBeGreaterThan(0);
      }
    }

    expect(screen.getByText("负责实验记录并参与实验执行")).toBeVisible();
  });

  it("uses photos and qualitative text without recipes or pseudo-scientific performance graphics", async () => {
    const biomaterials = getProject("biomaterial-experiments");
    const view = await renderProject("biomaterial-experiments");
    const text = view.container.textContent ?? "";

    for (const term of ["霉变", "开裂", "脆化", "黏稠", "长期变硬"]) {
      expect(text).toContain(term);
    }
    expect(text).toContain("不是标准化材料性能测试");
    expect(text).not.toMatch(/\d+(?:\.\d+)?\s*(?:克|毫升|g\b|ml\b)|拉伸强度|抗压强度|性能评分/);
    expect(view.container.querySelector("meter, progress, svg[data-performance-chart]")).toBeNull();

    for (const media of biomaterials.media.filter((item) => item.purpose !== "hero")) {
      const image = screen.getByRole("img", { name: media.alt });
      expect(image.closest("figure")).toHaveStyle({ maxWidth: `${media.maxCssWidth}px` });
      expect(image).toHaveStyle({ maxHeight: `${media.maxCssHeight}px` });
    }
  });

  it("keeps ExperimentTimeline qualitative and recipe-free at the API boundary", () => {
    const source = readSource("src/components/projects/data/experiment-timeline.tsx");
    const propsBody = source.match(/interface ExperimentTimelineProps\s*{([\s\S]*?)}/)?.[1];

    expect(propsBody).toBeDefined();
    expect(propsBody).toMatch(/groups/);
    expect(propsBody).toMatch(/fieldLabels/);
    expect(propsBody).not.toMatch(/formula|recipe|score|metric|performance|percentage/i);
    expect(source).not.toMatch(/meter|progress|data-performance-chart/);

    render(
      <ExperimentTimeline
        fieldLabels={["输入", "现象", "判断", "下一步"]}
        groups={[
          {
            id: "sample",
            label: "样品",
            roundCount: 1,
            records: [
              {
                id: "record",
                round: 1,
                sourcePage: "page01",
                input: "输入记录",
                observation: "定性现象",
                judgment: "边界判断",
                nextStep: "后续记录",
              },
            ],
          },
        ]}
      />,
    );
    expect(screen.getByRole("region", { name: "样品 1 轮" })).toBeVisible();
  });
});

describe("coffee-grinder editorial narrative", () => {
  it("renders the exact denominator wording and editorial sequence", async () => {
    const grinder = getProject("coffee-grinder");
    const narrative =
      grinder.supportingNarrative?.kind === "coffee-grinder"
        ? grinder.supportingNarrative
        : null;
    expect(narrative).not.toBeNull();
    if (!narrative) return;

    await renderProject("coffee-grinder");
    const narrativeRegion = screen.getByRole("region", { name: "磨豆机编辑式叙事" });

    const teamInputs = narrative.teamInputEvidenceIds.map((evidenceId) =>
      grinder.methods.find((item) => item.evidenceId === evidenceId),
    );
    const denominator = grinder.keyEvidence.find(
      (item) => item.evidenceId === narrative.denominatorEvidenceId,
    );
    const personalOutputs = narrative.personalContributionEvidenceIds.map((evidenceId) =>
      grinder.personalContributions.find((item) => item.evidenceId === evidenceId),
    );
    const resolvedTeamInputs = teamInputs.filter(
      (item): item is NonNullable<typeof item> => Boolean(item),
    );
    const resolvedPersonalOutputs = personalOutputs.filter(
      (item): item is NonNullable<typeof item> => Boolean(item),
    );
    expect(resolvedTeamInputs).toHaveLength(teamInputs.length);
    expect(denominator).toBeDefined();
    expect(resolvedPersonalOutputs).toHaveLength(personalOutputs.length);
    if (!denominator) {
      throw new Error("Grinder evidence reference contract is incomplete");
    }
    expect(denominator.claim).toBe("团队材料记录了 57 份问卷");
    expect(denominator.result).toContain("各题有效分母不同");
    expectTextOrder(narrativeRegion, [
      ...resolvedTeamInputs.map((item) => item.claim),
      denominator.result ?? "",
      ...narrative.themes.map((item) => item.label),
      narrative.decisionGap,
      ...resolvedPersonalOutputs.map((item) => item.claim),
      narrative.teamFormation,
      ...narrative.mediaStages.map((item) => item.label),
    ]);

    expect(screen.getByRole("link", { name: "返回项目总览" })).toHaveAttribute(
      "href",
      "/projects",
    );
  });

  it("renders the complete questionnaire denominator fact exactly once", async () => {
    await renderProject("coffee-grinder");

    const scope = screen.getByRole("region", { name: "数据口径说明" });
    const text = scope.textContent ?? "";
    expect(text.match(/团队材料记录了 57 份问卷/g)).toHaveLength(1);
    expect(text.match(/团队材料记录了 57 份问卷；各题有效分母不同。/g)).toHaveLength(1);
    expect(within(scope).getByText(/不把所有图表都写成基于同一分母/)).toBeVisible();
  });

  it("keeps team inputs separate from canonical personal outputs", async () => {
    const grinder = getProject("coffee-grinder");
    const narrative =
      grinder.supportingNarrative?.kind === "coffee-grinder"
        ? grinder.supportingNarrative
        : null;
    expect(narrative).not.toBeNull();
    if (!narrative) return;

    await renderProject("coffee-grinder");
    const teamRegion = screen.getByRole("region", { name: "团队研究输入" });
    const personalRegion = screen.getByRole("region", { name: "我的设计输出" });

    for (const evidenceId of narrative.teamInputEvidenceIds) {
      const item = grinder.methods.find((candidate) => candidate.evidenceId === evidenceId);
      expect(item).toBeDefined();
      if (!item) throw new Error(`Missing team evidence ${evidenceId}`);
      expect(within(teamRegion).getByText(item.claim)).toBeVisible();
    }
    for (const evidenceId of narrative.personalContributionEvidenceIds) {
      const item = grinder.personalContributions.find(
        (candidate) => candidate.evidenceId === evidenceId,
      );
      expect(item).toBeDefined();
      if (!item) throw new Error(`Missing personal evidence ${evidenceId}`);
      expect(within(personalRegion).getByText(item.claim)).toBeVisible();
    }
    expect(within(personalRegion).queryByText(/问卷|访谈|CAD|渲染/)).toBeNull();
    expect(grinder.personalContributions.map((item) => item.claim)).toEqual([
      "参与团队设计简报整理，并负责情绪板与视觉方向探索",
    ]);
  });

  it("makes team/personal ownership impossible to collapse in ResearchStream props", () => {
    const source = readSource("src/components/projects/data/research-stream.tsx");
    const propsBody = source.match(/interface ResearchStreamProps\s*{([\s\S]*?)}/)?.[1];

    expect(propsBody).toBeDefined();
    expect(propsBody).toMatch(/teamInputs/);
    expect(propsBody).toMatch(/personalOutputs/);
    expect(propsBody).not.toMatch(/items\s*:/);

    const grinder = getProject("coffee-grinder");
    const teamInput = grinder.methods[0];
    const personalOutput = grinder.personalContributions[0];
    expect(teamInput.ownership).toBe("team");
    expect(personalOutput.ownership).toBe("personal");
    if (!isTeamEvidence(teamInput) || !isPersonalEvidence(personalOutput)) {
      throw new Error("Fixture ownership does not match its evidence channel");
    }

    const validTeamInputs: ComponentProps<typeof ResearchStream>["teamInputs"] = [
      teamInput,
    ];
    const validPersonalOutputs: ComponentProps<typeof ResearchStream>["personalOutputs"] = [
      personalOutput,
    ];
    const invalidTeamInputs: ComponentProps<typeof ResearchStream>["teamInputs"] = [
      // @ts-expect-error personal evidence cannot enter the team input channel
      personalOutput,
    ];
    const invalidPersonalOutputs: ComponentProps<typeof ResearchStream>["personalOutputs"] = [
      // @ts-expect-error team evidence cannot enter the personal output channel
      teamInput,
    ];
    void invalidTeamInputs;
    void invalidPersonalOutputs;

    render(
      <ResearchStream
        teamInputs={validTeamInputs}
        personalOutputs={validPersonalOutputs}
      />,
    );
    expect(within(screen.getByRole("region", { name: "团队研究输入" })).getByText(teamInput.claim)).toBeVisible();
    expect(within(screen.getByRole("region", { name: "我的设计输出" })).getByText(personalOutput.claim)).toBeVisible();

    expect(() =>
      render(
        <ResearchStream
          teamInputs={[
            personalOutput,
          ] as unknown as ComponentProps<typeof ResearchStream>["teamInputs"]}
          personalOutputs={[
            teamInput,
          ] as unknown as ComponentProps<typeof ResearchStream>["personalOutputs"]}
        />,
      ),
    ).toThrow(/ownership|归属/i);
  });

  it("throws when grinder evidence references are missing or carry the wrong ownership", () => {
    const grinder = getProject("coffee-grinder");

    expect(() =>
      render(
        <GrinderCase
          project={{
            ...grinder,
            supportingNarrative: {
              ...grinder.supportingNarrative,
              personalContributionEvidenceIds: ["missing_personal_evidence"],
            },
          }}
          section="outcome"
        />,
      ),
    ).toThrow(/missing_personal_evidence/);

    expect(() =>
      render(
        <GrinderCase
          project={{
            ...grinder,
            methods: [
              {
                ...grinder.methods[0],
                ownership: "personal",
              },
            ],
          } as typeof grinder}
          section="insights"
        />,
      ),
    ).toThrow(/ownership|归属/i);
  });

  it("uses the Task 8 lightbox summary and content-defined media limits", async () => {
    const grinder = getProject("coffee-grinder");
    await renderProject("coffee-grinder");

    const lightboxMedia = grinder.media.find((item) => item.purpose === "lightbox");
    expect(lightboxMedia?.purpose).toBe("lightbox");
    if (!lightboxMedia || lightboxMedia.purpose !== "lightbox") return;

    expect(screen.getByText(lightboxMedia.htmlSummary)).toBeVisible();
    expect(
      screen.getByRole("button", { name: `放大查看：${lightboxMedia.alt}` }),
    ).toBeVisible();

    for (const media of grinder.media.filter((item) => item.purpose !== "hero")) {
      const image = screen.getByRole("img", { name: media.alt, hidden: true });
      const figure =
        media.purpose === "lightbox"
          ? screen
              .getByRole("button", { name: `放大查看：${media.alt}` })
              .closest("figure")
          : image.closest("figure");
      expect(figure).toHaveStyle({ maxWidth: `${media.maxCssWidth}px` });
      expect(image).toHaveStyle({ maxHeight: `${media.maxCssHeight}px` });
      if (media.purpose === "lightbox") {
        expect(image).toHaveStyle({ maxWidth: `${media.maxCssWidth}px` });
      }
    }

    expect(lightboxMedia.maxCssWidth).toBe(500);
    expect(lightboxMedia.maxCssHeight).toBe(900);
  });
});
