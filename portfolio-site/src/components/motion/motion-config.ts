const parallaxRange = Object.freeze(["-1.5%", "1.5%"] as const);

export const revealConfig = Object.freeze({
  heroDuration: 0.56,
  heroStagger: 0.06,
  heroDistance: 8,
  heroScaleFrom: 1.01,
  revealDuration: 0.42,
  revealDistance: 16,
  viewportOnce: true,
  viewportAmount: 0.15,
  opacityFrom: 0.94,
});

export const pageTransitionConfig = Object.freeze({
  duration: 0.34,
  distance: 8,
  opacityFrom: 0.94,
});

export const parallaxMediaConfig = Object.freeze({
  breakpoint: 1024,
  range: parallaxRange,
});
