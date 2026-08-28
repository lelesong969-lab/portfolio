import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("the portfolio always boots in English", async () => {
  const [html, app] = await Promise.all([
    read("index.html"),
    read("src/App.tsx"),
  ]);

  assert.match(html, /<html lang="en">/);
  assert.match(app, /const DEFAULT_LANGUAGE = "en"/);
  assert.doesNotMatch(app, /navigator\.language|navigator\.languages/);
});

test("language selection is session-scoped and updates the document language", async () => {
  const app = await read("src/App.tsx");

  assert.match(app, /sessionStorage\.getItem\(LANGUAGE_SESSION_KEY\)/);
  assert.match(app, /sessionStorage\.setItem\(LANGUAGE_SESSION_KEY, language\)/);
  assert.match(app, /document\.documentElement\.lang = language === "en" \? "en" : "zh-CN"/);
});

test("the header and homepage content expose complete English and Chinese states", async () => {
  const [app, welcome, about, projects, menu] = await Promise.all([
    read("src/App.tsx"),
    read("src/components/StarRevealTransition.tsx"),
    read("src/components/AboutIntroSection.tsx"),
    read("src/components/ProjectGallerySection.tsx"),
    read("src/components/FlowingMenu/FlowingMenu.tsx"),
  ]);

  assert.match(app, /HOME/);
  assert.match(app, /PROJECTS/);
  assert.match(app, /CONTACT/);
  assert.match(app, /首页/);
  assert.match(app, /项目信息/);
  assert.match(app, /联系方式/);
  assert.match(app, /DESIGN \/ TECHNOLOGY \/ DATA-INFORMED INNOVATION/);
  assert.match(app, /EN/);
  assert.match(app, /中文/);
  assert.match(welcome, /language: Language/);
  assert.match(about, /language: Language/);
  assert.match(projects, /language: Language/);
  assert.match(menu, /language: Language/);
});

test("the bilingual mobile header does not force a 320px page width", async () => {
  const styles = await read("src/styles.css");
  assert.doesNotMatch(styles, /body\s*\{[^}]*min-width:\s*320px/s);
});
