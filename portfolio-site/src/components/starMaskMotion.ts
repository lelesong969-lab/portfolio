export const DARK_BACKGROUND = "#111111";
export const SPRING_STIFFNESS = 105;
export const SPRING_DAMPING = 20;
export const SPRING_MASS = 0.9;
export const SPRING_REST_DELTA = 0.0005;
export const SPRING_REST_SPEED = 0.002;
export const STAR_GROWTH_START = 0.5;
export const STAR_GROWTH_END = 0.88;
export const STAR_AXIS_LEAD = 0.018;
export const FULL_COVER_PROGRESS = 0.88;
export const PORTAL_STABLE_SECONDS = 0.16;
export const INERTIA_DELAY_MS = 80;
export const INERTIA_DECAY_SECONDS = 0.24;

export const STAR_PATH = [
  "M 50 10",
  "C 52 10, 53 13, 54 20",
  "C 57 44, 59 62, 66 75",
  "C 74 86, 84 92, 90 96",
  "C 94 98, 94 102, 90 104",
  "C 84 108, 74 114, 66 125",
  "C 59 138, 57 156, 54 180",
  "C 53 187, 52 190, 50 190",
  "C 48 190, 47 187, 46 180",
  "C 43 156, 41 138, 34 125",
  "C 26 114, 16 108, 10 104",
  "C 6 102, 6 98, 10 96",
  "C 16 92, 26 86, 34 75",
  "C 41 62, 43 44, 46 20",
  "C 47 13, 48 10, 50 10",
  "Z",
].join(" ");

export const clamp = (value: number, minimum = 0, maximum = 1) =>
  Math.min(maximum, Math.max(minimum, value));

export const lerp = (start: number, end: number, progress: number) =>
  start + (end - start) * progress;

const smootherStep = (value: number) => {
  const progress = clamp(value);
  return progress ** 3 * (progress * (progress * 6 - 15) + 10);
};

export const getStarGrowth = (progress: number, delay = 0) =>
  smootherStep((progress - STAR_GROWTH_START - delay) / (STAR_GROWTH_END - STAR_GROWTH_START));

export const getPortalScrollProgress = (portal: HTMLElement, stage: HTMLElement) => {
  const travel = Math.max(1, portal.offsetHeight - stage.clientHeight);
  return clamp(-portal.getBoundingClientRect().top / travel);
};

export function getCoveredScale(
  stage: HTMLElement,
  shape: SVGSVGElement,
  star: SVGPathElement,
) {
  const diagonal = Math.hypot(stage.clientWidth, stage.clientHeight);
  const viewBox = shape.viewBox.baseVal;
  const bounds = star.getBBox();
  const baseWidth = shape.clientWidth * (bounds.width / viewBox.width);
  const baseHeight = shape.clientHeight * (bounds.height / viewBox.height);
  const limitingDimension = Math.max(1, Math.min(baseWidth, baseHeight));
  const diagonalMinimum = diagonal / limitingDimension;
  const centerX = viewBox.x + viewBox.width / 2;
  const centerY = viewBox.y + viewBox.height / 2;
  const pixelsPerUnitX = shape.clientWidth / viewBox.width;
  const pixelsPerUnitY = shape.clientHeight / viewBox.height;
  const corners = [
    [-stage.clientWidth / 2, -stage.clientHeight / 2],
    [stage.clientWidth / 2, -stage.clientHeight / 2],
    [stage.clientWidth / 2, stage.clientHeight / 2],
    [-stage.clientWidth / 2, stage.clientHeight / 2],
  ];
  const coversAtScale = (scale: number) => corners.every(([offsetX, offsetY]) =>
    star.isPointInFill(new DOMPoint(
      centerX + offsetX / (pixelsPerUnitX * scale),
      centerY + offsetY / (pixelsPerUnitY * scale),
    )),
  );

  let minimum = diagonalMinimum;
  let maximum = diagonalMinimum;
  while (!coversAtScale(maximum) && maximum < 128) maximum *= 1.35;

  for (let index = 0; index < 18; index += 1) {
    const candidate = (minimum + maximum) / 2;
    if (coversAtScale(candidate)) maximum = candidate;
    else minimum = candidate;
  }

  return maximum * 1.28;
}
