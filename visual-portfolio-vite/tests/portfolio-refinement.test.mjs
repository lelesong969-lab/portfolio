import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("homepage keeps one ordered accordion project index and removes the header CTA", async () => {
  const [app, section] = await Promise.all([
    read("src/App.tsx"),
    read("src/components/ProjectGallerySection.tsx"),
  ]);
  const hello = app.indexOf("<StarRevealTransition");
  const about = app.indexOf("<AboutIntroSection");
  const work = app.indexOf("<ProjectGallerySection");
  const contact = app.indexOf("<ClosingStarTransition");
  assert.ok(hello < about && about < work && work < contact);
  assert.doesNotMatch(app, /岗位沟通|header-cta/);
  assert.equal((section.match(/<AccordionGallery/g) ?? []).length, 1);
  assert.match(section, /import AccordionGallery from "\.\/AccordionGallery\.jsx"/);
  assert.match(section, /const galleryItems = projects\.map/);
  assert.match(section, /image: project\.coverImage/);
  assert.match(section, /link: project\.href/);
  assert.match(section, /itemId: project\.slug/);
  assert.doesNotMatch(section, /ProjectStackGallery|SELECTED WORK|五种判断路径/);
  assert.match(section, /"MY PROJECTS"/);
  assert.match(section, /"05 PROJECTS"/);
});

test("About keeps its manually timed, layered entrance", async () => {
  const [about, styles] = await Promise.all([
    read("src/components/AboutIntroSection.tsx"),
    read("src/styles.css"),
  ]);
  assert.match(about, /useLayoutEffect/);
  assert.match(about, /requestAnimationFrame\(render\)/);
  assert.match(about, /window\.innerHeight \* \.68/);
  assert.match(about, /displayProgress \/ \.58/);
  assert.match(about, /const about = range\(animationProgress, \.04, \.22\)/);
  assert.match(about, /scaleX: 1 \+ \.34 \* \(1 - about\)/);
  assert.doesNotMatch(about, /ScrollTrigger|useState|is-visible|setVisible/);
  assert.equal((about.match(/className="about-intro__block/g) ?? []).length, 4);
  assert.match(styles, /about-intro__canvas[^}]*min-height:\s*142vh/s);
  assert.match(styles, /about-intro__block--identity[^}]*left:\s*6%[^}]*top:\s*14%/s);
  assert.match(styles, /about-intro__block--research[^}]*left:\s*9%[^}]*top:\s*77%/s);
  assert.match(styles, /about-intro__block--statement[^}]*right:\s*7%[^}]*top:\s*20%/s);
  assert.match(styles, /about-intro__block--product[^}]*right:\s*11%[^}]*top:\s*68%/s);
  assert.match(styles, /about-intro__block[^}]*visibility:\s*visible/s);
});

test("AccordionGallery uses semantic routes, stable item ids, and the accepted visual configuration", async () => {
  const [gallery, section, styles] = await Promise.all([
    read("src/components/AccordionGallery.jsx"),
    read("src/components/ProjectGallerySection.tsx"),
    read("src/components/AccordionGallery.css"),
  ]);
  assert.match(gallery, /href=\{item\.link \|\| undefined\}/);
  assert.match(gallery, /data-gallery-item-id=\{item\.itemId\}/);
  assert.match(gallery, /aria-label=\{ariaLabel\}/);
  assert.match(gallery, /onMouseEnter=\{\(\) => handleEnter\(i\)\}/);
  assert.match(gallery, /onFocus=\{\(\) => setActive\(i\)\}/);
  assert.match(section, /defaultIndex=\{2\}/);
  assert.match(section, /accentColor="#8fc79d"/);
  assert.match(section, /overlayColor="#11110f"/);
  assert.match(section, /expandRatio=\{0\.52\}/);
  assert.match(section, /trigger="hover"/);
  assert.match(styles, /\.ag-panel:focus-visible/);
  assert.match(styles, /background:\s*#0a0713/);
});

test("exactly five real projects expose routes, three-chapter evidence data, and source notes", async () => {
  const data = await read("src/data/portfolio.ts");
  assert.equal((data.match(/^\s{4}slug:\s*"/gm) ?? []).length, 5);
  assert.equal((data.match(/^\s{4}href:\s*"\/projects\//gm) ?? []).length, 5);
  assert.equal((data.match(/^\s{4}titleZh:/gm) ?? []).length, 5);
  assert.equal((data.match(/^\s{4}marqueeText:/gm) ?? []).length, 5);
  assert.equal((data.match(/^\s{4}gallery:\s*\[/gm) ?? []).length, 5);
  assert.equal((data.match(/^\s{4}metrics:\s*\[/gm) ?? []).length, 5);
  assert.equal((data.match(/^\s{4}sourceNote:\s*\{/gm) ?? []).length, 5);
  assert.match(data, /slug:\s*"hotel-service-system"/);
  assert.match(data, /slug:\s*"manual-coffee-grinder"/);
  assert.match(data, /slug:\s*"biomaterial-experiment"/);
  assert.match(data, /slug:\s*"pure-voyage"/);
  assert.match(data, /slug:\s*"auri-hand"/);
  assert.doesNotMatch(data, /href:\s*"#"/);
});

test("detail pages render the unified three-chapter evidence system and next route", async () => {
  const [detail, styles] = await Promise.all([
    read("src/components/ProjectCaseStudy.tsx"),
    read("src/components/ProjectCaseStudy.css"),
  ]);
  assert.match(detail, /project-case-study__overview/);
  assert.match(detail, /project-case-study__gallery-chapter/);
  assert.match(detail, /project-case-study__outcome/);
  assert.match(detail, /project\.gallery\.map/);
  assert.match(detail, /project-case-study__source-note/);
  assert.match(detail, /href=\{nextProject\.href\}/);
  assert.match(detail, /gsap\.timeline/);
  assert.match(detail, /ScrollTrigger/);
  assert.match(detail, /project-case-study__chapter-word/);
  assert.match(styles, /grid-template-columns:\s*repeat\(12/);
  assert.match(styles, /grid-template-columns:\s*repeat\(8/);
  assert.match(styles, /@media \(max-width:\s*767px\)[\s\S]*project-case-study__gallery[^}]*grid-template-columns:\s*1fr/);
  assert.match(styles, /project-case-study__next[^}]*min-height:\s*clamp\(100px, 15vh, 180px\)/s);
  assert.match(styles, /project-case-study__chapter-word/);
});

test("closing uses the shared star, scroll-linked shrink, and separate final content", async () => {
  const [transition, closing, motion, styles] = await Promise.all([
    read("src/components/StarRevealTransition.tsx"),
    read("src/components/ClosingStarTransition.tsx"),
    read("src/components/starMaskMotion.ts"),
    read("src/styles.css"),
  ]);
  assert.equal((transition.match(/d=\{STAR_PATH\}/g) ?? []).length, 1);
  assert.doesNotMatch(closing, /<svg|<path|STAR_PATH/);
  assert.match(transition, /hostStar\(closingStage\)/);
  assert.match(transition, /closingDisplayProgress/);
  assert.match(transition, /cubicBezierEase\(range\(closingDisplayProgress, \.66, \.94\)\)/);
  assert.doesNotMatch(transition, /CLOSING_CONTENT_START|closingContent\.style/);
  assert.match(motion, /SPRING_STIFFNESS = 105/);
  assert.match(motion, /SPRING_DAMPING = 20/);
  assert.match(motion, /SPRING_MASS = 0\.9/);
  assert.match(styles, /star-closing[^}]*height:\s*220vh/s);
  assert.match(styles, /star-closing__sticky[^}]*position:\s*sticky/s);
  assert.match(styles, /final-content[^}]*min-height:\s*135vh/s);
  assert.doesNotMatch(closing, /star-portal__closing-content/);
});

test("full-width wave sits inside soft warm-to-black section boundaries", async () => {
  const [section, wave, styles] = await Promise.all([
    read("src/components/ProjectGallerySection.tsx"),
    read("src/components/BreathingWave.tsx"),
    read("src/styles.css"),
  ]);
  assert.match(section, /project-gallery-section__boundary/);
  assert.match(section, /project-gallery-section__exit-wave/);
  assert.equal((wave.match(/attributeName="d"/g) ?? []).length, 2);
  assert.match(styles, /breathing-wave svg[^}]*width:\s*calc\(100% \+ 4px\)/s);
  assert.match(styles, /project-gallery-section::before[^}]*linear-gradient/s);
  assert.match(styles, /project-gallery-section__boundary[^}]*linear-gradient/s);
});
