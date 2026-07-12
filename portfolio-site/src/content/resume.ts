import type { ProjectSlug } from "@/content/projects";

export const approvalChannels = [
  "codex_thread",
  "email",
  "document_comment",
  "other",
] as const;

export type ApprovalChannel = (typeof approvalChannels)[number];

export const publicContactFields = [
  "email",
  "phone",
  "links",
  "resumePdf",
] as const;

export type PublicContactField = (typeof publicContactFields)[number];

export interface ApprovalSource {
  channel: ApprovalChannel;
  reference: string;
  confirmationExcerpt: string;
}

export interface PublicationApproval {
  approvedAt: string;
  approvalSource: ApprovalSource;
  approvedFields: readonly [PublicContactField, ...PublicContactField[]];
}

export interface PublicContact {
  publicationApproval: PublicationApproval | null;
  email: string | null;
  phone: string | null;
  links: readonly { label: string; href: string }[];
  resumePdf: `/resume/${string}.pdf` | null;
}

export interface ResumeProjectSummary {
  slug: ProjectSlug;
  summary: string;
}

export interface ResumeContent {
  name: string;
  primaryDirection: string;
  secondaryDirections: readonly string[];
  positioning: string;
  workingMethod: readonly string[];
  projectSummaries: readonly ResumeProjectSummary[];
}

export interface AboutMethodStep {
  label: string;
  projectSlug: ProjectSlug;
  evidenceId: string;
  sectionId: "key-insights" | "final-outcome" | "my-contribution" | "full-process";
}

export interface AboutContent {
  transition: string;
  workingMethod: readonly AboutMethodStep[];
}

export const publicContact = {
  publicationApproval: null,
  email: null,
  phone: null,
  links: [],
  resumePdf: null,
} satisfies PublicContact;

export const publicContactPrivacyMessage =
  "为保护隐私，公开版未展示联系方式；请通过收到本作品集链接的招聘平台联系。";

export function isValidPublicationApproval(
  approval: unknown,
): approval is PublicationApproval {
  if (typeof approval !== "object" || approval === null) {
    return false;
  }

  const candidate = approval as Record<string, unknown>;
  const approvedAt = candidate.approvedAt;
  const source = candidate.approvalSource;
  const approvedFields = candidate.approvedFields;

  if (
    typeof approvedAt !== "string" ||
    typeof source !== "object" ||
    source === null ||
    !Array.isArray(approvedFields) ||
    approvedFields.length === 0
  ) {
    return false;
  }

  const seenFields = new Set<PublicContactField>();

  for (const field of approvedFields) {
    if (
      typeof field !== "string" ||
      !publicContactFields.includes(field as PublicContactField) ||
      seenFields.has(field as PublicContactField)
    ) {
      return false;
    }

    seenFields.add(field as PublicContactField);
  }

  const timestampMatch = approvedAt.match(
    /^(\d{4})-(\d{2})-(\d{2})T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/,
  );

  if (!timestampMatch || !Number.isFinite(Date.parse(approvedAt))) {
    return false;
  }

  const [, yearText, monthText, dayText] = timestampMatch;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const calendarDate = new Date(0);
  calendarDate.setUTCHours(0, 0, 0, 0);
  calendarDate.setUTCFullYear(year, month - 1, day);

  if (
    calendarDate.getUTCFullYear() !== year ||
    calendarDate.getUTCMonth() !== month - 1 ||
    calendarDate.getUTCDate() !== day
  ) {
    return false;
  }

  const approvalSource = source as Record<string, unknown>;

  return (
    typeof approvalSource.channel === "string" &&
    approvalChannels.includes(approvalSource.channel as ApprovalChannel) &&
    typeof approvalSource.reference === "string" &&
    approvalSource.reference.trim().length > 0 &&
    typeof approvalSource.confirmationExcerpt === "string" &&
    approvalSource.confirmationExcerpt.trim().length > 0
  );
}

export const resumeContent = {
  name: "Leyang Song",
  primaryDirection: "数据分析",
  secondaryDirections: ["商业分析", "产品运营"],
  positioning: "以工业设计训练为基础，把现场信息、研究材料与产品问题整理为可执行判断。",
  workingMethod: ["收集现场信息", "建立结构", "判断优先级", "表达方案"],
  projectSummaries: [
    {
      slug: "hotel-service-system",
      summary: "从酒店门口的双用户摩擦出发，连接实体触点、房态信息与服务响应。",
    },
    {
      slug: "car-vacuum",
      summary: "并列呈现研究输入、双路线概念、产品表达与概念定价，不补造因果链。",
    },
    {
      slug: "healing-glove",
      summary: "把定性需求整理为辅助抓握、反馈与陪伴功能的概念对应。",
    },
    {
      slug: "biomaterial-experiments",
      summary: "通过跨轮记录比较失败现象，并把观察转化为下一轮实验依据。",
    },
    {
      slug: "coffee-grinder",
      summary: "将分散的团队研究输入收敛为户外研磨场景下的设计方向。",
    },
  ],
} as const satisfies ResumeContent;

export const aboutContent = {
  transition:
    "工业设计训练让我习惯从现场、用户与物件关系出发。现在，我把这种训练转向数据分析、商业分析与产品运营，用证据组织问题、判断优先级，再把结论表达为可讨论、可执行的方案。",
  workingMethod: [
    {
      label: "收集现场信息",
      projectSlug: "hotel-service-system",
      evidenceId: "hotel_role_field_research",
      sectionId: "my-contribution",
    },
    {
      label: "建立结构",
      projectSlug: "hotel-service-system",
      evidenceId: "hotel_role_data_framework",
      sectionId: "my-contribution",
    },
    {
      label: "判断优先级",
      projectSlug: "hotel-service-system",
      evidenceId: "hotel_expected_functions",
      sectionId: "key-insights",
    },
    {
      label: "表达方案",
      projectSlug: "car-vacuum",
      evidenceId: "car_role_product_modeling",
      sectionId: "my-contribution",
    },
  ],
} as const satisfies AboutContent;
