# Language Pixel Transition and Accordion Project Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the text-only five-project list with an image accordion and add a full-viewport cream/black/light-green pixel curtain for every English/Chinese language change.

**Architecture:** Keep `App` as the sole owner of language, route, and project state. `AccordionGallery` receives a direct projection of the existing five projects, while `LanguagePixelTransition` drives a controlled PixelSwap curtain and commits the new language only when the viewport is fully covered. No page tree, video, canvas, project content, or project data is duplicated.

**Tech Stack:** React 19, TypeScript 6, JavaScript/CSS React Bits components, GSAP 3, Vite 8, Web Animations API.

---

## File Map

- Create `src/components/AccordionGallery.jsx`: supplied React Bits accordion behaviour.
- Create `src/components/AccordionGallery.css`: supplied accordion styles plus no portfolio-specific selectors.
- Create `src/components/AccordionGallery.d.ts`: TypeScript contract for the JavaScript component.
- Modify `src/components/ProjectGallerySection.tsx`: map five existing projects into gallery items and preserve SPA opening behaviour.
- Create `src/components/PixelSwap.jsx`: supplied PixelSwap implementation with one optional curtain-reverse branch.
- Create `src/components/PixelSwap.css`: supplied PixelSwap base styles.
- Create `src/components/PixelSwap.d.ts`: TypeScript contract, including `curtain`.
- Create `src/components/LanguagePixelTransition.tsx`: portfolio-specific two-stage language controller.
- Create `src/components/LanguagePixelTransition.css`: fixed overlay, theme plate, and reduced-motion presentation.
- Modify `src/App.tsx`: replace direct language writes with transition requests on both homepage and project routes.
- Do not modify `src/data/portfolio.ts`, any project detail component, or either supplied cover-image path.

### Task 1: Add the Supplied AccordionGallery Component

**Files:**
- Create: `src/components/AccordionGallery.jsx`
- Create: `src/components/AccordionGallery.css`
- Create: `src/components/AccordionGallery.d.ts`
- Source reference: `C:\Users\32425\.codex\attachments\7dc5914a-b7b8-4fb9-bf56-b6634e1e4fe3\pasted-text.txt` is PixelSwap only; use the complete AccordionGallery JSX and CSS blocks supplied in the browser comment on 2026-08-28.

- [ ] **Step 1: Confirm the existing dependency instead of installing it again**

Run:

```powershell
pnpm list gsap --depth 0
```

Expected: `gsap 3.15.0` is present and `package.json` remains unchanged.

- [ ] **Step 2: Add the supplied JavaScript and CSS source verbatim**

Use `apply_patch` to create `AccordionGallery.jsx` and `AccordionGallery.css`. Keep the supplied defaults, ResizeObserver measurement, GSAP timeline, keyboard arrows, hover/click triggers, reduced-motion check, and mobile media query unchanged.

- [ ] **Step 3: Add the TypeScript declaration**

```ts
import type { CSSProperties, ReactNode } from "react";

export type AccordionGalleryItem = {
  image: string;
  label?: string;
  link?: string;
  alt?: string;
};

export interface AccordionGalleryProps {
  items?: AccordionGalleryItem[];
  defaultIndex?: number;
  accentColor?: string;
  overlayColor?: string;
  textColor?: string;
  height?: number;
  gap?: number;
  radius?: number;
  expandRatio?: number;
  orientation?: "horizontal" | "vertical";
  duration?: number;
  ease?: string;
  parallax?: number;
  tilt?: number;
  stagger?: number;
  trigger?: "hover" | "click";
  showLabels?: boolean;
  grayscale?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export default function AccordionGallery(props: AccordionGalleryProps): ReactNode;
```

- [ ] **Step 4: Run the type check before integration**

Run: `pnpm typecheck`  
Expected: PASS; unused standalone JavaScript files do not introduce TypeScript errors.

- [ ] **Step 5: Commit the component boundary**

```powershell
git add -- visual-portfolio-vite/src/components/AccordionGallery.jsx visual-portfolio-vite/src/components/AccordionGallery.css visual-portfolio-vite/src/components/AccordionGallery.d.ts
git commit -m "feat: add accordion project gallery component"
```

### Task 2: Replace the Text Project List with the Five-Image Accordion

**Files:**
- Modify: `src/components/ProjectGallerySection.tsx`

- [ ] **Step 1: Replace the FlowingMenu import and update entrance selectors**

Use:

```tsx
import AccordionGallery from "./AccordionGallery.jsx";
```

Replace the old selector variables with:

```tsx
const items = section.querySelectorAll<HTMLElement>(".ag-panel");
const images = section.querySelectorAll<HTMLElement>(".ag-panel__media img");
```

This preserves the existing ScrollTrigger entrance sequence while targeting the new panels.

- [ ] **Step 2: Add deterministic project lookup and active-panel navigation**

Inside `ProjectGallerySection`, derive items before the return:

```tsx
const galleryItems = projects.map((project) => ({
  image: project.coverImage,
  label: language === "en" ? project.titleEn : project.titleZh,
  alt: language === "en" ? project.detailEn.alt : project.alt,
  link: project.href,
}));

const handleGalleryClickCapture = (event: MouseEvent<HTMLDivElement>) => {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const panel = (event.target as HTMLElement).closest<HTMLAnchorElement>("a.ag-panel");
  if (!panel?.classList.contains("ag-panel--active")) return;
  const project = projects.find((candidate) => candidate.href === panel.getAttribute("href"));
  if (!project) return;
  event.preventDefault();
  onOpenProject(project);
};
```

Add `type MouseEvent` to the React import and use the signature above; do not introduce the `React` namespace form.

- [ ] **Step 3: Replace only the FlowingMenu JSX**

```tsx
<div className="project-gallery-section__accordion" onClickCapture={handleGalleryClickCapture}>
  <AccordionGallery
    items={galleryItems}
    defaultIndex={2}
    accentColor="#8fc79d"
    overlayColor="#11110f"
    textColor="#f1ede5"
    height={520}
    gap={10}
    radius={18}
    expandRatio={0.52}
    duration={0.6}
    ease="power3.out"
    parallax={0.5}
    tilt={6}
    stagger={0.06}
    trigger="hover"
    grayscale
    showLabels
  />
</div>
```

Keep the section title, project count, entry/exit waves, section ID, and `onOpenProject` prop unchanged.

- [ ] **Step 4: Add only section-level spacing to the existing global stylesheet**

Add near the existing `.project-gallery-section` rules in `src/styles.css`:

```css
.project-gallery-section__accordion {
  padding: clamp(1.5rem, 3vw, 3rem) 0 clamp(3rem, 7vw, 7rem);
}

@media (max-width: 520px) {
  .project-gallery-section__accordion {
    padding-bottom: 4rem;
  }
}
```

- [ ] **Step 5: Verify types and the five source-image mappings**

Run:

```powershell
pnpm typecheck
rg -n "coverImage:" src/data/portfolio.ts
```

Expected: type check passes and exactly five project-level `coverImage` fields remain in the same data order.

- [ ] **Step 6: Commit gallery integration**

```powershell
git add -- visual-portfolio-vite/src/components/ProjectGallerySection.tsx visual-portfolio-vite/src/styles.css
git commit -m "feat: preview five projects in accordion gallery"
```

### Task 3: Add PixelSwap with Curtain-Reverse Support

**Files:**
- Create: `src/components/PixelSwap.jsx`
- Create: `src/components/PixelSwap.css`
- Create: `src/components/PixelSwap.d.ts`
- Canonical source: `C:\Users\32425\.codex\attachments\7dc5914a-b7b8-4fb9-bf56-b6634e1e4fe3\pasted-text.txt`

- [ ] **Step 1: Copy the supplied PixelSwap JSX and CSS exactly**

Use `apply_patch` and retain `MAX_PIXELS = 220`, `KEYFRAME_STEPS = 14`, all pattern functions, ResizeObserver behaviour, Web Animations cleanup, controlled `active`, `onActiveChange`, `onComplete`, and reduced-motion handling.

- [ ] **Step 2: Add one optional `curtain` prop without changing default behaviour**

Add to the function parameters:

```jsx
curtain = false,
```

When `curtain && transition && !transition.to`, clone layer 1 (the opaque theme plate), hide its full-size base layer during that reverse transition, and run both generated animation lists with `direction: 'reverse'`. The default `curtain = false` path must remain byte-for-byte equivalent in behaviour to the supplied component.

Use these named values in the animation effect:

```jsx
const reverseCurtain = curtain && !to;
const sourceIndex = reverseCurtain ? 1 : to ? 1 : 0;
const source = layerRefs.current[sourceIndex];
const timing = {
  duration: pixelMs,
  delay: (reverseCurtain ? 1 - pixel.offset : pixel.offset) * spread,
  easing: 'linear',
  fill: 'both',
  direction: reverseCurtain ? 'reverse' : 'normal'
};
```

In `renderLayer`, suppress only the opaque source base during reverse:

```jsx
const hiddenForCurtainReveal = curtain && transition && !transition.to && index === 1;
data-visible={isShown && !hiddenForCurtainReveal && !(transition && index === incomingIndex)}
```

- [ ] **Step 3: Add the declaration used by TypeScript**

```ts
import type { CSSProperties, ReactNode } from "react";

export interface PixelSwapProps {
  firstContent: ReactNode;
  secondContent: ReactNode;
  pixelSize?: number;
  gap?: number;
  pixelRadius?: number;
  pixelSpin?: number;
  pixelScale?: number;
  fade?: boolean;
  duration?: number;
  pixelDuration?: number;
  pattern?: "random" | "center" | "edges" | "left-to-right" | "right-to-left" | "top-to-bottom" | "bottom-to-top" | "diagonal" | "spiral";
  randomness?: number;
  easing?: string;
  trigger?: "hover" | "click" | "manual";
  initialActive?: boolean;
  active?: boolean;
  curtain?: boolean;
  onActiveChange?: (active: boolean) => void;
  onComplete?: (active: boolean) => void;
  aspectRatio?: string;
  className?: string;
  style?: CSSProperties;
}

export default function PixelSwap(props: PixelSwapProps): ReactNode;
```

- [ ] **Step 4: Run the type check**

Run: `pnpm typecheck`  
Expected: PASS.

- [ ] **Step 5: Commit the low-level transition component**

```powershell
git add -- visual-portfolio-vite/src/components/PixelSwap.jsx visual-portfolio-vite/src/components/PixelSwap.css visual-portfolio-vite/src/components/PixelSwap.d.ts
git commit -m "feat: add pixel curtain transition component"
```

### Task 4: Build the Portfolio-Specific Language Curtain

**Files:**
- Create: `src/components/LanguagePixelTransition.tsx`
- Create: `src/components/LanguagePixelTransition.css`

- [ ] **Step 1: Create the controlled transition wrapper**

```tsx
import { useEffect, useState } from "react";
import type { Language } from "../language";
import PixelSwap from "./PixelSwap.jsx";
import "./LanguagePixelTransition.css";

type LanguagePixelTransitionProps = {
  targetLanguage: Language | null;
  onCommit: (language: Language) => void;
  onFinish: () => void;
};

export default function LanguagePixelTransition({
  targetLanguage,
  onCommit,
  onFinish,
}: LanguagePixelTransitionProps) {
  const [covered, setCovered] = useState(false);

  useEffect(() => {
    if (targetLanguage) setCovered(true);
  }, [targetLanguage]);

  if (!targetLanguage) return null;

  return (
    <div className="language-pixel-transition" aria-hidden="true">
      <PixelSwap
        firstContent={<div className="language-pixel-transition__clear" />}
        secondContent={<div className="language-pixel-transition__plate" />}
        pixelSize={56}
        gap={0}
        pixelRadius={3}
        pixelSpin={0}
        pixelScale={0.28}
        duration={650}
        pixelDuration={280}
        pattern="diagonal"
        randomness={0.16}
        fade
        trigger="manual"
        active={covered}
        curtain
        aspectRatio="auto"
        onComplete={(active) => {
          if (active) {
            onCommit(targetLanguage);
            window.requestAnimationFrame(() => setCovered(false));
          } else {
            onFinish();
          }
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Add the fixed viewport and theme-plate CSS**

```css
.language-pixel-transition {
  position: fixed;
  z-index: 10000;
  inset: 0;
  width: 100vw;
  height: 100dvh;
  pointer-events: all;
  overflow: hidden;
}

.language-pixel-transition .pixel-swap {
  width: 100%;
  height: 100%;
}

.language-pixel-transition__clear,
.language-pixel-transition__plate {
  width: 100%;
  height: 100%;
}

.language-pixel-transition__clear {
  background: transparent;
}

.language-pixel-transition__plate {
  background:
    linear-gradient(135deg, transparent 0 48%, rgba(255, 255, 255, .12) 49% 51%, transparent 52%),
    conic-gradient(from 45deg at 50% 50%, #f1ede5 0 25%, #11110f 0 58%, #8fc79d 0 78%, #11110f 0 100%);
}

@media (prefers-reduced-motion: reduce) {
  .language-pixel-transition {
    background: #8fc79d;
    animation: language-transition-fade .18s ease both;
  }
}

@keyframes language-transition-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

- [ ] **Step 3: Type-check the wrapper**

Run: `pnpm typecheck`  
Expected: PASS and no unused props or imports.

- [ ] **Step 4: Commit the portfolio-specific wrapper**

```powershell
git add -- visual-portfolio-vite/src/components/LanguagePixelTransition.tsx visual-portfolio-vite/src/components/LanguagePixelTransition.css
git commit -m "feat: add full-viewport language pixel curtain"
```

### Task 5: Route Every Language Change Through the Curtain

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add the import and pending-language state**

```tsx
import LanguagePixelTransition from "./components/LanguagePixelTransition";
```

Inside `App`:

```tsx
const [pendingLanguage, setPendingLanguage] = useState<Language | null>(null);
```

- [ ] **Step 2: Add guarded request, commit, and finish callbacks**

```tsx
const requestLanguageChange = useCallback((nextLanguage: Language) => {
  if (nextLanguage === language || pendingLanguage) return;
  setPendingLanguage(nextLanguage);
}, [language, pendingLanguage]);

const commitLanguageChange = useCallback((nextLanguage: Language) => {
  setLanguage(nextLanguage);
}, []);

const finishLanguageChange = useCallback(() => {
  setPendingLanguage(null);
}, []);
```

- [ ] **Step 3: Expose busy state without changing layout wrappers**

```tsx
useEffect(() => {
  if (pendingLanguage) document.body.setAttribute("aria-busy", "true");
  else document.body.removeAttribute("aria-busy");
  return () => document.body.removeAttribute("aria-busy");
}, [pendingLanguage]);
```

- [ ] **Step 4: Replace both direct `setLanguage` header callbacks**

Pass `requestLanguageChange` to the homepage `PosterHero` and project-route `SiteHeader`. Do not change `LanguageSwitch`, session storage, `<html lang>`, document title, meta description, project state, or route code.

- [ ] **Step 5: Render the transition in both existing return branches**

Add this as the first sibling in the homepage and selected-project fragments:

```tsx
<LanguagePixelTransition
  targetLanguage={pendingLanguage}
  onCommit={commitLanguageChange}
  onFinish={finishLanguageChange}
/>
```

- [ ] **Step 6: Run type and build verification**

Run:

```powershell
pnpm typecheck
pnpm build
```

Expected: both commands pass. The existing Vite large-chunk advisory is non-blocking.

- [ ] **Step 7: Commit application integration**

```powershell
git add -- visual-portfolio-vite/src/App.tsx
git commit -m "feat: animate bilingual page transitions"
```

### Task 6: Focused Browser Verification and Preview Handoff

**Files:**
- No source changes unless a verified defect requires a scoped correction.

- [ ] **Step 1: Reuse the existing preview server**

Inspect port 5173 first. Open `http://127.0.0.1:5173/#top`; do not start a second server while the existing Vite process is healthy.

- [ ] **Step 2: Verify the project gallery at desktop width**

Confirm in the visible preview:

```text
5 .ag-panel elements
project 03 has .ag-panel--active initially
all five img src values match projects[0..4].coverImage
hover/focus changes the active panel
activating the expanded panel opens its existing /projects/<slug> route
```

- [ ] **Step 3: Verify both transition directions**

At `#top`, record `scrollY`, activate 中文, wait for transition completion, and confirm:

```text
html.lang === "zh-CN"
scrollY unchanged
language overlay removed
body no longer has aria-busy
```

Repeat for EN and confirm `html.lang === "en"`. Repeat one direction on an existing project-detail route and confirm the pathname is unchanged.

- [ ] **Step 4: Verify one mobile width and reduced motion**

At approximately 390 × 844, confirm the gallery becomes a vertical stack with no horizontal overflow. Emulate reduced motion, switch language once, and confirm the interface completes without a persistent overlay.

- [ ] **Step 5: Check browser errors and leave the preview open**

Expected: no error-level browser logs, preview remains at `http://127.0.0.1:5173/#top`, and no deployment action is taken.

- [ ] **Step 6: Commit only if browser verification required a correction**

If no code changed, do not create an empty commit. If a scoped fix was required, commit only its exact files with a message describing the verified defect.
