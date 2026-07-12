export const siteContent = {
  name: "Leyang Song",
  language: "zh-CN",
  navigation: [
    { label: "项目", href: "/projects" },
    { label: "关于", href: "/about" },
    { label: "简历与联系", href: "/resume" },
  ],
  hero: {
    eyebrow: "工业设计 × 用户研究 × 产品判断",
    title: "从用户、场景与数据中，找到可执行的方向。",
    description: "宋乐扬｜工业设计背景，面向数据分析、商业分析与产品运营岗位。",
    primaryAction: { label: "查看精选项目", href: "#featured-projects" },
    secondaryAction: { label: "简历与联系方式", href: "/resume" },
  },
  capabilityGroups: [
    { label: "研究", items: ["用户调研", "实地调研", "市场调研"] },
    { label: "整理", items: ["服务蓝图", "数据整理", "证据归纳"] },
    { label: "落地", items: ["产品建模", "概念定价", "视觉表达"] },
  ],
} as const;
