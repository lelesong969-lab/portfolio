import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("hero montage remains decorative rather than a second project index", async () => {
  const [app, gallery] = await Promise.all([
    read("src/App.tsx"),
    read("src/components/CircularGallery.tsx"),
  ]);
  assert.equal((app.match(/<ProjectGallerySection/g) ?? []).length, 1);
  assert.match(app, /<CircularGallery items=\{heroGalleryItems\}/);
  assert.doesNotMatch(gallery, /href=|onOpenProject|\/projects\//);
});

test("old homepage project implementations contain no active code", async () => {
  const [stack, evidence, editorial, stackStyles] = await Promise.all([
    read("src/components/ProjectStackGallery.tsx"),
    read("src/components/ProjectEvidenceTitle.tsx"),
    read("src/components/ProjectEditorialGrid.tsx"),
    read("src/components/ProjectStackGallery.css"),
  ]);
  assert.match(stack, /FlowingMenu\/FlowingMenu/);
  assert.equal(evidence.trim(), "export {};");
  assert.equal(editorial.trim(), "export {};");
  assert.doesNotMatch(stackStyles, /project-stack-gallery__/);
});

test("boundary membranes keep the accepted alternating line weights", async () => {
  const [wave, styles] = await Promise.all([
    read("src/components/BreathingWave.tsx"),
    read("src/styles.css"),
  ]);
  assert.equal((wave.match(/breathing-wave__membrane/g) ?? []).length, 2);
  assert.match(styles, /membrane--upper[^}]*stroke-width:\s*\.8/s);
  assert.match(styles, /membrane--lower[^}]*stroke-width:\s*2\.15/s);
});
