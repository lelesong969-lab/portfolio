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

test("the header, homepage content, and project gallery expose complete English and bilingual states", async () => {
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
  assert.match(app, /hoverLabel="ENGLISH"/);
  assert.match(app, /hoverLabel="中英双语"/);
  assert.match(app, /language-switch__hover-circle/);
  assert.match(welcome, /language: Language/);
  assert.match(about, /language: Language/);
  assert.match(projectSection, /language: Language/);
  assert.match(projectSection, /label: language === "en" \? project\.titleEn : `\$\{project\.titleZh\} \/ \$\{project\.titleEn\}`/);
  assert.match(projectSection, /alt: language === "en" \? project\.detailEn\.alt : project\.alt/);
  assert.match(projectSection, /ariaLabel=\{language === "en" \? "Portfolio project gallery" : "作品集项目画廊"\}/);
  assert.match(gallery, /ariaLabel = 'Image accordion gallery'/);
});

test("the Chinese option restores the original bilingual editorial composition", async () => {
  const [app, positioning, welcome, about, projectSection, detail] = await Promise.all([
    read("src/App.tsx"),
    read("src/components/PositioningMark.tsx"),
    read("src/components/StarRevealTransition.tsx"),
    read("src/components/AboutIntroSection.tsx"),
    read("src/components/ProjectGallerySection.tsx"),
    read("src/components/ProjectCaseStudy.tsx"),
  ]);

  assert.match(positioning, /positioning-mark__cn/);
  assert.match(positioning, /positioning-mark__en/);
  assert.match(welcome, /const welcomeWord = "WELCOME"/);
  assert.match(welcome, /hero-welcome__eyebrow">A SMALL INTRODUCTION/);
  assert.match(welcome, /text="HELLO"/);
  assert.match(about, /eyebrow: "A \/ ABOUT ME",[\s\S]*summary: "工业设计背景/);
  assert.match(about, /researchEyebrow: "RESEARCH \/ SYNTHESIS",[\s\S]*researchCopy: "我从用户/);
  assert.match(projectSection, /label: language === "en" \? project\.titleEn : `\$\{project\.titleZh\} \/ \$\{project\.titleEn\}`/);
  assert.match(projectSection, /<h2 id="projects-title">MY PROJECTS<\/h2>/);
  assert.match(detail, />← BACK TO MY PROJECTS<\/a>/);
  assert.doesNotMatch(detail, /"职责"|"时间"|"重点"/);
  assert.match(app, /language === "en" \? "C \/ START A CONVERSATION" : "C \/ Start a conversation"/);
});

test("project details expose a bilingual seven-project editorial navigator", async () => {
  const [detail, navigator, navigatorStyles] = await Promise.all([
    read("src/components/ProjectCaseStudy.tsx"),
    read("src/components/ProjectCaseNavigator.tsx"),
    read("src/components/ProjectCaseNavigator.css"),
  ]);

  assert.match(detail, /<ProjectCaseNavigator/);
  assert.match(navigator, /language === "en" \? "NEXT PROJECT" : "下一个项目"/);
  assert.match(navigator, /language === "en" \? "VIEW NEXT PROJECT" : "查看下一个项目"/);
  assert.match(navigator, /language === "en" \? "BROWSE ALL PROJECTS" : "浏览全部项目"/);
  assert.match(navigator, /language === "en" \? "NEXT" : "下一个"/);
  assert.match(navigator, /const total = String\(projects\.length\)\.padStart\(2, "0"\)/);
  assert.match(navigatorStyles, /\.project-case-navigator__giant-number\s*\{[^}]*font:\s*400 clamp\(8rem, 16vw, 16rem\)\/1/s);
});

test("language changes reuse the homepage entrance animation", async () => {
  const [app, transition, opening] = await Promise.all([
    read("src/App.tsx"),
    read("src/components/LanguageEntranceTransition.tsx"),
    read("src/components/OpeningAnimation.tsx"),
  ]);

  assert.match(app, /const \[pendingLanguage, setPendingLanguage\] = useState<Language \| null>\(null\)/);
  assert.match(app, /pendingLanguageRef\.current = nextLanguage;[\s\S]*setPendingLanguage\(nextLanguage\)/);
  assert.match(app, /const commitLanguageChange[\s\S]*setLanguage\(nextLanguage\)/);
  assert.match(app, /targetLanguage=\{pendingLanguage\}/);
  assert.match(app, /onCovered=\{commitLanguageChange\}/);
  assert.match(app, /onFinish=\{finishLanguageChange\}/);
  assert.equal((app.match(/\{languageTransition\}/g) ?? []).length, 2);
  assert.match(app, /import LanguageEntranceTransition from "\.\/components\/LanguageEntranceTransition"/);
  assert.match(transition, /import \{ LanguageEntranceTransition as EntranceOverlay \} from "\.\/OpeningAnimation"/);
  assert.match(transition, /return <EntranceOverlay onCovered=\{handleCovered\} onFinish=\{handleFinish\} \/>;/);
  assert.match(opening, /export function LanguageEntranceTransition/);
  assert.match(opening, /className="opening-animation opening-animation--language"/);
  assert.match(opening, /data-opening-band/);
  assert.match(opening, /data-opening-title-slice/);
  assert.match(opening, /ENTRANCE_TIMING\.stageExitStart/);
  assert.match(transition, /root\.setAttribute\("inert", ""\)/);
  assert.doesNotMatch(transition, /PixelSwap|curtain/);
});

test("the entrance overlay commits the target language before it reveals the page", async () => {
  const opening = await read("src/components/OpeningAnimation.tsx");

  const languageOverlay = opening.match(/export function LanguageEntranceTransition[\s\S]*?\r?\n}\r?\n\r?\nexport default function OpeningAnimation/)?.[0] ?? "";

  assert.match(languageOverlay, /useLayoutEffect/);
  assert.match(languageOverlay, /window\.requestAnimationFrame\(\(\) => \{[\s\S]*callbacksRef\.current\.onCovered\(\);[\s\S]*timeline\.play\(0\)/);
  assert.match(languageOverlay, /onComplete: finish/);
});

test("the bilingual mobile header does not force a 320px page width", async () => {
  const styles = await read("src/styles.css");
  assert.doesNotMatch(styles, /body\s*\{[^}]*min-width:\s*320px/s);
});

test("bilingual mobile accordion labels wrap instead of truncating their English titles", async () => {
  const styles = await read("src/components/AccordionGallery.css");
  const mobileStyles = styles.match(/@media \(max-width: 520px\) \{[\s\S]*?\n\}/)?.[0] ?? "";

  assert.match(mobileStyles, /\.ag-panel__text\s*\{[^}]*white-space:\s*normal[^}]*text-overflow:\s*clip/s);
});

test("language changes restore the current hash anchor after bilingual copy reflows", async () => {
  const app = await read("src/App.tsx");

  assert.match(app, /const languageHashRef = useRef<\{ hash: string; top: number \} \| null>\(null\)/);
  assert.match(app, /const currentHash = window\.location\.hash;[\s\S]*const currentAnchor = currentHash \? document\.getElementById\(currentHash\.slice\(1\)\) : null;[\s\S]*languageHashRef\.current = currentAnchor \? \{ hash: currentHash, top: currentAnchor\.getBoundingClientRect\(\)\.top \} : null;/);
  assert.match(app, /useLayoutEffect\(\(\) => \{[\s\S]*const \{ hash, top \} = languageHashRef\.current;[\s\S]*document\.getElementById\(hash\.slice\(1\)\)[\s\S]*window\.scrollTo\(\{ top: anchor\.offsetTop - top, behavior: "instant" as ScrollBehavior \}\)/);
});
