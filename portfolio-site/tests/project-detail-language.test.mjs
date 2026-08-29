import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("all seven projects provide complete English detail copy", async () => {
  const data = await read("src/data/portfolio.ts");

  assert.equal((data.match(/^\s{4}detailEn:\s*\{/gm) ?? []).length, 7);
  assert.equal((data.match(/^\s{6}galleryCopy:\s*\[/gm) ?? []).length, 7);
  assert.equal((data.match(/^\s{6}externalBusinessMeanings:\s*\[/gm) ?? []).length, 7);
});

test("project detail pages render from the active language", async () => {
  const [app, detail] = await Promise.all([
    read("src/App.tsx"),
    read("src/components/ProjectCaseStudy.tsx"),
  ]);

  assert.match(app, /<ProjectCaseStudy[\s\S]*language=\{language\}/);
  assert.match(detail, /language: Language/);
  assert.match(detail, /language === "en" \? project\.detailEn/);
  assert.match(detail, /project-case-study__context-copy/);
  assert.match(detail, /\{content\.context\}/);
  assert.match(detail, /INTERACTIVE VISUAL EVIDENCE/);
  assert.match(detail, /Explore the complete charts, process<\/span>[\s\S]*documentation, and design evidence/);
  assert.match(detail, /<ProjectCaseNavigator/);
});
