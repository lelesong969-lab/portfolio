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

test("the header, homepage content, and project gallery expose complete English and Chinese states", async () => {
  const [app, welcome, about, projectSection, gallery] = await Promise.all([
    read("src/App.tsx"),
    read("src/components/StarRevealTransition.tsx"),
    read("src/components/AboutIntroSection.tsx"),
    read("src/components/ProjectGallerySection.tsx"),
    read("src/components/AccordionGallery.jsx"),
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
  assert.match(projectSection, /language: Language/);
  assert.match(projectSection, /label: language === "en" \? project\.titleEn : project\.titleZh/);
  assert.match(projectSection, /alt: language === "en" \? project\.detailEn\.alt : project\.alt/);
  assert.match(projectSection, /ariaLabel=\{language === "en" \? "Portfolio project gallery" : "作品集项目画廊"\}/);
  assert.match(gallery, /ariaLabel = 'Image accordion gallery'/);
});

test("language changes use a full-screen cover, commit, and uncover cycle", async () => {
  const [app, transition, styles] = await Promise.all([
    read("src/App.tsx"),
    read("src/components/LanguagePixelTransition.tsx"),
    read("src/components/LanguagePixelTransition.css"),
  ]);

  assert.match(app, /const \[pendingLanguage, setPendingLanguage\] = useState<Language \| null>\(null\)/);
  assert.match(app, /pendingLanguageRef\.current = nextLanguage;[\s\S]*setPendingLanguage\(nextLanguage\)/);
  assert.match(app, /const commitLanguageChange[\s\S]*setLanguage\(nextLanguage\)/);
  assert.match(app, /targetLanguage=\{pendingLanguage\}/);
  assert.match(app, /onCovered=\{commitLanguageChange\}/);
  assert.match(app, /onFinish=\{finishLanguageChange\}/);
  assert.equal((app.match(/\{languageTransition\}/g) ?? []).length, 2);
  assert.match(transition, /setIsCovered\(true\)/);
  assert.match(transition, /onCoveredRef\.current\(cycle\.target\)/);
  assert.match(transition, /setIsCovered\(false\)/);
  assert.match(transition, /active=\{isCovered\}/);
  assert.match(transition, /curtain/);
  assert.match(styles, /\.language-pixel-transition[^}]*position:\s*fixed[^}]*inset:\s*0[^}]*z-index:\s*10000/s);
  assert.match(styles, /width:\s*100vw/);
  assert.match(styles, /height:\s*100dvh/);
  assert.match(styles, /#f1ede5[\s\S]*#11110f[\s\S]*#8fc79d/);
});

test("the language curtain mounts inactive before the first cover starts", async () => {
  const transition = await read("src/components/LanguagePixelTransition.tsx");
  const beginCycle = transition.match(/const beginCycle = useCallback\([\s\S]*?\n  \);/)?.[0] ?? "";

  assert.match(transition, /const \[coverRequestId, setCoverRequestId\] = useState\(0\)/);
  assert.match(beginCycle, /setIsCovered\(false\)[\s\S]*setIsMounted\(true\)[\s\S]*setCoverRequestId\(id\)/);
  assert.doesNotMatch(beginCycle, /requestAnimationFrame/);
  assert.match(transition, /useEffect\(\(\) => \{[\s\S]*if \(!isMounted[\s\S]*requestAnimationFrame[\s\S]*setIsCovered\(true\)/);
});

test("the bilingual mobile header does not force a 320px page width", async () => {
  const styles = await read("src/styles.css");
  assert.doesNotMatch(styles, /body\s*\{[^}]*min-width:\s*320px/s);
});
