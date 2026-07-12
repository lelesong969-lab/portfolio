import type {
  ClaimKind,
  EvidenceGrade,
  EvidenceDataPoint,
  EvidencePoint,
  Ownership,
  ProjectCase,
  RouteOption,
} from "@/content/types";

const checkedAt = "2026-07-11";
const publicStages = ["internal", "draft", "review", "submission"] as const;

export const PARALLEL_RELATION_NOTICE =
  "以下环节并列呈现，现有材料未记录其因果关系。" as const;
export const PARALLEL_ROUTE_GROUP_LABEL = "团队双路线" as const;

interface ProjectContext {
  projectOrExperience: string;
  teamOutput: string;
}

interface EvidenceInput {
  evidenceId: string;
  claim: string;
  sourceRefs: readonly string[];
  ownership: Ownership;
  claimKind?: ClaimKind;
  evidenceGrade?: Exclude<EvidenceGrade, "D">;
  method?: string | null;
  result?: string | null;
  publicCaveat?: string;
  dataPoints?: readonly EvidenceDataPoint[];
  routeOptions?: readonly RouteOption[];
}

export function createPercentageDataPoints(
  points: readonly { label: string; value: number }[],
): readonly EvidenceDataPoint[] {
  return points.map((point) => {
    if (!Number.isFinite(point.value) || point.value < 0 || point.value > 100) {
      throw new RangeError(`Invalid percentage value for ${point.label}: ${point.value}`);
    }

    return { ...point, unit: "%" as const };
  });
}

function formatDataPoints(dataPoints: readonly EvidenceDataPoint[]): string {
  return dataPoints.map((point) => `${point.label} ${point.value}${point.unit}`).join("；");
}

function buildVerifiedEvidence(
  context: ProjectContext,
  personalContribution: string,
  input: EvidenceInput,
): EvidencePoint {
  return {
    evidenceId: input.evidenceId,
    claim: input.claim,
    projectOrExperience: context.projectOrExperience,
    teamOutput: context.teamOutput,
    personalContribution,
    method: input.method ?? null,
    result: input.result ?? (input.dataPoints ? formatDataPoints(input.dataPoints) : null),
    sourceRefs: input.sourceRefs,
    primarySupportSourceId: input.sourceRefs[0],
    verificationStatus: "verified",
    evidenceGrade: input.evidenceGrade ?? "A",
    lastChecked: checkedAt,
    lastVerified: checkedAt,
    privacyLevel: "submission",
    allowedTracks: ["job_search"],
    allowedStages: publicStages,
    ownership: input.ownership,
    claimKind: input.claimKind ?? "fact",
    ...(input.publicCaveat ? { publicCaveat: input.publicCaveat } : {}),
    ...(input.dataPoints ? { dataPoints: input.dataPoints } : {}),
    ...(input.routeOptions ? { routeOptions: input.routeOptions } : {}),
  };
}

function verifiedPersonalEvidence(
  context: ProjectContext,
  input: EvidenceInput,
): EvidencePoint {
  return buildVerifiedEvidence(context, input.claim, input);
}

function canonicalPersonalContribution(
  personalContributions: readonly EvidencePoint[],
): string {
  const claims = personalContributions.map((item) => item.claim);

  if (claims.every((claim) => claim.startsWith("负责"))) {
    return `负责${claims.map((claim) => claim.slice(2)).join("、")}`;
  }

  return claims.join("；");
}

function verifiedEvidence(
  context: ProjectContext,
  personalContributions: readonly EvidencePoint[],
  input: EvidenceInput,
): EvidencePoint {
  return buildVerifiedEvidence(
    context,
    canonicalPersonalContribution(personalContributions),
    input,
  );
}

const hotelContext: ProjectContext = {
  projectOrExperience: "hotel_service_system",
  teamOutput:
    "团队完成酒店门把手与服务系统概念，包括实体触点、房态信息与服务响应。",
};

const carContext: ProjectContext = {
  projectOrExperience: "car_vacuum",
  teamOutput: "团队完成双产品路线概念、结构表达与最终展示。",
};

const gloveContext: ProjectContext = {
  projectOrExperience: "healing_glove",
  teamOutput: "团队完成手套、腕上界面与辅助系统的概念提案。",
};

const biomaterialContext: ProjectContext = {
  projectOrExperience: "biomaterial_experiments",
  teamOutput: "团队形成山竹皮与菠萝叶实验样品序列和应用探索。",
};

const grinderContext: ProjectContext = {
  projectOrExperience: "coffee_grinder",
  teamOutput: "团队完成研究归纳、户外磨豆机概念与最终技术表达。",
};

const hotelPersonalContributions = [
  verifiedPersonalEvidence(hotelContext, {
    evidenceId: "hotel_role_field_research",
    claim: "负责实地调研",
    sourceRefs: ["src_user_confirmation_20260711"],
    ownership: "personal",
    method: "实地调研",
  }),
  verifiedPersonalEvidence(hotelContext, {
    evidenceId: "hotel_role_service_blueprint",
    claim: "负责服务蓝图撰写",
    sourceRefs: ["src_user_confirmation_20260711"],
    ownership: "personal",
    method: "服务蓝图",
  }),
  verifiedPersonalEvidence(hotelContext, {
    evidenceId: "hotel_role_data_framework",
    claim: "负责调研数据整理框架搭建",
    sourceRefs: ["src_user_confirmation_20260711"],
    ownership: "personal",
    method: "调研数据整理",
    publicCaveat: "不延伸为数据库、数据工程或统计建模职责。",
  }),
] as const;

const carPersonalContributions = [
  verifiedPersonalEvidence(carContext, {
    evidenceId: "car_role_user_research",
    claim: "负责用户调研",
    sourceRefs: ["src_user_confirmation_20260711"],
    ownership: "personal",
    method: "用户调研",
    publicCaveat: "现有源文件未保留样本、方法与研究结果。",
  }),
  verifiedPersonalEvidence(carContext, {
    evidenceId: "car_role_product_modeling",
    claim: "负责产品建模",
    sourceRefs: ["src_user_confirmation_20260711"],
    ownership: "personal",
    method: "产品建模",
    publicCaveat: "个人职责范围不包括最终渲染。",
  }),
  verifiedPersonalEvidence(carContext, {
    evidenceId: "car_role_price_design",
    claim: "负责发布价格设计",
    sourceRefs: ["src_user_confirmation_20260711"],
    ownership: "personal",
    method: "概念定价",
    publicCaveat: "作为概念定价呈现，不代表真实成本、上市价格或市场验证。",
  }),
] as const;

const glovePersonalContributions = [
  verifiedPersonalEvidence(gloveContext, {
    evidenceId: "glove_role_market_research",
    claim: "负责市场调研",
    sourceRefs: ["src_user_confirmation_20260711"],
    ownership: "personal",
    method: "市场调研",
    publicCaveat: "原始市场来源与过程底稿未保留。",
  }),
  verifiedPersonalEvidence(gloveContext, {
    evidenceId: "glove_role_data_analysis",
    claim: "负责数据分析",
    sourceRefs: ["src_user_confirmation_20260711"],
    ownership: "personal",
    method: "数据分析",
    publicCaveat: "不补写未保留的样本、统计模型或结果。",
  }),
  verifiedPersonalEvidence(gloveContext, {
    evidenceId: "glove_role_poster_design",
    claim: "负责海报设计",
    sourceRefs: ["src_user_confirmation_20260711"],
    ownership: "personal",
    method: "视觉表达",
    publicCaveat: "不扩展为负责全部产品结构、界面或系统设计。",
  }),
] as const;

const biomaterialPersonalContributions = [
  verifiedPersonalEvidence(biomaterialContext, {
    evidenceId: "biomaterial_role_record_experiment",
    claim: "负责实验记录并参与实验执行",
    sourceRefs: ["src_biomaterial_pdf"],
    ownership: "personal",
    method: "实验记录与执行",
  }),
] as const;

const grinderPersonalContributions = [
  verifiedPersonalEvidence(grinderContext, {
    evidenceId: "grinder_role_brief_moodboard",
    claim: "参与团队设计简报整理，并负责情绪板与视觉方向探索",
    sourceRefs: ["src_coffee_grinder_pptx"],
    ownership: "personal",
    method: "设计简报与情绪板",
  }),
] as const;

const hotelEvidence = (input: EvidenceInput) =>
  verifiedEvidence(hotelContext, hotelPersonalContributions, input);
const carEvidence = (input: EvidenceInput) =>
  verifiedEvidence(carContext, carPersonalContributions, input);
const gloveEvidence = (input: EvidenceInput) =>
  verifiedEvidence(gloveContext, glovePersonalContributions, input);
const biomaterialEvidence = (input: EvidenceInput) =>
  verifiedEvidence(biomaterialContext, biomaterialPersonalContributions, input);
const grinderEvidence = (input: EvidenceInput) =>
  verifiedEvidence(grinderContext, grinderPersonalContributions, input);

export const projects = [
  {
    slug: "hotel-service-system",
    order: 1,
    featured: true,
    narrativeStyle: "service-system",
    coreNarrative: {
      kind: "hotel-service-system",
      dualUserTitle: "住客与保洁的双用户场景",
      dualUsers: [
        {
          id: "guest",
          label: "住客",
          description: "进入房间、确认房态并提出服务需求。",
        },
        {
          id: "housekeeping",
          label: "保洁",
          description: "识别房态、接收需求并完成后台响应。",
        },
      ],
      researchEvidenceId: "hotel_questionnaire_total",
      priorityItems: [
        { id: "entry", label: "进入", description: "识别开锁触点与失败状态" },
        { id: "room-status", label: "房态", description: "让门口状态能够被理解" },
        { id: "feedback", label: "反馈", description: "保留住客提出需求的入口" },
        { id: "recovery", label: "恢复", description: "连接服务接收与后台响应" },
      ],
      priorityCaveat: "这是问题整理框架，不代表问卷选项的统计排名。",
      systemLayers: [
        {
          id: "physical-touchpoint",
          label: "实体触点",
          description: "门把手与房卡感应区承担门口操作。",
        },
        {
          id: "room-status-information",
          label: "房态信息",
          description: "门口状态用于表达住客与服务之间的信息。",
        },
        {
          id: "service-response",
          label: "服务响应",
          description: "前台与后台服务角色承接需求。",
        },
      ],
      blueprintStages: [
        {
          id: "guest-action",
          label: "住客动作",
          description: "进入房间、查看门口状态、提出服务需求。",
        },
        {
          id: "front-desk-touchpoint",
          label: "前台触点",
          description: "接收房态与需求信息，作为服务联系节点。",
        },
        {
          id: "backstage-response",
          label: "后台响应",
          description: "保洁等服务角色查看信息并处理任务。",
        },
        {
          id: "unverified-items",
          label: "未验证事项",
          description: "真实部署、可靠性、成本、安全与服务时效仍未验证。",
        },
      ],
      systemMapSrc: "/projects/hotel/system-map.webp",
      blueprintSrc: "/projects/hotel/service-blueprint.webp",
      usageProcessSrc: "/projects/hotel/usage-process.webp",
    },
    relationModel: "causal",
    title: "酒店门把手与服务系统",
    englishTitle: "Hotel Door Handle & Service System",
    nature: "团队研究与服务系统概念",
    question: "门口为何成为住客与保洁共同的高摩擦触点？",
    summary:
      "从酒店门口的双用户摩擦出发，把现场信息和问卷口径整理为进入、房态、反馈与恢复四类问题，再连接实体触点与服务响应。",
    personalContributions: hotelPersonalContributions,
    methods: [
      hotelEvidence({
        evidenceId: "hotel_method_research_mix",
        claim: "团队材料包含问卷、访谈、用户旅程与场景归纳",
        sourceRefs: ["src_hotel_research_pdf"],
        ownership: "team",
        method: "问卷、访谈、用户旅程与场景归纳",
        publicCaveat: "访谈日期、招募方式与完整样本说明未保留。",
      }),
    ],
    keyEvidence: [
      hotelEvidence({
        evidenceId: "hotel_questionnaire_total",
        claim: "原材料记录总体收到 30 份问卷记录",
        sourceRefs: ["src_hotel_research_pdf"],
        ownership: "team",
        method: "问卷",
        result: "总体收到 30 份问卷记录；单题有效分母待核验。",
        publicCaveat: "不得把总体记录数直接写成单题样本量，也不换算人数。",
      }),
      hotelEvidence({
        evidenceId: "hotel_card_issues",
        claim: "传统房卡问题的原版标注百分比",
        sourceRefs: ["src_hotel_research_pdf"],
        ownership: "team",
        method: "多选问卷",
        dataPoints: createPercentageDataPoints([
          { label: "刷卡位置不清晰", value: 72 },
          { label: "房卡消磁", value: 72 },
          { label: "刷卡后无响应", value: 65 },
          { label: "无问题", value: 28 },
        ]),
        publicCaveat: "多选；单题有效分母待核验；只引用原版百分比，不换算人数。",
      }),
      hotelEvidence({
        evidenceId: "hotel_smart_lock_issues",
        claim: "智能门锁问题的原版标注百分比",
        sourceRefs: ["src_hotel_research_pdf"],
        ownership: "team",
        method: "多选问卷",
        dataPoints: createPercentageDataPoints([
          { label: "蓝牙不稳定", value: 65 },
          { label: "流程繁琐", value: 52 },
          { label: "信号或电量失败", value: 48 },
          { label: "无问题", value: 25 },
        ]),
        publicCaveat: "多选；单题有效分母待核验；只引用原版百分比，不换算人数。",
      }),
      hotelEvidence({
        evidenceId: "hotel_expected_functions",
        claim: "期待门锁功能的原版标注百分比",
        sourceRefs: ["src_hotel_research_pdf"],
        ownership: "team",
        method: "多选问卷",
        dataPoints: createPercentageDataPoints([
          { label: "临时密码", value: 68 },
          { label: "双重低电量提醒", value: 55 },
          { label: "手机查看锁状态", value: 52 },
          { label: "只需基本开锁", value: 30 },
        ]),
        publicCaveat: "多选；单题有效分母待核验；只引用原版百分比，不换算人数。",
      }),
      hotelEvidence({
        evidenceId: "hotel_cleaning_channels",
        claim: "清洁服务沟通渠道的原版标注百分比",
        sourceRefs: ["src_hotel_research_pdf"],
        ownership: "team",
        method: "多选问卷",
        dataPoints: createPercentageDataPoints([
          { label: "手机", value: 58 },
          { label: "门牌", value: 42 },
          { label: "消息", value: 45 },
          { label: "保洁人员", value: 28 },
          { label: "前台", value: 25 },
        ]),
        publicCaveat: "多选；单题有效分母待核验；只引用原版百分比，不换算人数。",
      }),
    ],
    solutionResponse: hotelEvidence({
      evidenceId: "hotel_solution_system",
      claim: "团队用肘部可操作门把手、房态反馈与服务蓝图回应进入和服务摩擦",
      sourceRefs: ["src_hotel_final_pdf"],
      ownership: "team",
      claimKind: "concept",
      result: "实体触点、房态信息与服务响应的系统概念",
      publicCaveat: "这是概念服务闭环，未完成酒店部署、可靠性、成本或真实时效验证。",
    }),
    teamOutputs: [
      hotelEvidence({
        evidenceId: "hotel_team_delivery",
        claim: "团队交付酒店门把手与服务系统概念",
        sourceRefs: ["src_hotel_final_pdf"],
        ownership: "team",
        claimKind: "concept",
      }),
    ],
    limitations: [
      "总体问卷记录为 30 份，但单题有效分母待核验。",
      "访谈日期、招募方式与完整样本说明未保留。",
      "系统尚未完成部署、可靠性、成本、安全或真实服务时效验证。",
    ],
    media: [
      {
        src: "/projects/hotel/hero.webp",
        width: 1360,
        height: 875,
        maxCssWidth: 800,
        maxCssHeight: 570,
        alt: "酒店门把手、房卡感应区与房门触点的使用情境",
        caption: "酒店门口的实体触点概念",
        purpose: "hero",
      },
      {
        src: "/projects/hotel/system-map.webp",
        width: 1920,
        height: 1080,
        maxCssWidth: 1280,
        maxCssHeight: 720,
        alt: "酒店门把手、房态信息与服务响应的系统关系图",
        caption: "实体触点与服务响应的概念系统图",
        purpose: "lightbox",
        htmlSummary:
          "图中把门把手这一实体触点与房态信息、住客反馈和服务响应连接起来；该关系为团队概念系统，尚未完成酒店部署与真实时效验证。",
      },
      {
        src: "/projects/hotel/service-blueprint.webp",
        width: 1920,
        height: 1080,
        maxCssWidth: 1280,
        maxCssHeight: 720,
        alt: "住客、前台与保洁服务触点的服务蓝图",
        caption: "团队服务蓝图",
        purpose: "lightbox",
        htmlSummary:
          "蓝图按住客、前台与保洁三个参与方梳理服务触点和响应关系；它是团队概念交付，访谈样本说明与真实服务时效仍未验证。",
      },
      {
        src: "/projects/hotel/usage-process.webp",
        width: 1600,
        height: 900,
        maxCssWidth: 1000,
        maxCssHeight: 563,
        alt: "酒店门把手与房态操作的使用步骤",
        caption: "使用流程与实体操作",
        purpose: "evidence",
      },
    ],
    nextSlug: "car-vacuum",
  },
  {
    slug: "car-vacuum",
    order: 2,
    featured: true,
    narrativeStyle: "parallel-product-routes",
    coreNarrative: {
      kind: "car-vacuum",
      researchEvidenceId: "car_role_user_research",
      teamMethodEvidenceId: "car_method_team_iteration",
      routesEvidenceId: "car_parallel_team_routes",
      modelingEvidenceId: "car_role_product_modeling",
      pricingEvidenceId: "car_role_price_design",
      routeMediaSrc: "/projects/vacuum/route-study.webp",
      modelMediaSrc: "/projects/vacuum/product-model.webp",
      mechanismMediaSrc: "/projects/vacuum/mechanism.webp",
      processNote: "现有材料不支持性能、市场或销售结果主张。",
    },
    relationModel: "parallel",
    title: "车载吸尘器",
    englishTitle: "In-car Vacuum Concept",
    nature: "团队概念设计探索",
    question: "一个车载清洁概念如何发展成两条产品路线？",
    summary:
      "用户调研、团队双路线定位、产品建模与概念定价按现有证据并列呈现，不把缺失的过程补写成线性因果链。",
    personalContributions: carPersonalContributions,
    methods: [
      carEvidence({
        evidenceId: "car_method_team_iteration",
        claim: "团队通过讨论、零件交换、工程表达与渲染推进概念",
        sourceRefs: ["src_car_vacuum_pptx"],
        ownership: "team",
        method: "团队概念迭代",
      }),
    ],
    keyEvidence: [
      carEvidence({
        evidenceId: "car_parallel_team_routes",
        claim: "团队形成黑色高功率概念与蓝色轻量环保概念两条产品路线",
        sourceRefs: ["src_car_vacuum_pptx"],
        ownership: "team",
        claimKind: "concept",
        routeOptions: [
          { id: "black-high-power", label: "黑色高功率概念" },
          { id: "blue-lightweight", label: "蓝色轻量环保概念" },
        ],
      }),
    ],
    solutionResponse: carEvidence({
      evidenceId: "car_solution_routes",
      claim: "团队以两条产品路线表达不同的车载清洁概念方向",
      sourceRefs: ["src_car_vacuum_pptx"],
      ownership: "team",
      claimKind: "concept",
      publicCaveat: "路线、个人职责与定价环节并列呈现，不建立未记录的因果关系。",
    }),
    teamOutputs: [
      carEvidence({
        evidenceId: "car_team_delivery",
        claim: "团队交付双产品路线概念、结构表达与最终展示",
        sourceRefs: ["src_car_vacuum_pptx"],
        ownership: "team",
        claimKind: "concept",
      }),
    ],
    limitations: [
      "以下环节并列呈现，现有材料未记录其因果关系。",
      "现有源文件未保留用户调研样本、方法与结果。",
      "概念定价不代表真实成本、上市价格或市场验证。",
      "现有材料不支持性能、市场或销售结果主张。",
    ],
    media: [
      {
        src: "/projects/vacuum/cover.webp",
        width: 1360,
        height: 1400,
        maxCssWidth: 680,
        maxCssHeight: 700,
        alt: "蓝色轻量路线车载吸尘器概念渲染",
        caption: "蓝色产品路线概念",
        purpose: "hero",
      },
      {
        src: "/projects/vacuum/product-model.webp",
        width: 1290,
        height: 1184,
        maxCssWidth: 640,
        maxCssHeight: 588,
        alt: "车载吸尘器产品模型视图",
        caption: "产品建模表达",
        purpose: "evidence",
      },
      {
        src: "/projects/vacuum/mechanism.webp",
        width: 859,
        height: 483,
        maxCssWidth: 572,
        maxCssHeight: 322,
        alt: "车载吸尘器局部结构概念图",
        caption: "局部结构概念",
        purpose: "inline",
      },
      {
        src: "/projects/vacuum/route-study.webp",
        width: 859,
        height: 687,
        maxCssWidth: 572,
        maxCssHeight: 458,
        alt: "车载吸尘器双路线造型研究",
        caption: "团队双路线研究",
        purpose: "inline",
      },
    ],
    nextSlug: "healing-glove",
  },
  {
    slug: "healing-glove",
    order: 3,
    featured: true,
    narrativeStyle: "concept-brief",
    supportingNarrative: {
      kind: "healing-glove",
      marketRoleEvidenceIds: [
        "glove_role_market_research",
        "glove_role_data_analysis",
        "glove_role_poster_design",
      ],
      needs: [
        {
          id: "grip",
          label: "抓握",
          description: "关注握持动作与手部操作负担。",
        },
        {
          id: "simplified-operation",
          label: "简化操作",
          description: "减少操作层级与理解负担。",
        },
        {
          id: "safety-feedback",
          label: "安全反馈",
          description: "让操作状态与提醒能够被理解。",
        },
        {
          id: "companionship",
          label: "陪伴",
          description: "保留语音与互动概念的陪伴方向。",
        },
      ],
      mappings: [
        {
          id: "grip-to-glove",
          needId: "grip",
          conceptFunction: "柔性手套与可替换模块概念",
          caveat: "仅作定性概念对应，尚未验证。",
        },
        {
          id: "operation-to-interface",
          needId: "simplified-operation",
          conceptFunction: "简化的腕上界面与语音操作入口",
          caveat: "仅作定性概念对应，尚未验证。",
        },
        {
          id: "safety-to-feedback",
          needId: "safety-feedback",
          conceptFunction: "操作状态与提醒反馈概念",
          caveat: "仅作定性概念对应，尚未验证。",
        },
        {
          id: "companionship-to-voice",
          needId: "companionship",
          conceptFunction: "陪伴式语音交互概念",
          caveat: "仅作定性概念对应，尚未验证。",
        },
      ],
      mediaOrder: [
        "/projects/glove/sketches.webp",
        "/projects/glove/final-illustration.webp",
        "/projects/glove/interface.webp",
      ],
      boundaries: [
        "这是团队概念，不代表个人独立完成全部产品与系统设计。",
        "本项目为非医疗器械概念，不构成诊疗主张。",
        "本项目为非可用原型，尚未完成真实用户、技术性能与使用安全验证。",
        "原始市场底稿缺失，页面不补写未经核验的量化市场结论。",
      ],
    },
    relationModel: "conceptual-mapping",
    title: "老年疗愈智能手套",
    englishTitle: "Healing Glove Concept",
    nature: "团队概念提案",
    question: "如何降低老年用户使用智能辅助产品的理解与操作负担？",
    summary:
      "以定性需求地图组织抓握、简化操作、安全反馈与陪伴需求，再映射到手套、模块、语音与腕上界面概念。",
    personalContributions: glovePersonalContributions,
    methods: [
      gloveEvidence({
        evidenceId: "glove_method_qualitative_map",
        claim: "团队用定性需求地图组织需求与功能概念",
        sourceRefs: ["src_glove_poster_pdf"],
        ownership: "team",
        claimKind: "concept",
        method: "定性需求映射",
      }),
    ],
    keyEvidence: [
      gloveEvidence({
        evidenceId: "glove_evidence_source_limit",
        claim: "现有文件未保留原始市场数据、分析底稿、样本招募或测试记录",
        sourceRefs: ["src_glove_poster_pdf"],
        ownership: "team",
        publicCaveat: "职责已获确认，但不能替代缺失的原始来源。",
      }),
      gloveEvidence({
        evidenceId: "glove_evidence_need_map",
        claim: "定性需求地图聚焦抓握、简化操作、安全反馈与陪伴",
        sourceRefs: ["src_glove_poster_pdf"],
        ownership: "team",
        claimKind: "concept",
      }),
    ],
    solutionResponse: gloveEvidence({
      evidenceId: "glove_solution_mapping",
      claim: "团队把定性需求对应到手套结构、模块、语音与腕上界面概念",
      sourceRefs: ["src_glove_poster_pdf"],
      ownership: "team",
      claimKind: "concept",
      publicCaveat: "需求与功能仅为概念对应，尚未通过真实用户、原型或医疗验证。",
    }),
    teamOutputs: [
      gloveEvidence({
        evidenceId: "glove_team_delivery",
        claim: "团队交付手套、腕上界面与辅助系统概念提案",
        sourceRefs: ["src_glove_poster_pdf"],
        ownership: "team",
        claimKind: "concept",
      }),
    ],
    limitations: [
      "原始市场来源、分析底稿、样本招募与测试记录未保留。",
      "需求与功能只是概念对应，不代表真实用户验证因果。",
      "项目未进行原型、技术性能、使用安全或医疗验证。",
    ],
    media: [
      {
        src: "/projects/glove/final-illustration.webp",
        width: 1400,
        height: 1000,
        maxCssWidth: 720,
        maxCssHeight: 580,
        alt: "老年疗愈智能手套概念插画",
        caption: "手套辅助系统概念",
        purpose: "hero",
      },
      {
        src: "/projects/glove/sketches.webp",
        width: 1690,
        height: 1060,
        maxCssWidth: 1120,
        maxCssHeight: 700,
        alt: "疗愈手套结构与使用概念草图",
        caption: "概念草图与功能探索",
        purpose: "evidence",
      },
      {
        src: "/projects/glove/interface.webp",
        width: 1576,
        height: 850,
        maxCssWidth: 1000,
        maxCssHeight: 540,
        alt: "疗愈手套配套腕上界面概念",
        caption: "腕上界面概念",
        purpose: "evidence",
      },
    ],
    nextSlug: "biomaterial-experiments",
  },
  {
    slug: "biomaterial-experiments",
    order: 4,
    featured: false,
    narrativeStyle: "lab-notebook",
    supportingNarrative: {
      kind: "biomaterial-experiments",
      fieldLabels: ["输入", "现象", "判断", "下一步"],
      groups: [
        {
          id: "mangosteen",
          label: "山竹皮",
          roundCount: 7,
          records: [
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
              observation:
                "样品较厚，表面略湿但光滑，容易划伤、缺少弹性与韧性并容易断裂。",
              judgment: "样品能够固化，但页面判断其结构完整性仍不足。",
              nextStep: "继续改善结构完整性与抗断裂表现，不将主观量表当作科学性能。",
            },
            {
              id: "mangosteen-round-6",
              round: 6,
              sourcePage: "page25–page28",
              input: "山竹皮粉末与凝胶基材料，加入塑化与酸性成分。",
              observation:
                "样品初期可变形且较有弹性，暴露在空气中后逐渐变硬并失去柔性。",
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
        },
        {
          id: "pineapple",
          label: "菠萝叶",
          roundCount: 5,
          records: [
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
        },
      ],
      sampleMediaOrder: [
        "/projects/biomaterials/mangosteen-samples.webp",
        "/projects/biomaterials/pineapple-sample-03.webp",
      ],
      observationBoundary:
        "样品照片与文字只呈现定性观察，不是标准化材料性能测试，也不把团队主观判断改写为科学性能图。",
    },
    relationModel: "iterative",
    title: "生物材料实验",
    englishTitle: "Biomaterial Experiments",
    nature: "团队实验迭代档案",
    question: "如何把失败样品转化为下一轮实验依据？",
    summary:
      "以跨轮实验记录比较样品的定性现象，把霉变、开裂、脆化与黏稠等失败状态转化为下一轮调整依据。",
    personalContributions: biomaterialPersonalContributions,
    methods: [
      biomaterialEvidence({
        evidenceId: "biomaterial_method_observation",
        claim: "团队按轮次记录样品照片与颜色、气味、表面、硬度、弹性、脆性和霉变等定性观察",
        sourceRefs: ["src_biomaterial_pdf"],
        ownership: "team",
        method: "跨轮定性观察",
        publicCaveat: "这些记录不是标准化材料性能测试。",
      }),
    ],
    keyEvidence: [
      biomaterialEvidence({
        evidenceId: "biomaterial_mangosteen_rounds",
        claim: "山竹皮材料共记录 7 轮",
        sourceRefs: ["src_biomaterial_pdf"],
        ownership: "team",
        method: "迭代实验记录",
        result: "7 轮样品与定性观察记录",
      }),
      biomaterialEvidence({
        evidenceId: "biomaterial_pineapple_rounds",
        claim: "菠萝叶材料共记录 5 轮",
        sourceRefs: ["src_biomaterial_pdf"],
        ownership: "team",
        method: "迭代实验记录",
        result: "5 轮样品与定性观察记录",
      }),
      biomaterialEvidence({
        evidenceId: "biomaterial_failure_observations",
        claim: "团队记录了霉变、开裂、脆化、黏稠与长期变硬等定性现象",
        sourceRefs: ["src_biomaterial_pdf"],
        ownership: "team",
        method: "样品定性比较",
        publicCaveat: "不发布冲突配方，也不把主观观察改写为科学性能结果。",
      }),
    ],
    solutionResponse: biomaterialEvidence({
      evidenceId: "biomaterial_solution_archive",
      claim: "团队把观察现象、失败原因与下一步调整整理为实验样品序列",
      sourceRefs: ["src_biomaterial_pdf"],
      ownership: "team",
      claimKind: "concept",
      publicCaveat: "最终成果是实验样品与应用探索，不是成熟材料产品。",
    }),
    teamOutputs: [
      biomaterialEvidence({
        evidenceId: "biomaterial_team_delivery",
        claim: "团队交付实验样品序列与应用探索",
        sourceRefs: ["src_biomaterial_pdf"],
        ownership: "team",
        claimKind: "concept",
      }),
    ],
    limitations: [
      "相邻页面存在配方冲突，网页不发布无法核对的精确配方。",
      "定性观察不等同于标准化性能测试。",
      "项目未完成安全性、耐久性、降解周期或标准材料性能验证。",
    ],
    media: [
      {
        src: "/projects/biomaterials/application.webp",
        width: 1488,
        height: 600,
        maxCssWidth: 720,
        maxCssHeight: 290,
        alt: "生物材料实验样品的应用探索",
        caption: "样品应用探索",
        purpose: "hero",
      },
      {
        src: "/projects/biomaterials/mangosteen-samples.webp",
        width: 640,
        height: 490,
        maxCssWidth: 420,
        maxCssHeight: 320,
        alt: "山竹皮材料实验样品对比",
        caption: "山竹皮样品定性比较",
        purpose: "evidence",
      },
      {
        src: "/projects/biomaterials/pineapple-sample-03.webp",
        width: 500,
        height: 570,
        maxCssWidth: 330,
        maxCssHeight: 320,
        alt: "菠萝叶材料实验样品",
        caption: "菠萝叶实验样品",
        purpose: "evidence",
      },
    ],
    nextSlug: "coffee-grinder",
  },
  {
    slug: "coffee-grinder",
    order: 5,
    featured: false,
    narrativeStyle: "editorial-product",
    supportingNarrative: {
      kind: "coffee-grinder",
      teamInputEvidenceIds: ["grinder_method_research_mix"],
      denominatorEvidenceId: "grinder_questionnaire_total",
      themes: [
        { id: "portable", label: "便携", description: "户外携带与收纳的关注。" },
        { id: "effort", label: "费力", description: "手摇操作负担的关注。" },
        { id: "stable", label: "稳定", description: "研磨过程稳定性的关注。" },
        { id: "ritual", label: "仪式感", description: "户外使用体验与仪式感的关注。" },
      ],
      decisionGap: "原文件未记录从易用性关注转向户外便携优先的完整依据。",
      personalContributionEvidenceIds: ["grinder_role_brief_moodboard"],
      teamFormation:
        "团队把储豆、定量落豆、研磨、粉仓或杯体与手柄收纳整合为户外磨豆机概念。",
      contextMediaSrc: "/projects/grinder/context.webp",
      mediaStages: [
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
      ],
    },
    relationModel: "chronological",
    title: "手摇咖啡磨豆机",
    englishTitle: "Manual Coffee Grinder",
    nature: "团队研究与产品概念",
    question: "户外研磨如何兼顾便携、稳定与使用体验？",
    summary:
      "从团队研究输入出发，展示如何收敛户外磨豆机的设计简报与视觉方向，同时明确问卷口径和个人贡献边界。",
    personalContributions: grinderPersonalContributions,
    methods: [
      grinderEvidence({
        evidenceId: "grinder_method_research_mix",
        claim: "团队材料包含文献、问卷、观察、访谈、竞品与使用流程分析",
        sourceRefs: ["src_coffee_grinder_pptx"],
        ownership: "team",
        method: "团队研究输入汇流",
        publicCaveat: "当前个人职责只确认设计简报与情绪板。",
      }),
    ],
    keyEvidence: [
      grinderEvidence({
        evidenceId: "grinder_questionnaire_total",
        claim: "团队材料记录了 57 份问卷",
        sourceRefs: ["src_coffee_grinder_pptx"],
        ownership: "team",
        method: "问卷",
        result: "团队材料记录了 57 份问卷；各题有效分母不同。",
        publicCaveat: "不把所有图表都写成基于同一分母，也不重绘问卷排名。",
      }),
      grinderEvidence({
        evidenceId: "grinder_team_findings",
        claim: "团队材料反复出现便携、手摇费力、研磨稳定与仪式体验四类问题",
        sourceRefs: ["src_coffee_grinder_pptx"],
        ownership: "team",
        method: "团队信息归纳",
      }),
      grinderEvidence({
        evidenceId: "grinder_decision_gap",
        claim: "原文件未记录从易用性关注转向户外便携优先的完整依据",
        sourceRefs: ["src_coffee_grinder_pptx"],
        ownership: "team",
        publicCaveat: "保留决策缺口，不伪造评分模型或取舍依据。",
      }),
    ],
    solutionResponse: grinderEvidence({
      evidenceId: "grinder_solution_concept",
      claim: "团队把储豆、定量落豆、研磨、粉仓或杯体与手柄收纳整合为户外磨豆机概念",
      sourceRefs: ["src_coffee_grinder_pptx"],
      ownership: "team",
      claimKind: "concept",
      publicCaveat: "最终为概念渲染与技术表达，未完成实物、人体工学或研磨均匀度验证。",
    }),
    teamOutputs: [
      grinderEvidence({
        evidenceId: "grinder_team_delivery",
        claim: "团队交付户外手摇磨豆机概念与技术表达",
        sourceRefs: ["src_coffee_grinder_pptx"],
        ownership: "team",
        claimKind: "concept",
      }),
    ],
    limitations: [
      "团队材料记录了 57 份问卷，但各题有效分母不一致。",
      "当前个人职责只确认设计简报与情绪板。",
      "原文件未记录最终优先户外便携的完整依据。",
      "项目未完成实物、人体工学、研磨均匀度或量产验证。",
    ],
    media: [
      {
        src: "/projects/grinder/cover.webp",
        width: 1920,
        height: 1080,
        maxCssWidth: 960,
        maxCssHeight: 540,
        alt: "户外手摇咖啡磨豆机概念渲染",
        caption: "户外磨豆机概念",
        purpose: "hero",
      },
      {
        src: "/projects/grinder/context.webp",
        width: 1920,
        height: 1080,
        maxCssWidth: 960,
        maxCssHeight: 540,
        alt: "手摇磨豆机户外使用情境",
        caption: "户外使用情境",
        purpose: "evidence",
      },
      {
        src: "/projects/grinder/exploded.webp",
        width: 788,
        height: 1400,
        maxCssWidth: 500,
        maxCssHeight: 900,
        alt: "手摇磨豆机爆炸结构图",
        caption: "概念结构表达",
        purpose: "lightbox",
        htmlSummary:
          "爆炸图展示储豆、定量落豆、研磨、粉仓或杯体与手柄收纳的概念整合关系；这是团队技术表达，未完成实物、人体工学、研磨均匀度或量产验证。",
      },
      {
        src: "/projects/grinder/final.webp",
        width: 1920,
        height: 1080,
        maxCssWidth: 960,
        maxCssHeight: 540,
        alt: "手摇磨豆机最终概念渲染",
        caption: "最终概念表达",
        purpose: "evidence",
      },
    ],
    nextSlug: null,
  },
] as const satisfies readonly ProjectCase[];

export type ProjectSlug = (typeof projects)[number]["slug"];
