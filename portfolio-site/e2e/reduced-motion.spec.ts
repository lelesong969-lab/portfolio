import { expect, test } from "@playwright/test";

import { gotoStable } from "./helpers";

test("reduced motion keeps initial content visible and removes movement", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await gotoStable(page, "/");

  const state = await page.evaluate(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>(
        "[data-motion], [data-parallax], [data-page-transition]",
      ),
    );
    return {
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
      nodes: nodes.map((node) => {
        const style = getComputedStyle(node);
        return {
          opacity: Number.parseFloat(style.opacity),
          transform: style.transform,
          transitionDuration: Math.max(
            ...style.transitionDuration
              .split(",")
              .map((duration) =>
                duration.trim().endsWith("ms")
                  ? Number.parseFloat(duration) / 1000
                  : Number.parseFloat(duration),
              ),
          ),
        };
      }),
    };
  });

  expect(state.nodes.length).toBeGreaterThan(0);
  expect(state.scrollBehavior).toBe("auto");
  expect(state.nodes.every(({ opacity }) => opacity === 1)).toBe(true);
  expect(state.nodes.every(({ transform }) => transform === "none")).toBe(true);
  expect(state.nodes.every(({ transitionDuration }) => transitionDuration <= 0.12)).toBe(true);
  await expect(page.locator("[data-parallax]")).toHaveAttribute("data-parallax-active", "false");
});

test("motion preference changes update the active session in both directions", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await gotoStable(page, "/");
  const parallax = page.locator("[data-parallax]");
  await expect(parallax).toHaveAttribute("data-parallax-active", "true");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(parallax).toHaveAttribute("data-parallax-runtime", "reduced");
  await expect(parallax).toHaveAttribute("data-parallax-active", "false");
  await expect(parallax).toHaveCSS("transform", "none");

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(parallax).toHaveAttribute("data-parallax-runtime", "normal");
  await expect(parallax).toHaveAttribute("data-parallax-active", "true");
});

test("normal motion never blocks the resume navigation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await gotoStable(page, "/");
  await page
    .locator("[data-home-hero]")
    .getByRole("link", { name: "简历与联系方式" })
    .click();
  await expect(page).toHaveURL(/\/resume$/);
  await expect(page.locator("h1")).toBeVisible();
});
