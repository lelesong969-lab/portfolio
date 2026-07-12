import { expect, test } from "@playwright/test";

import publicOutputRules from "../scripts/public-output-rules.cjs";
import { gotoStable, publicRoutes } from "./helpers";

const { forbiddenPatterns } = publicOutputRules;

for (const route of publicRoutes) {
  test(`${route} public HTML and visible text remain privacy-safe`, async ({ page, request }) => {
    const response = await request.get(route);
    expect(response.status()).toBe(200);
    const html = await response.text();

    for (const { label, pattern } of forbiddenPatterns) {
      expect(html, `${route} contains ${label}`).not.toMatch(pattern);
    }

    await gotoStable(page, route);
    const visibleText = await page.locator("body").innerText();
    for (const { label, pattern } of forbiddenPatterns) {
      expect(visibleText, `${route} contains ${label}`).not.toMatch(pattern);
    }

    await expect(page.locator('a[href$=".pdf" i]')).toHaveCount(0);
  });
}
