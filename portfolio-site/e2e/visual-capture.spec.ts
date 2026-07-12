import path from "node:path";

import { test, type Page } from "@playwright/test";

import { prepareVisualCapture, projectRoutes } from "./helpers";

const screenshotRoot = path.join(process.cwd(), "docs", "qa", "screenshots");

async function neutralizeStickyElementsForFullPage(page: Page) {
  await page.addStyleTag({
    content: `
      .skip-link { visibility: hidden !important; }
      .site-header,
      [data-project-section-nav] {
        position: static !important;
        top: auto !important;
      }
    `,
  });
}

test.use({
  contextOptions: {
    reducedMotion: "reduce",
  },
  deviceScaleFactor: 2,
});

const homeViewports = [
  { width: 1440, height: 900 },
  { width: 1366, height: 768 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 430, height: 932 },
  { width: 390, height: 844 },
  { width: 320, height: 568 },
  { width: 320, height: 480 },
] as const;

test("capture the homepage viewport matrix and first fold", async ({ page }) => {
  test.setTimeout(240_000);

  for (const viewport of homeViewports) {
    await page.setViewportSize(viewport);
    await prepareVisualCapture(page, "/");

    if (viewport.width === 1440 && viewport.height === 900) {
      await page.screenshot({
        path: path.join(screenshotRoot, "home-1440x900-fold.png"),
        fullPage: false,
        animations: "disabled",
      });
    }

    await neutralizeStickyElementsForFullPage(page);
    await page.screenshot({
      path: path.join(screenshotRoot, `home-${viewport.width}x${viewport.height}-full.png`),
      fullPage: true,
      animations: "disabled",
    });
  }
});

for (const viewport of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
] as const) {
  test(`capture all project details at ${viewport.name} size`, async ({ page }) => {
    test.setTimeout(300_000);
    await page.setViewportSize(viewport);

    for (const project of projectRoutes) {
      await prepareVisualCapture(page, `/projects/${project.slug}`);
      await neutralizeStickyElementsForFullPage(page);
      await page.screenshot({
        path: path.join(
          screenshotRoot,
          `${project.slug}-${viewport.width}x${viewport.height}-full.png`,
        ),
        fullPage: true,
        animations: "disabled",
      });
    }
  });
}
