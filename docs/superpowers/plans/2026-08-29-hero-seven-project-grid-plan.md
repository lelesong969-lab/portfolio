# Hero Seven-Project Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Display all seven homepage hero previews in a responsive staggered composition while preserving the current card motion and surrounding hero layout.

**Architecture:** Keep `GravityCard` and its three transform layers unchanged. Replace only the horizontal track geometry with a responsive grid, extend the composition table to seven entries, and calculate depth from the two-dimensional gallery center. Mirror every application and test change between `visual-portfolio-vite` and `portfolio-site`.

**Tech Stack:** React 19, TypeScript, CSS Grid, CSS custom properties, Node test runner, Vite, Vercel

---

### Task 1: Lock the seven-card responsive contract

**Files:**
- Modify: `visual-portfolio-vite/tests/gallery-contract.test.mjs`
- Modify: `portfolio-site/tests/gallery-contract.test.mjs`

- [ ] **Step 1: Add the failing layout contract test**

Add a test that reads `CircularGallery.tsx`, `CircularGallery.css`, and `styles.css`, then asserts:

```js
test("hero montage fits all seven previews in a responsive staggered grid", async () => {
  const [gallery, galleryStyles, pageStyles] = await Promise.all([
    read("src/components/CircularGallery.tsx"),
    read("src/components/CircularGallery.css"),
    read("src/styles.css"),
  ]);
  assert.equal((gallery.match(/\{ offset:/g) ?? []).length, 7);
  assert.match(galleryStyles, /grid-template-columns:\s*repeat\(8, minmax\(0, 1fr\)\)/);
  assert.match(galleryStyles, /\.floating-gallery__card-shell:nth-child\(7\)/);
  assert.match(galleryStyles, /@media \(max-width: 520px\)[\s\S]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.doesNotMatch(galleryStyles, /width:\s*max-content/);
  assert.match(pageStyles, /@media \(max-width: 520px\)[\s\S]*\.poster-hero__gallery[^}]*height:\s*clamp\(38rem, 155vw, 46rem\)/);
});
```

- [ ] **Step 2: Run the new contract and verify it fails**

Run in `visual-portfolio-vite`:

```powershell
node --test tests/gallery-contract.test.mjs
```

Expected: the new test fails because the track still uses `width: max-content` and only five composition entries.

### Task 2: Implement the desktop and tablet staggered composition

**Files:**
- Modify: `visual-portfolio-vite/src/components/CircularGallery.tsx`
- Modify: `visual-portfolio-vite/src/components/CircularGallery.css`
- Modify: `visual-portfolio-vite/src/styles.css`

- [ ] **Step 1: Define seven deliberate card compositions**

Replace the five-entry `CARD_COMPOSITION` table with seven entries. Keep the current timing, float, breath, and scroll ranges, while using restrained vertical offsets between `-28px` and `26px` so every card remains inside the two-row region.

- [ ] **Step 2: Calculate depth from both axes**

Update `updateDepth` to use the gallery center in both dimensions:

```ts
const centerX = bounds.left + bounds.width / 2;
const centerY = bounds.top + bounds.height / 2;
const cardCenterX = cardBounds.left + cardBounds.width / 2;
const cardCenterY = cardBounds.top + cardBounds.height / 2;
const xDistance = (cardCenterX - centerX) / Math.max(1, bounds.width * 0.72);
const yDistance = (cardCenterY - centerY) / Math.max(1, bounds.height * 0.82);
const distance = Math.min(1, Math.hypot(xDistance, yDistance));
```

- [ ] **Step 3: Replace the horizontal strip with an eight-column grid**

Set the track to `width: 100%`, `display: grid`, two rows, and eight equal columns. Place cards 1–4 across the first row and cards 5–7 centered across the second row. Keep the existing shell, float wrapper, and card transforms untouched.

- [ ] **Step 4: Add the tablet three-plus-four arrangement**

At `max-width: 980px`, place cards 1–3 in the upper row and cards 4–7 in the lower row while preserving the same eight-column grid and current motion timings.

### Task 3: Implement mobile adaptive layout

**Files:**
- Modify: `visual-portfolio-vite/src/components/CircularGallery.css`
- Modify: `visual-portfolio-vite/src/styles.css`

- [ ] **Step 1: Add the two-column mobile grid**

At `max-width: 520px`, switch to two columns and automatic rows, reset desktop grid positions, and center card seven across both columns at one-column width. Reduce inline padding and card offsets, but keep the card float and interaction layers active.

- [ ] **Step 2: Let the hero gallery grow vertically**

Change the mobile `.poster-hero__gallery` height to:

```css
height: clamp(38rem, 155vw, 46rem);
```

This provides enough space for `2–2–2–1` without horizontal overflow.

- [ ] **Step 3: Run the focused test**

Run:

```powershell
node --test tests/gallery-contract.test.mjs
```

Expected: all gallery contract tests pass.

### Task 4: Mirror the approved implementation into the deployment copy

**Files:**
- Modify: `portfolio-site/src/components/CircularGallery.tsx`
- Modify: `portfolio-site/src/components/CircularGallery.css`
- Modify: `portfolio-site/src/styles.css`
- Modify: `portfolio-site/tests/gallery-contract.test.mjs`

- [ ] **Step 1: Apply the identical source changes**

Ensure the four mirrored files are byte-equivalent to their `visual-portfolio-vite` counterparts.

- [ ] **Step 2: Run the full production validation**

Run in `portfolio-site`:

```powershell
node --test tests/*.test.mjs
pnpm run build
```

Expected: 28 tests pass and Vite produces the production bundle.

### Task 5: Preview, commit, and deploy

**Files:**
- No additional source files.

- [ ] **Step 1: Preview the production build locally**

Open the Vite preview and verify desktop, tablet, and mobile widths. Confirm all seven cards are present, the page has no horizontal overflow, and hover/float/tilt behavior remains active.

- [ ] **Step 2: Commit only the gallery implementation and test changes**

```powershell
git add -- visual-portfolio-vite/src/components/CircularGallery.tsx visual-portfolio-vite/src/components/CircularGallery.css visual-portfolio-vite/src/styles.css visual-portfolio-vite/tests/gallery-contract.test.mjs portfolio-site/src/components/CircularGallery.tsx portfolio-site/src/components/CircularGallery.css portfolio-site/src/styles.css portfolio-site/tests/gallery-contract.test.mjs
git commit -m "feat: arrange all hero previews in a responsive grid"
```

- [ ] **Step 3: Push and deploy**

```powershell
git push origin HEAD:main
```

Then deploy `portfolio-site` to Vercel production and verify `https://www.lelesong-portfolio.me/` returns the new seven-card composition.
