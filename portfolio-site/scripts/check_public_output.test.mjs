// @vitest-environment node

import { describe, expect, test } from "vitest";

import {
  DEFAULT_SCAN_ROOTS,
  findForbiddenMatches,
  isScannableTextFile,
  scanPublicOutput,
} from "./check_public_output.mjs";

describe("public output scanner", () => {
  test("recognizes every required scan root", () => {
    expect(DEFAULT_SCAN_ROOTS).toEqual([
      "src/content",
      ".next/server/app",
      ".next/server/chunks",
      ".next/static",
      "public",
    ]);
  });

  test("reports forbidden public markers without echoing source text", () => {
    const matches = findForbiddenMatches('href="mailto:" hidden contact and Eric' + " Song");

    expect(matches.map(({ label }) => label)).toEqual([
      "email link",
      "historical English alias",
    ]);
    expect(matches.every(({ match }) => match === undefined)).toBe(true);
  });

  test("does not mistake framework and asset syntax for contact data or local paths", () => {
    const matches = findForbiddenMatches(
      "hotel: tel:!0 © 2014-2026 U+1234-5678 new URL(input, 'x:/')",
    );

    expect(matches).toEqual([]);
  });

  test("reports unsupported market, outcome, and medical claims", () => {
    const matches = findForbiddenMatches("提升 40%，建议价 ¥998，已经落地并作为医疗器械销售");

    expect(matches.map(({ label }) => label)).toEqual([
      "unsupported uplift",
      "unsupported market price",
      "unsupported launched outcome",
      "unsupported medical-device claim",
    ]);
  });

  test("only accepts the explicit text extension allowlist", () => {
    expect(isScannableTextFile("page.html")).toBe(true);
    expect(isScannableTextFile("payload.rsc")).toBe(true);
    expect(isScannableTextFile("image.webp")).toBe(false);
    expect(isScannableTextFile("font.woff2")).toBe(false);
    expect(isScannableTextFile("extensionless")).toBe(false);
  });

  test("fails when any requested scan root is missing", async () => {
    await expect(
      scanPublicOutput({ cwd: process.cwd(), roots: ["missing-public-scan-root"] }),
    ).rejects.toThrow(/missing scan root/i);
  });

  test("scans the current content root without forbidden matches", async () => {
    const result = await scanPublicOutput({ cwd: process.cwd(), roots: ["src/content"] });

    expect(result.scannedRoots).toBe(1);
    expect(result.scannedTextFiles).toBeGreaterThan(0);
    expect(result.matches).toEqual([]);
  });
});
