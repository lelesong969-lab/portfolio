import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { gotoStable, publicRoutes } from "./helpers";

for (const route of publicRoutes) {
  test(`${route} has no serious or critical axe violations`, async ({ page }) => {
    await gotoStable(page, route);
    const results = await new AxeBuilder({ page }).analyze();
    const blockingViolations = results.violations
      .filter(({ impact }) => impact === "serious" || impact === "critical")
      .map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map(({ target }) => target) }));

    expect(blockingViolations).toEqual([]);
  });
}
