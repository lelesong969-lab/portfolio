import { expect, test } from "@playwright/test";

import { gotoStable, projectRoutes, publicRoutes } from "./helpers";

test("all nine public HTML routes are reachable with one main heading", async ({ page }) => {
  expect(publicRoutes).toHaveLength(9);

  for (const route of publicRoutes) {
    await gotoStable(page, route);
    await expect(page.locator("main#main-content")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveCount(1);
  }
});

test("the three featured projects are each reachable in one click", async ({ page }) => {
  for (const project of projectRoutes.slice(0, 3)) {
    await gotoStable(page, "/");
    const link = page.locator(
      `[data-project-card] a[aria-label="查看案例：${project.title}"]`,
    );

    await expect(link).toHaveCount(1);
    await link.click();
    await expect(page).toHaveURL(new RegExp(`/projects/${project.slug}$`));
    await expect(page.getByRole("heading", { level: 1, name: project.title })).toBeVisible();
  }
});

test("project detail routes preserve the approved sequence and exits", async ({ page }) => {
  for (const project of projectRoutes) {
    await gotoStable(page, `/projects/${project.slug}`);
    await expect(page.getByRole("link", { name: "← 返回项目总览" })).toHaveAttribute(
      "href",
      "/projects",
    );
    await expect(
      page
        .getByRole("navigation", { name: "主导航" })
        .getByRole("link", { name: "简历与联系", exact: true }),
    ).toHaveAttribute("href", "/resume");

    const nextLink = project.nextSlug
      ? page.getByRole("link", { name: /^下一个项目：/ })
      : page.getByRole("link", { name: "返回项目总览", exact: true });
    await expect(nextLink).toHaveAttribute(
      "href",
      project.nextSlug ? `/projects/${project.nextSlug}` : "/projects",
    );
  }
});

test("the resume and contact destination ends in a truthful privacy state", async ({ page }) => {
  await gotoStable(page, "/projects/hotel-service-system");
  await page
    .getByRole("navigation", { name: "主导航" })
    .getByRole("link", { name: "简历与联系", exact: true })
    .click();
  await expect(page).toHaveURL(/\/resume$/);
  await expect(page.getByRole("heading", { level: 2, name: "联系方式" })).toBeVisible();
  await expect(page.getByText(/为保护隐私/).first()).toBeVisible();
});

test("lightbox supports keyboard entry, Escape, and focus restoration", async ({ page }) => {
  await gotoStable(page, "/projects/hotel-service-system");
  const opener = page.getByRole("button", { name: /^放大查看：/ }).first();

  await opener.scrollIntoViewIfNeeded();
  await opener.focus();
  await page.keyboard.press("Enter");

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(page.getByRole("button", { name: "关闭大图" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

test("client navigation moves focus into the destination page", async ({ page }) => {
  await gotoStable(page, "/projects");
  const sourceLink = page.locator(
    '[data-project-card] a[aria-label="查看案例：酒店门把手与服务系统"]',
  );

  await sourceLink.focus();
  await sourceLink.click();
  await expect(page).toHaveURL(/\/projects\/hotel-service-system$/);

  await expect
    .poll(() =>
      page.evaluate(() => {
        const active = document.activeElement;
        return active?.matches("h1, main#main-content") ?? false;
      }),
    )
    .toBe(true);
});
