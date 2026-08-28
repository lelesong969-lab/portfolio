# Language Pixel Transition and Accordion Project Gallery

Status: Draft for user review  
Date: 2026-08-28

## 1. Goal

Implement two related browser-visible changes without altering the five projects' evidence or case-study copy:

1. Replace the current text-only project list with an `AccordionGallery` preview using the five existing project cover images in their current order.
2. Apply a full-viewport pixel-curtain transition whenever the user changes between English and Chinese, using the site's cream, black, and light-green palette.

The local preview remains the delivery surface. Deployment is out of scope until the user approves the preview.

## 2. Existing State to Preserve

- English remains the first-visit default.
- The chosen language remains stored for the current browser session.
- The language switch stays fixed in the header on both the homepage and project-detail pages.
- Project routes, back navigation, scroll restoration, and the existing project-detail content remain unchanged.
- The five current cover images remain mapped one-to-one to the five projects; no image order or project order changes.
- The existing cream, black, and light-green visual system remains the only transition palette.

## 3. Chosen Language-Transition Design

### 3.1 Interaction

The transition is a deterministic two-stage pixel curtain covering the current viewport:

1. The user clicks the inactive language option.
2. A fixed overlay creates a grid of pixels that grow until the viewport is fully covered.
3. At full coverage, the application commits the new language.
4. The same pixels retract in reverse order, revealing the translated page at the same route and scroll position.
5. The overlay unmounts and the language controls become available again.

Clicking the already-active language does nothing. Additional language clicks are ignored while a transition is running.

### 3.2 Component Boundary

- Add the supplied React Bits `PixelSwap` JavaScript/CSS source as the animation reference and reusable low-level component.
- Add a small typed `LanguagePixelTransition` controller for the portfolio-specific two-stage curtain.
- The controller owns only transition phase, pending language, overlay visibility, and completion callbacks.
- `App` continues to own the authoritative `language` state and existing session-storage/meta-language effects.
- The page is not rendered twice. This avoids duplicated videos, canvases, scroll handlers, project state, and opening animations.

### 3.3 Motion and Colour

- Full viewport: `position: fixed; inset: 0; z-index` above the page and fixed header.
- Pixel sequence: diagonal with restrained deterministic variation, based on the supplied PixelSwap timing model.
- Total target duration: approximately 1.1–1.4 seconds, including cover and reveal.
- Pixel palette cycles through existing CSS theme variables for cream, black, and light green.
- Pixel corners remain nearly square to match the editorial/industrial visual language.
- With `prefers-reduced-motion: reduce`, the language changes immediately with a brief colour fade and no pixel cascade.

### 3.4 Accessibility and Failure Handling

- The page exposes `aria-busy="true"` while the curtain is active.
- The overlay is decorative and hidden from assistive technology.
- Keyboard activation of the language buttons uses the same transition path as pointer activation.
- If animation APIs are unavailable, the controller immediately commits the requested language and removes the overlay.
- Scroll position, selected project, and browser history are never rewritten by the language transition.

## 4. Chosen Project-Gallery Design

### 4.1 Data Mapping

`ProjectGallerySection` maps the existing `projects` array directly into five `AccordionGallery` items:

- `image`: existing `project.coverImage`
- `label`: `project.titleEn` or `project.titleZh`, based on current language
- `alt`: the same language-specific project title
- `link`: existing `project.href`

No new project facts, claims, results, or detail-page copy are introduced.

### 4.2 Interaction

- Desktop: horizontal accordion, hover/focus expands a panel, project 03 is expanded initially.
- Touch/mobile: vertical stack, tap/focus expands a panel.
- First activation of a collapsed panel expands it.
- Activating the expanded panel opens the existing project detail through the current `onOpenProject` flow, preserving SPA navigation and return-position behaviour.
- Arrow-key navigation and visible focus treatment from the supplied component are preserved.

### 4.3 Visual Adaptation

- Use the supplied `AccordionGallery` JavaScript/CSS source and the already-installed `gsap` dependency.
- Accent/focus colour: light green.
- Overlay colour: black.
- Caption colour: cream.
- Expanded panels retain full colour; collapsed panels use restrained desaturation and dimming.
- The section title and `05 PROJECTS / 05 个项目` counter remain unchanged.
- The current text-only `FlowingMenu` is removed from this section rather than duplicated below the new gallery.

## 5. Data Flow

### Language

`LanguageSwitch` request → `App.requestLanguageChange(next)` → `LanguagePixelTransition` cover → `App.setLanguage(next)` → existing metadata/session effects → transition reveal → controls unlock.

### Project Preview

`projects` + current `language` → gallery items → expand panel → activate expanded panel → existing `openProject(project)` → current project route and detail component.

## 6. Verification

One focused local-preview pass will verify:

- Both English-to-Chinese and Chinese-to-English transitions cover the full viewport.
- Header, homepage, and project-detail content all switch language after full coverage.
- Route and scroll position remain stable during language changes.
- Exactly five existing images appear in the existing project order.
- Desktop hover/focus and mobile tap behaviour work without horizontal overflow.
- An expanded panel opens the correct existing project detail.
- Reduced-motion fallback completes without trapping the interface.
- No browser runtime errors occur.

Run the existing TypeScript check and production build after implementation. A successful local preview is not deployment approval.

## 7. Out of Scope

- Rewriting or inventing project-detail content.
- Changing the five project titles, order, routes, or source images.
- Adding new colours, external images, analytics, backend work, or content management.
- Deploying or publishing the site.
