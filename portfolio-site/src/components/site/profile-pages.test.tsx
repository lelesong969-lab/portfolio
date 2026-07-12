import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AboutPage from "@/app/about/page";
import ResumePage from "@/app/resume/page";
import { ContactActions } from "@/components/site/contact-actions";
import { projects } from "@/content/projects";
import {
  type PublicContact,
  publicContactPrivacyMessage,
  resumeContent,
} from "@/content/resume";

const methodLabels = [
  "收集现场信息",
  "建立结构",
  "判断优先级",
  "表达方案",
] as const;

const validPublicationApproval = {
  approvedAt: "2026-07-12T10:00:00+08:00",
  approvalSource: {
    channel: "codex_thread",
    reference: "task-message-123",
    confirmationExcerpt: "批准公开邮件。",
  },
  approvedFields: ["email", "phone", "links", "resumePdf"],
} as const;

describe("profile pages", () => {
  it("关于页只用一个指定 H1，并按顺序链接四步工作方式到真实项目", () => {
    const { container } = render(<AboutPage />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "从工业设计训练到证据驱动的产品判断",
      }),
    ).toBeInTheDocument();

    const transition = container.querySelector("[data-about-transition]");
    expect(transition).toBeInTheDocument();
    expect(transition?.textContent?.replace(/\s/g, "").length).toBeLessThanOrEqual(
      120,
    );

    const method = screen.getByRole("list", { name: "四步工作方式" });
    const items = within(method).getAllByRole("listitem");
    expect(items).toHaveLength(4);
    expect(items.map((item) => item.textContent)).toEqual(
      methodLabels.map((label) => expect.stringContaining(label)),
    );

    const projectHrefs = new Set(projects.map((project) => `/projects/${project.slug}`));
    items.forEach((item) => {
      const link = within(item).getByRole("link");
      const href = link.getAttribute("href")?.split("#")[0];
      expect(href).toBeDefined();
      expect(projectHrefs.has(href ?? "")).toBe(true);
      expect(item).toHaveAttribute("data-evidence-id");
    });
  });

  it("关于页不渲染未核实的教育或实习时间线", () => {
    render(<AboutPage />);

    expect(screen.queryByRole("heading", { name: /教育|实习|时间线/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/待核实|占位/)).not.toBeInTheDocument();
  });

  it("简历页展示姓名、方向、定位、方法，以及五个项目的摘要与已核实职责", () => {
    const { container } = render(<ResumePage />);
    const page = within(container);

    expect(page.getByRole("heading", { level: 1, name: resumeContent.name })).toBeInTheDocument();
    expect(page.getByText(resumeContent.positioning)).toBeInTheDocument();
    expect(page.getByText(resumeContent.primaryDirection)).toBeInTheDocument();
    resumeContent.secondaryDirections.forEach((direction) => {
      expect(page.getByText(direction)).toBeInTheDocument();
    });
    resumeContent.workingMethod.forEach((step) => {
      expect(page.getByText(step)).toBeInTheDocument();
    });

    const projectList = page.getByRole("list", { name: "项目摘要与个人职责" });
    const projectItems = projectList.querySelectorAll(":scope > li");
    expect(projectItems).toHaveLength(5);

    resumeContent.projectSummaries.forEach(({ slug, summary }) => {
      const project = projects.find((item) => item.slug === slug);
      expect(project).toBeDefined();
      expect(within(projectList).getByText(summary)).toBeInTheDocument();

      project?.personalContributions
        .filter(
          (contribution) =>
            contribution.ownership === "personal" &&
            contribution.verificationStatus === "verified",
        )
        .forEach((contribution) => {
          expect(
            within(projectList).getByText(contribution.claim),
          ).toBeInTheDocument();
        });
    });
  });

  it("未批准时即使误填联系字段也全部隐藏，并显示固定隐私提示", () => {
    const { container } = render(
      <ContactActions
        contact={{
          publicationApproval: null,
          email: "mistaken@example.invalid",
          phone: "00000000000",
          links: [{ label: "外部主页", href: "https://example.invalid" }],
          resumePdf: "/resume/mistaken.pdf",
        }}
      />,
    );
    const contact = within(container);

    expect(contact.getByText(publicContactPrivacyMessage)).toBeInTheDocument();
    expect(container.querySelector('a[href^="mailto:"]')).not.toBeInTheDocument();
    expect(container.querySelector('a[href^="tel:"]')).not.toBeInTheDocument();
    expect(container.querySelector('a[href$=".pdf"]')).not.toBeInTheDocument();
    expect(container.querySelector('a[href^="http"]')).not.toBeInTheDocument();
  });

  it("公开批准存在时只渲染非空联系字段", () => {
    const { container } = render(
      <ContactActions
        contact={{
          publicationApproval: {
            ...validPublicationApproval,
          },
          email: "approved@example.invalid",
          phone: null,
          links: [
            { label: "", href: "" },
            { label: "空地址", href: "" },
          ],
          resumePdf: null,
        }}
      />,
    );
    const contact = within(container);

    expect(container.querySelector('a[href="mailto:approved@example.invalid"]')).toBeInTheDocument();
    expect(container.querySelector('a[href^="tel:"]')).not.toBeInTheDocument();
    expect(container.querySelector('a[href$=".pdf"]')).not.toBeInTheDocument();
    expect(container.querySelectorAll("a")).toHaveLength(1);
    expect(container.querySelector('a[href=""]')).not.toBeInTheDocument();
    expect(contact.queryByText(publicContactPrivacyMessage)).not.toBeInTheDocument();
  });

  it("批准记录无效时等同未批准，并隐藏全部误填字段", () => {
    const invalidApprovals = [
      {
        ...validPublicationApproval,
        approvedAt: "2026-07-12T10:00:00",
      },
      {
        ...validPublicationApproval,
        approvedAt: "not-a-date",
      },
      {
        ...validPublicationApproval,
        approvalSource: {
          ...validPublicationApproval.approvalSource,
          channel: "invalid-channel",
        },
      },
      {
        ...validPublicationApproval,
        approvalSource: {
          ...validPublicationApproval.approvalSource,
          reference: "   ",
        },
      },
      {
        ...validPublicationApproval,
        approvalSource: {
          ...validPublicationApproval.approvalSource,
          confirmationExcerpt: "   ",
        },
      },
      {
        ...validPublicationApproval,
        approvedFields: [],
      },
      {
        ...validPublicationApproval,
        approvedFields: ["email", "unsupported-field"],
      },
      {
        ...validPublicationApproval,
        approvedFields: ["email", "email"],
      },
    ];

    invalidApprovals.forEach((publicationApproval) => {
      const contact = {
        publicationApproval,
        email: "mistaken@example.invalid",
        phone: "00000000000",
        links: [{ label: "外部主页", href: "https://example.invalid" }],
        resumePdf: "/resume/missing.pdf",
      } as unknown as PublicContact;
      const { container, unmount } = render(<ContactActions contact={contact} />);

      expect(within(container).getByText(publicContactPrivacyMessage)).toBeInTheDocument();
      expect(container.querySelector("a")).not.toBeInTheDocument();
      unmount();
    });
  });

  it("只批准 email 时隐藏其他误填字段，且不检查未批准的 PDF", () => {
    const { container } = render(
      <ContactActions
        contact={{
          publicationApproval: {
            ...validPublicationApproval,
            approvedFields: ["email"],
          },
          email: "approved@example.invalid",
          phone: "00000000000",
          links: [{ label: "外部主页", href: "https://example.invalid" }],
          resumePdf: "/resume/missing-unapproved.pdf",
        }}
      />,
    );

    expect(container.querySelectorAll("a")).toHaveLength(1);
    expect(
      container.querySelector('a[href="mailto:approved@example.invalid"]'),
    ).toHaveTextContent("邮件");
    expect(container.querySelector('a[href^="tel:"]')).not.toBeInTheDocument();
    expect(container.querySelector('a[href^="https:"]')).not.toBeInTheDocument();
    expect(container.querySelector('a[href$=".pdf"]')).not.toBeInTheDocument();
  });

  it("有效批准最终没有可渲染动作时显示固定隐私提示", () => {
    const { container } = render(
      <ContactActions
        contact={{
          publicationApproval: {
            ...validPublicationApproval,
            approvedFields: ["email"],
          },
          email: null,
          phone: "00000000000",
          links: [{ label: "外部主页", href: "https://example.invalid" }],
          resumePdf: "/resume/missing-unapproved.pdf",
        }}
      />,
    );

    expect(within(container).getByText(publicContactPrivacyMessage)).toBeInTheDocument();
    expect(container.querySelector("a")).not.toBeInTheDocument();
  });

  it("批准后只保留安全的 HTTPS 外部链接", () => {
    const { container } = render(
      <ContactActions
        contact={{
          publicationApproval: {
            ...validPublicationApproval,
            approvedFields: ["links"],
          },
          email: null,
          phone: null,
          links: [
            { label: "安全主页", href: "https://example.invalid/profile" },
            { label: "HTTP", href: "http://example.invalid" },
            { label: "脚本", href: "javascript:alert(1)" },
            { label: "数据", href: "data:text/plain,unsafe" },
            { label: "文件传输", href: "ftp://example.invalid/file" },
            { label: "协议相对", href: "//example.invalid/profile" },
            { label: "缺少双斜线", href: "https:example.invalid/profile" },
          ],
          resumePdf: null,
        }}
      />,
    );

    expect(container.querySelectorAll("a")).toHaveLength(1);
    expect(
      container.querySelector('a[href="https://example.invalid/profile"]'),
    ).toHaveTextContent("安全主页");
  });

  it("批准的 PDF 文件缺失时以清晰错误阻断渲染", () => {
    expect(() =>
      render(
        <ContactActions
          contact={{
            publicationApproval: {
              ...validPublicationApproval,
              approvedFields: ["resumePdf"],
            },
            email: null,
            phone: null,
            links: [],
            resumePdf: "/resume/missing-approved.pdf",
          }}
        />,
      ),
    ).toThrow(/Approved resume PDF is missing: public\/resume\/missing-approved\.pdf/);
  });

  it("实际关于页与简历页不包含联系协议、PDF 或外部链接", () => {
    const about = render(<AboutPage />);
    const resume = render(<ResumePage />);
    const anchors = [
      ...about.container.querySelectorAll("a"),
      ...resume.container.querySelectorAll("a"),
    ];

    anchors.forEach((anchor) => {
      const href = anchor.getAttribute("href") ?? "";
      expect(href).not.toMatch(/^mailto:/);
      expect(href).not.toMatch(/^tel:/);
      expect(href).not.toMatch(/\.pdf(?:$|[?#])/);
      expect(href).not.toMatch(/^https?:\/\//);
      expect(href).not.toMatch(/^\/\//);
    });
  });
});
