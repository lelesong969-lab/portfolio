import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("HELLO keeps its integrated pressure interaction", async () => {
  const [pressure, transition] = await Promise.all([
    read("src/components/TextPressure.tsx"),
    read("src/components/StarRevealTransition.tsx"),
  ]);
  assert.match(pressure, /fontVariationSettings/);
  assert.match(transition, /<TextPressure/);
});

test("AccordionGallery expands inactive panels and only routes an already-active unmodified click", async () => {
  const [gallery, section, app] = await Promise.all([
    read("src/components/AccordionGallery.jsx"),
    read("src/components/ProjectGallerySection.tsx"),
    read("src/App.tsx"),
  ]);
  assert.match(gallery, /if \(i !== active\) \{[\s\S]*e\.preventDefault\(\);[\s\S]*setActive\(i\)/);
  assert.match(section, /const isModifiedClick = event\.button !== 0 \|\| event\.metaKey \|\| event\.ctrlKey \|\| event\.shiftKey \|\| event\.altKey/);
  assert.match(section, /if \(isModifiedClick\) \{[\s\S]*event\.stopPropagation\(\);[\s\S]*return;/);
  assert.doesNotMatch(section, /if \(isModifiedClick\)[\s\S]{0,160}event\.preventDefault\(\)/);
  assert.match(section, /event\.preventDefault\(\);[\s\S]*if \(wasActive\) onOpenProject\(projects\[index\]\)/);
  assert.match(app, /querySelectorAll<HTMLElement>\("#work \.ag-panel"\)/);
  assert.match(app, /panel\.dataset\.galleryItemId === slug/);
  assert.match(app, /\.focus\(\{ preventScroll: true \}\)/);
});

test("project close restores gallery focus only after the homepage remounts", async () => {
  const app = await read("src/App.tsx");
  const closeProject = app.match(/const closeProject = useCallback\([\s\S]*?\n  \}, \[[^\]]*\]\);/)?.[0] ?? "";

  assert.match(app, /useEffect\(\(\) => \{\s*if \(selectedProject \|\| !lastProjectSlug\.current\) return;\s*restoreGalleryPosition\(\);\s*\}, \[selectedProject, restoreGalleryPosition\]\);/);
  assert.doesNotMatch(closeProject, /restoreGalleryPosition\(\)/);
});

test("stale gallery restoration frames cannot clear a newer project target", async () => {
  const app = await read("src/App.tsx");
  const openProject = app.match(/const openProject: OpenProject = useCallback\([\s\S]*?\n  \}, \[[^\]]*\]\);/)?.[0] ?? "";
  const popState = app.match(/const handlePopState = \(\) => \{[\s\S]*?\n    \};/)?.[0] ?? "";

  assert.match(app, /const cancelGalleryRestore = useCallback\([\s\S]*cancelAnimationFrame[\s\S]*\}, \[\]\)/);
  assert.match(app, /const slug = lastProjectSlug\.current;[\s\S]*if \(lastProjectSlug\.current === slug\) lastProjectSlug\.current = null/);
  assert.match(openProject, /cancelGalleryRestore\(\);[\s\S]*lastProjectSlug\.current = project\.slug/);
  assert.match(popState, /if \(nextProject\) \{[\s\S]*cancelGalleryRestore\(\);[\s\S]*lastProjectSlug\.current = nextProject\.slug/);
});

test("mobile and reduced-motion project interactions remain direct and readable", async () => {
  const [gallery, styles] = await Promise.all([
    read("src/components/AccordionGallery.jsx"),
    read("src/components/AccordionGallery.css"),
  ]);
  assert.match(gallery, /matchMedia\('\(prefers-reduced-motion: reduce\)'\)/);
  assert.match(gallery, /const dur = animate && !prefersReduced \? duration : 0/);
  assert.match(styles, /@media \(max-width: 520px\)[\s\S]*\.accordion-gallery[^}]*flex-direction:\s*column/);
  assert.match(styles, /height:\s*clamp\(500px, 74vh, 620px\) !important/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
});
