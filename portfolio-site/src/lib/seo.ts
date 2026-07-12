import type { Metadata } from "next";
import { createElement, type ReactElement } from "react";

import { projects } from "@/content/projects";
import { siteContent } from "@/content/site";
import type { ProjectCase } from "@/content/types";
import { openGraphImageConfig } from "@/lib/seo-config";

const localSiteUrl = "http://localhost:3000";

export function resolveSiteUrl(
  value: string | undefined,
  vercelProductionUrl?: string,
): string {
  const candidates = [
    value,
    vercelProductionUrl ? `https://${vercelProductionUrl}` : undefined,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;

    try {
      const url = new URL(candidate);
      if (url.protocol === "http:" || url.protocol === "https:") {
        return url.origin;
      }
    } catch {
      // Try the next trusted environment-derived candidate.
    }
  }

  return localSiteUrl;
}

export const siteConfig = Object.freeze({
  name: siteContent.name,
  description: siteContent.hero.description,
  url: resolveSiteUrl(
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ),
});

const staticPageSeo = Object.freeze({
  home: {
    path: "/",
    title: "首页｜工业设计、用户研究与产品判断",
    description: "宋乐扬的项目作品集，呈现用户研究、信息整理与产品判断过程。",
  },
  projects: {
    path: "/projects",
    title: "项目总览｜五种从信息到方案的路径",
    description: "浏览五个项目的真实项目性质、已核实职责、研究方法与证据边界。",
  },
  about: {
    path: "/about",
    title: "关于｜证据驱动的产品判断",
    description: "了解宋乐扬从工业设计训练出发，以研究、整理、判断与表达推进项目的方法。",
  },
  resume: {
    path: "/resume",
    title: "简历与联系方式｜宋乐扬",
    description: "查看宋乐扬的公开方向、工作方法、项目摘要与已核实个人职责。",
  },
} as const);

export type StaticPageKey = keyof typeof staticPageSeo;

export function absoluteUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, `${siteConfig.url}/`).toString();
}

function createMetadata({
  description,
  path,
  title,
}: {
  description: string;
  path: string;
  title: string;
}): Metadata {
  const canonical = absoluteUrl(path);
  const openGraphImage = {
    url: absoluteUrl(openGraphImageConfig.path),
    ...openGraphImageConfig.size,
    alt: openGraphImageConfig.alt,
  };

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "zh_CN",
      siteName: siteConfig.name,
      url: canonical,
      images: [openGraphImage],
    },
  };
}

export function createStaticMetadata(page: StaticPageKey): Metadata {
  return createMetadata(staticPageSeo[page]);
}

export function createProjectMetadata(project: ProjectCase): Metadata {
  return createMetadata({
    path: `/projects/${project.slug}`,
    title: `${project.title}｜${project.nature}`,
    description: project.summary,
  });
}

export function getPublicRoutes(): readonly string[] {
  return [
    "/",
    "/projects",
    "/about",
    "/resume",
    ...projects.map((project) => `/projects/${project.slug}`),
  ];
}

export function createPersonJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    description: siteConfig.description,
    url: absoluteUrl("/"),
  } as const;
}

export function createProjectJsonLd(project: ProjectCase) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    genre: project.nature,
    url: absoluteUrl(`/projects/${project.slug}`),
  } as const;
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/[<>&\u2028\u2029]/g, (character) => {
    switch (character) {
      case "<":
        return "\\u003c";
      case ">":
        return "\\u003e";
      case "&":
        return "\\u0026";
      case "\u2028":
        return "\\u2028";
      case "\u2029":
        return "\\u2029";
      default:
        return character;
    }
  });
}

export function StructuredData({ data }: { data: unknown }): ReactElement {
  return createElement("script", {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: serializeJsonLd(data) },
  });
}
