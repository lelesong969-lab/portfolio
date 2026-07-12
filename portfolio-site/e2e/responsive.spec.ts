import { expect, test } from "@playwright/test";

import { gotoStable, projectRoutes, publicRoutes } from "./helpers";

const viewportMatrix = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
] as const;

for (const viewport of viewportMatrix) {
  test(`${viewport.name} routes have one H1 and no horizontal overflow`, async ({ page }) => {
    await page.setViewportSize(viewport);

    for (const route of publicRoutes) {
      await gotoStable(page, route);
      await expect(page.locator("h1")).toHaveCount(1);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `${route} at ${viewport.width}px overflowed`).toBeLessThanOrEqual(1);
    }
  });
}

test("primary actions meet the 44 by 44 pixel touch target", async ({ page }) => {
  const actionSelector = [
    ".site-header__brand",
    ".touch-target",
    ".mobile-menu__trigger",
    "a[class*='min-h-11']",
    "button[class*='min-h-11']",
    "[data-project-card] > div > a[aria-label^='查看案例：']",
  ].join(",");

  for (const viewport of viewportMatrix) {
    await page.setViewportSize(viewport);

    for (const route of publicRoutes) {
      await gotoStable(page, route);
      const actions = page.locator(actionSelector).filter({ visible: true });
      const count = await actions.count();
      expect(count, `${route} should expose at least one primary action`).toBeGreaterThan(0);

      for (let index = 0; index < count; index += 1) {
        const box = await actions.nth(index).boundingBox();
        expect(box, `${route} action ${index} should have a box`).not.toBeNull();
        expect(box?.width ?? 0, `${route} action ${index} is too narrow`).toBeGreaterThanOrEqual(43.5);
        expect(box?.height ?? 0, `${route} action ${index} is too short`).toBeGreaterThanOrEqual(43.5);
      }
    }
  }
});

test("approved layout grid tokens resolve at each breakpoint", async ({ page }) => {
  const cases = [
    { width: 1600, columns: 12, margin: 64, gap: 24, maxContent: 1360 },
    { width: 1440, columns: 12, margin: 64, gap: 24 },
    { width: 1024, columns: 12, margin: 48, gap: 20 },
    { width: 768, columns: 8, margin: 32, gap: 20 },
    { width: 390, columns: 4, margin: 20, gap: 16 },
  ] as const;

  for (const expected of cases) {
    await page.setViewportSize({ width: expected.width, height: 900 });
    await gotoStable(page, "/");
    const measurements = await page.evaluate(() => {
      const shell = document.createElement("div");
      const grid = document.createElement("div");
      shell.className = "page-shell";
      grid.className = "layout-grid";
      shell.append(grid);
      document.body.append(shell);

      const shellStyle = getComputedStyle(shell);
      const gridStyle = getComputedStyle(grid);
      const result = {
        columns: gridStyle.gridTemplateColumns.split(" ").filter(Boolean).length,
        contentWidth:
          shell.getBoundingClientRect().width -
          Number.parseFloat(shellStyle.paddingLeft) -
          Number.parseFloat(shellStyle.paddingRight),
        gap: Number.parseFloat(gridStyle.columnGap),
        margin: Number.parseFloat(shellStyle.paddingLeft),
      };
      shell.remove();
      return result;
    });

    expect(measurements.columns).toBe(expected.columns);
    expect(measurements.margin).toBeCloseTo(expected.margin, 1);
    expect(measurements.gap).toBeCloseTo(expected.gap, 1);
    if ("maxContent" in expected) {
      expect(measurements.contentWidth).toBeCloseTo(expected.maxContent, 1);
    }
  }
});

test("visual layout does not reverse project or hero reading order", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoStable(page, "/projects");
  const slugs = await page
    .locator('[data-testid="project-overview-item"]')
    .evaluateAll((items) => items.map((item) => item.getAttribute("data-project-slug")));
  expect(slugs).toEqual(projectRoutes.map(({ slug }) => slug));
  const projectOrders = await page
    .locator('[data-testid="project-overview-item"]')
    .evaluateAll((items) => items.map((item) => getComputedStyle(item).order));
  expect(projectOrders.every((order) => order === "0")).toBe(true);

  await gotoStable(page, "/");
  const heroOrders = await page
    .locator("[data-home-hero] > *")
    .evaluateAll((items) => items.map((item) => Number.parseInt(getComputedStyle(item).order, 10)));
  expect(heroOrders).toEqual([...heroOrders].sort((left, right) => left - right));
});

test("page titles stay within the approved desktop and mobile line limits", async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900, maxLines: 2 },
    { width: 390, height: 844, maxLines: 3 },
  ] as const) {
    await page.setViewportSize(viewport);

    for (const route of publicRoutes) {
      await gotoStable(page, route);
      const lineCount = await page.locator("h1").evaluate((heading) => {
        const lineHeight = Number.parseFloat(getComputedStyle(heading).lineHeight);
        return Math.round(heading.getBoundingClientRect().height / lineHeight);
      });
      expect(
        lineCount,
        `${route} at ${viewport.width}px should use at most ${viewport.maxLines} title lines`,
      ).toBeLessThanOrEqual(viewport.maxLines);
    }
  }
});

test("320px supporting-project titles do not leave a single Chinese character line", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await gotoStable(page, "/");

  for (const project of projectRoutes.slice(3)) {
    const title = page
      .locator(`[data-more-projects] a[aria-label="查看案例：${project.title}"]`)
      .getByText(project.title, { exact: true });
    const charactersPerLine = await title.evaluate((element) => {
      const textNode = element.firstChild;
      if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return [];

      const lines = new Map<number, number>();
      for (let index = 0; index < (textNode.textContent?.length ?? 0); index += 1) {
        const range = document.createRange();
        range.setStart(textNode, index);
        range.setEnd(textNode, index + 1);
        const top = Math.round(range.getBoundingClientRect().top);
        lines.set(top, (lines.get(top) ?? 0) + 1);
      }
      return Array.from(lines.values());
    });

    expect(charactersPerLine, `${project.title} contains a one-character line`).not.toContain(1);
  }
});

test("the skip link stays off-canvas until keyboard focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoStable(page, "/");
  const skipLink = page.getByRole("link", { name: "跳到主要内容" });

  await expect(skipLink).not.toBeInViewport();
  await skipLink.focus();
  await expect(skipLink).toBeInViewport();
  await page.locator("body").click({ position: { x: 380, y: 800 } });
  await expect(skipLink).not.toBeInViewport();
});

test("320 by 480 initial viewport keeps the title and primary actions clear", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 480 });
  await gotoStable(page, "/");
  const skipLink = page.getByRole("link", { name: "跳到主要内容" });
  await expect(skipLink).not.toBeInViewport();

  const geometry = await page.evaluate(() => {
    const header = document.querySelector<HTMLElement>(".site-header");
    const heading = document.querySelector<HTMLElement>("h1");
    const actions = Array.from(
      document.querySelectorAll<HTMLAnchorElement>("[data-home-hero] a"),
    );
    if (!header || !heading || actions.length !== 2) return null;

    const headerBox = header.getBoundingClientRect();
    const headingBox = heading.getBoundingClientRect();
    const actionBoxes = actions.map((action) => {
      const box = action.getBoundingClientRect();
      return {
        bottom: box.bottom,
        left: box.left,
        right: box.right,
        top: box.top,
      };
    });
    const overlaps = (
      first: { bottom: number; left: number; right: number; top: number },
      second: { bottom: number; left: number; right: number; top: number },
    ) =>
      first.left < second.right &&
      first.right > second.left &&
      first.top < second.bottom &&
      first.bottom > second.top;

    return {
      actionsInInitialViewport: actionBoxes.every(
        (box) => box.top >= 0 && box.bottom <= window.innerHeight,
      ),
      actionsOverlap: overlaps(actionBoxes[0], actionBoxes[1]),
      actionsOverlapHeader: actionBoxes.some((box) =>
        overlaps(box, {
          bottom: headerBox.bottom,
          left: headerBox.left,
          right: headerBox.right,
          top: headerBox.top,
        }),
      ),
      actionsOverlapHeading: actionBoxes.some((box) =>
        overlaps(box, {
          bottom: headingBox.bottom,
          left: headingBox.left,
          right: headingBox.right,
          top: headingBox.top,
        }),
      ),
      headerBottom: headerBox.bottom,
      headingTop: headingBox.top,
    };
  });

  expect(geometry).not.toBeNull();
  expect(geometry?.headerBottom ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(
    geometry?.headingTop ?? Number.NEGATIVE_INFINITY,
  );
  expect(geometry?.actionsOverlap).toBe(false);
  expect(geometry?.actionsOverlapHeader).toBe(false);
  expect(geometry?.actionsOverlapHeading).toBe(false);
  expect(geometry?.actionsInInitialViewport).toBe(true);
});

test("390px chapter navigation exposes its last item and anchors below sticky bars", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoStable(page, "/projects/hotel-service-system");
  const chapterNav = page.getByRole("navigation", { name: "项目章节" });
  const lastChapter = chapterNav.getByRole("link", { name: "完整过程" });

  const isHorizontallyScrollable = await chapterNav.evaluate(
    (element) => element.scrollWidth > element.clientWidth,
  );
  expect(isHorizontallyScrollable).toBe(true);
  await lastChapter.scrollIntoViewIfNeeded();

  const visibility = await page.evaluate(() => {
    const nav = document.querySelector<HTMLElement>("[data-project-section-nav]");
    const link = nav?.querySelector<HTMLAnchorElement>('a[href="#full-process"]');
    if (!nav || !link) return null;
    const navBox = nav.getBoundingClientRect();
    const linkBox = link.getBoundingClientRect();
    return { navLeft: navBox.left, navRight: navBox.right, linkLeft: linkBox.left, linkRight: linkBox.right };
  });
  expect(visibility).not.toBeNull();
  expect(visibility?.linkLeft ?? Number.NEGATIVE_INFINITY).toBeGreaterThanOrEqual(
    visibility?.navLeft ?? Number.POSITIVE_INFINITY,
  );
  expect(visibility?.linkRight ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(
    visibility?.navRight ?? Number.NEGATIVE_INFINITY,
  );

  await lastChapter.click();
  await expect(page).toHaveURL(/#full-process$/);
  await expect
    .poll(() =>
      page.evaluate(() => {
        const header = document.querySelector<HTMLElement>(".site-header");
        const nav = document.querySelector<HTMLElement>("[data-project-section-nav]");
        const target = document.getElementById("full-process");
        if (!header || !nav || !target) return false;
        const blockerBottom = Math.max(
          header.getBoundingClientRect().bottom,
          nav.getBoundingClientRect().bottom,
        );
        return target.getBoundingClientRect().top >= blockerBottom - 1;
      }),
    )
    .toBe(true);
});
