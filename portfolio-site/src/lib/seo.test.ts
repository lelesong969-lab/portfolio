import { cleanup, render } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it } from "vitest";

import HomePage, { metadata as homeMetadata } from "@/app/page";
import { metadata as aboutMetadata } from "@/app/about/page";
import { metadata as projectsMetadata } from "@/app/projects/page";
import ProjectPage, {
  generateMetadata as generateProjectMetadata,
} from "@/app/projects/[slug]/page";
import {
  alt as openGraphImageAlt,
  contentType as openGraphImageContentType,
  size as openGraphImageSize,
} from "@/app/opengraph-image";
import { metadata as resumeMetadata } from "@/app/resume/page";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { projects } from "@/content/projects";
import { openGraphImageConfig } from "@/lib/seo-config";
import {
  absoluteUrl,
  createPersonJsonLd,
  createProjectMetadata,
  createProjectJsonLd,
  createStaticMetadata,
  getPublicRoutes,
  resolveSiteUrl,
  serializeJsonLd,
  siteConfig,
} from "@/lib/seo";

afterEach(cleanup);

function canonicalOf(metadata: typeof homeMetadata): string {
  return String(metadata.alternates?.canonical);
}

describe("SEO metadata", () => {
  it("uses an explicit public URL or the safe local fallback", () => {
    expect(resolveSiteUrl(undefined)).toBe(
      "https://leyang-portfolio-site.vercel.app",
    );
    expect(resolveSiteUrl("not-a-url")).toBe(
      "https://leyang-portfolio-site.vercel.app",
    );
    expect(resolveSiteUrl("javascript:alert(1)")).toBe(
      "https://leyang-portfolio-site.vercel.app",
    );
    expect(resolveSiteUrl("https://localhost:4443/")).toBe(
      "https://localhost:4443",
    );
    expect(siteConfig.url).toBe(
      resolveSiteUrl(
        process.env.NEXT_PUBLIC_SITE_URL,
        process.env.VERCEL_PROJECT_PRODUCTION_URL,
      ),
    );
  });

  it("uses the Vercel production domain when no explicit site URL exists", () => {
    expect(resolveSiteUrl(undefined, "leyang-portfolio-site.vercel.app")).toBe(
      "https://leyang-portfolio-site.vercel.app",
    );
  });

  it("gives every static public route a distinct Chinese title and description", () => {
    const entries = [
      ["/", homeMetadata],
      ["/projects", projectsMetadata],
      ["/about", aboutMetadata],
      ["/resume", resumeMetadata],
    ] as const;
    const titles = entries.map(([, metadata]) => String(metadata.title));
    const descriptions = entries.map(([, metadata]) => metadata.description);

    expect(new Set(titles)).toHaveLength(entries.length);
    expect(new Set(descriptions)).toHaveLength(entries.length);
    for (const [path, metadata] of entries) {
      expect(String(metadata.title)).toMatch(/[\u3400-\u9fff]/);
      expect(metadata.description).toMatch(/[\u3400-\u9fff]/);
      expect(canonicalOf(metadata)).toBe(absoluteUrl(path));
      expect(canonicalOf(metadata)).toMatch(/^https?:\/\//);
    }
  });

  it("includes each project's real nature in its unique metadata title", async () => {
    const titles: string[] = [];

    for (const project of projects) {
      const metadata = await generateProjectMetadata({
        params: Promise.resolve({ slug: project.slug }),
      });
      const title = String(metadata.title);
      titles.push(title);

      expect(title).toContain(project.title);
      expect(title).toContain(project.nature);
      expect(metadata.description).toBe(project.summary);
      expect(String(metadata.alternates?.canonical)).toBe(
        absoluteUrl(`/projects/${project.slug}`),
      );
    }

    expect(new Set(titles)).toHaveLength(projects.length);
  });

  it("keeps the generated Open Graph image on every static and project page", () => {
    const expectedImage = {
      url: absoluteUrl(openGraphImageConfig.path),
      ...openGraphImageConfig.size,
      alt: openGraphImageConfig.alt,
    };
    const metadataEntries = [
      createStaticMetadata("home"),
      createStaticMetadata("projects"),
      createStaticMetadata("about"),
      createStaticMetadata("resume"),
      ...projects.map(createProjectMetadata),
    ];

    expect(metadataEntries).toHaveLength(9);
    for (const metadata of metadataEntries) {
      expect(metadata.openGraph?.images).toEqual([expectedImage]);
    }

    expect(openGraphImageAlt).toBe(openGraphImageConfig.alt);
    expect(openGraphImageSize).toBe(openGraphImageConfig.size);
    expect(openGraphImageContentType).toBe(openGraphImageConfig.contentType);
    expect(Object.isFrozen(openGraphImageConfig)).toBe(true);
    expect(Object.isFrozen(openGraphImageConfig.size)).toBe(true);
  });
});

describe("public discovery files", () => {
  it("publishes exactly the nine real public routes in the sitemap", () => {
    const expectedRoutes = [
      "/",
      "/projects",
      "/about",
      "/resume",
      ...projects.map((project) => `/projects/${project.slug}` as const),
    ];

    expect(getPublicRoutes()).toEqual(expectedRoutes);
    expect(getPublicRoutes()).toHaveLength(9);
    expect(sitemap().map((entry) => entry.url)).toEqual(
      expectedRoutes.map((route) => absoluteUrl(route)),
    );
  });

  it("allows public pages and points robots to the local-safe sitemap URL", () => {
    const result = robots();

    expect(result.rules).toEqual({ userAgent: "*", allow: "/" });
    expect(result.sitemap).toBe(absoluteUrl("/sitemap.xml"));
  });
});

describe("safe structured data", () => {
  it("limits Person and CreativeWork data to approved public fields", () => {
    const person = createPersonJsonLd();
    const work = createProjectJsonLd(projects[0]);

    expect(Object.keys(person).sort()).toEqual(
      ["@context", "@type", "description", "name", "url"].sort(),
    );
    expect(Object.keys(work).sort()).toEqual(
      ["@context", "@type", "genre", "name", "url"].sort(),
    );
    expect(work.name).toBe(projects[0].title);
    expect(work.genre).toBe(projects[0].nature);

    const serialized = JSON.stringify([person, work]);
    expect(serialized).not.toMatch(/mailto:|tel:|jobTitle/i);
    expect(serialized).not.toMatch(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/);
    expect(serialized).not.toMatch(/(?<!\d)1[3-9]\d{9}(?!\d)/);
  });

  it("escapes script-breaking characters before embedding JSON-LD", () => {
    const serialized = serializeJsonLd({ value: "</script><script>" });

    expect(serialized).not.toContain("<");
    expect(JSON.parse(serialized)).toEqual({ value: "</script><script>" });
  });

  it("renders Person on home and CreativeWork on a project page", async () => {
    const home = render(createElement(HomePage));
    const homeScripts = home.container.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    expect(homeScripts).toHaveLength(1);
    expect(JSON.parse(homeScripts[0].textContent ?? "{}")["@type"]).toBe(
      "Person",
    );

    cleanup();
    const project = projects[0];
    const projectView = render(
      await ProjectPage({ params: Promise.resolve({ slug: project.slug }) }),
    );
    const projectScripts = projectView.container.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    expect(projectScripts).toHaveLength(1);
    const work = JSON.parse(projectScripts[0].textContent ?? "{}");
    expect(work["@type"]).toBe("CreativeWork");
    expect(work.name).toBe(project.title);
    expect(work.genre).toBe(project.nature);
  });
});
