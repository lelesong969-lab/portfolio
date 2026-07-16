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

test("FlowingMenu click expansion preserves modified links and delays routing", async () => {
  const menu = await read("src/components/FlowingMenu/FlowingMenu.tsx");
  assert.match(menu, /isModifiedClick/);
  assert.match(menu, /event\.preventDefault\(\)/);
  assert.match(menu, /flowing-menu__route-transition/);
  assert.match(menu, /height:\s*window\.innerHeight/);
  assert.match(menu, /navigateAt = mobile \? \.38 : \.68/);
  assert.match(menu, /flowing-menu--opening/);
});

test("mobile and reduced-motion project interactions remain direct and readable", async () => {
  const [menu, styles] = await Promise.all([
    read("src/components/FlowingMenu/FlowingMenu.tsx"),
    read("src/components/FlowingMenu/FlowingMenu.css"),
  ]);
  assert.match(menu, /\(hover: hover\) and \(pointer: fine\)/);
  assert.match(menu, /prefers-reduced-motion: reduce/);
  assert.match(styles, /@media \(max-width: 767px\)[\s\S]*flowing-menu__overlay[^}]*display:\s*none/);
  assert.match(styles, /flowing-menu__mobile-image[^}]*display:\s*block/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
});
