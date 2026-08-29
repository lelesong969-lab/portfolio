# Hero Seven-Project Gallery Design

## Goal

Keep all seven project previews visible inside the homepage hero gallery while preserving the current editorial atmosphere and every existing card interaction. Replace the wide, partially clipped single-row composition with a compact responsive arrangement that feels intentionally staggered rather than mechanically gridded.

## Scope

- Change only the `CircularGallery` composition and its responsive layout rules.
- Keep the existing project order, images, background video, title, navigation, typography, colors, card treatment, and accessibility labels.
- Preserve the current floating breath, scroll displacement, pointer tilt, spring lift, neighboring-card response, image zoom, gloss, and quote reveal.
- Keep project cards decorative rather than turning them into a second project navigation index.

## Composition

### Desktop

- Display all seven cards without horizontal clipping.
- Use two staggered rows: four cards in the upper rhythm and three cards in the lower rhythm.
- Vary card width and vertical position within a restrained range so the composition reads as an editorial constellation.
- Keep sufficient negative space between cards so hover lift, tilt, and neighbor displacement do not collide.
- Center the complete composition within the existing selected hero-gallery region.

### Tablet

- Preserve all seven visible cards.
- Rebalance the same staggered system to a three-plus-four rhythm as width narrows.
- Reduce card width, gaps, and motion displacement proportionally without changing animation timing or easing.

### Mobile

- Use a responsive two-column sequence of `2–2–2–1`.
- Allow the gallery region to grow vertically so cards remain readable.
- Center the final single card and alternate row offsets to keep the staggered rhythm.
- Remove the need for horizontal dragging while retaining per-card float, breathing, focus, and touch behavior.

## Implementation Architecture

- Keep `GravityCard` as the interaction unit.
- Extend the existing card composition data with layout-oriented row and size variables where needed.
- Change the gallery track from a width-driven horizontal strip to a responsive grid-based composition.
- Continue using separate transform layers:
  - card shell for static placement, scroll response, depth, and neighbor movement;
  - float wrapper for the continuous breathing motion;
  - card surface for pointer tilt, spring lift, and hover scaling.
- Update depth calculations against the two-dimensional gallery center while keeping their existing visual range.
- Do not introduce new animation libraries or continuous JavaScript loops.

## Responsive and Interaction Rules

- Seven cards must be fully represented at every supported width.
- Desktop and tablet must not require horizontal scrolling.
- Mobile height may expand, but the page must not develop horizontal overflow.
- Keyboard focus and reduced-motion behavior must remain intact.
- Hover and focus effects must remain visually equivalent to the current implementation.

## Verification

- Build the production copy successfully.
- Run the existing project test suite.
- Check desktop, tablet, and mobile widths for full seven-card visibility and no horizontal page overflow.
- Verify card float, pointer tilt, hover quote, image zoom, scroll motion, and reduced-motion fallback.
- Confirm the existing background video, header, hero typography, and surrounding section layout remain unchanged.
- After local verification, sync the implementation to GitHub `main`, deploy to Vercel production, and verify the formal domain.
