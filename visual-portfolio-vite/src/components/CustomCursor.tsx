import { useEffect, useRef } from "react";
import "./CustomCursor.css";

type PointSpring = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  stiffness: number;
  damping: number;
  mass: number;
};

type ScaleSpring = {
  value: number;
  velocity: number;
};

const STAR_PATH = "M50 0C52 35 65 48 100 50C65 52 52 65 50 100C48 65 35 52 0 50C35 48 48 35 50 0Z";
const INTERACTIVE_SELECTOR = "a, button, input, select, textarea, [role='button'], [data-gravity-card], .floating-gallery__card, .flowing-menu__link";

const parseColor = (value: string) => {
  const channels = value.match(/[\d.]+/g)?.map(Number) ?? [];
  if (channels.length < 3) return null;
  return { r: channels[0], g: channels[1], b: channels[2], a: channels[3] ?? 1 };
};

const isDarkColor = (value: string) => {
  const color = parseColor(value);
  if (!color || color.a < .35) return null;
  const luminance = (.2126 * color.r + .7152 * color.g + .0722 * color.b) / 255;
  return luminance < .34;
};

const shouldUseLightStars = (x: number, y: number) => {
  const target = document.elementFromPoint(x, y);
  if (!(target instanceof Element)) return false;

  const about = target.closest(".about-intro");
  if (about) return true;

  const openingPortal = target.closest<HTMLElement>(".star-portal");
  if (openingPortal && Number(openingPortal.dataset.displayProgress ?? 0) > .86) return true;

  const closingPortal = target.closest<HTMLElement>(".star-closing");
  if (closingPortal && Number(closingPortal.dataset.progress ?? 0) < .94) return true;

  const boundary = target.closest<HTMLElement>(".project-gallery-section__boundary");
  if (boundary) {
    const bounds = boundary.getBoundingClientRect();
    if ((y - bounds.top) / Math.max(1, bounds.height) > .62) return true;
  }

  let node: Element | null = target;
  while (node) {
    const style = getComputedStyle(node);
    const backgroundIsDark = isDarkColor(style.backgroundColor);
    if (backgroundIsDark !== null) return backgroundIsDark;
    if (node instanceof SVGElement) {
      const fillIsDark = isDarkColor(style.fill);
      if (fillIsDark !== null) return fillIsDark;
    }
    node = node.parentElement;
  }
  return false;
};

const stepPointSpring = (spring: PointSpring, targetX: number, targetY: number, delta: number) => {
  const ax = (spring.stiffness * (targetX - spring.x) - spring.damping * spring.vx) / spring.mass;
  const ay = (spring.stiffness * (targetY - spring.y) - spring.damping * spring.vy) / spring.mass;
  spring.vx += ax * delta;
  spring.vy += ay * delta;
  spring.x += spring.vx * delta;
  spring.y += spring.vy * delta;
};

const constrainTrailDistance = (
  spring: PointSpring,
  cursorX: number,
  cursorY: number,
  behindX: number,
  behindY: number,
  minDistance: number,
  maxDistance: number,
) => {
  const dx = spring.x - cursorX;
  const dy = spring.y - cursorY;
  const distance = Math.hypot(dx, dy);

  if (distance < minDistance) {
    const directionX = distance > .001 ? dx / distance : behindX;
    const directionY = distance > .001 ? dy / distance : behindY;
    spring.x = cursorX + directionX * minDistance;
    spring.y = cursorY + directionY * minDistance;
    spring.vx *= .72;
    spring.vy *= .72;
  } else if (distance > maxDistance) {
    const ratio = maxDistance / distance;
    spring.x = cursorX + dx * ratio;
    spring.y = cursorY + dy * ratio;
    spring.vx *= .72;
    spring.vy *= .72;
  }
};

const stepScaleSpring = (spring: ScaleSpring, target: number, delta: number) => {
  const acceleration = (210 * (target - spring.value) - 18 * spring.velocity) / .48;
  spring.velocity += acceleration * delta;
  spring.value += spring.velocity * delta;
};

export default function CustomCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<SVGSVGElement>(null);
  const secondaryRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const main = mainRef.current;
    const secondary = secondaryRef.current;
    if (!root || !main || !secondary) return;

    const finePointer = window.matchMedia("(pointer: fine) and (hover: hover)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches || reducedMotion.matches) return;

    const cursor = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const previousCursor = { ...cursor };
    const trailDirection = { x: 1, y: 0 };
    const mainSpring: PointSpring = { ...cursor, vx: 0, vy: 0, stiffness: 90, damping: 17, mass: .85 };
    const secondarySpring: PointSpring = { ...cursor, vx: 0, vy: 0, stiffness: 42, damping: 13.8, mass: 1.15 };
    const mainScale: ScaleSpring = { value: 1, velocity: 0 };
    const secondaryScale: ScaleSpring = { value: 1, velocity: 0 };
    let frameId = 0;
    let initialized = false;
    let isInteractive = false;
    let isPressed = false;
    let lastFrame = performance.now();
    let lastMove = lastFrame;
    let lastPointerSample = lastFrame;
    let pointerSpeed = 0;
    let idleMix = 0;

    const syncContrast = () => {
      root.dataset.contrast = shouldUseLightStars(cursor.x, cursor.y) ? "dark" : "light";
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== "mouse") return;
      const now = performance.now();
      const sampleDelta = Math.max(8, now - lastPointerSample);
      const movementX = event.clientX - previousCursor.x;
      const movementY = event.clientY - previousCursor.y;
      const distance = Math.hypot(movementX, movementY);
      const speed = distance / sampleDelta;
      if (distance > .4) {
        const nextDirectionX = movementX / distance;
        const nextDirectionY = movementY / distance;
        const directionMix = Math.min(.48, .2 + speed * .12);
        trailDirection.x += (nextDirectionX - trailDirection.x) * directionMix;
        trailDirection.y += (nextDirectionY - trailDirection.y) * directionMix;
        const directionLength = Math.hypot(trailDirection.x, trailDirection.y) || 1;
        trailDirection.x /= directionLength;
        trailDirection.y /= directionLength;
        pointerSpeed = pointerSpeed * .42 + speed * .58;
      }
      previousCursor.x = event.clientX;
      previousCursor.y = event.clientY;
      cursor.x = event.clientX;
      cursor.y = event.clientY;
      lastPointerSample = now;
      if (speed > .015) lastMove = now;

      if (!initialized) {
        initialized = true;
        mainSpring.x = cursor.x - trailDirection.x * 18;
        mainSpring.y = cursor.y - trailDirection.y * 18;
        secondarySpring.x = cursor.x - trailDirection.x * 38;
        secondarySpring.y = cursor.y - trailDirection.y * 38;
        root.dataset.visible = "true";
      }

      const target = event.target;
      isInteractive = target instanceof Element && Boolean(target.closest(INTERACTIVE_SELECTOR));
      syncContrast();
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== "mouse") return;
      isPressed = true;
    };

    const handlePointerUp = () => {
      isPressed = false;
    };

    const render = (time: number) => {
      const delta = Math.min(1 / 30, Math.max(1 / 240, (time - lastFrame) / 1000));
      lastFrame = time;
      pointerSpeed *= Math.exp(-delta * 1.55);
      const speedMix = Math.min(1, pointerSpeed / .85);
      const mainDistance = 16 + speedMix * 12;
      const secondaryDistance = 32 + speedMix * 26;
      const behindX = -trailDirection.x;
      const behindY = -trailDirection.y;

      stepPointSpring(mainSpring, cursor.x + behindX * mainDistance, cursor.y + behindY * mainDistance, delta);
      stepPointSpring(secondarySpring, cursor.x + behindX * secondaryDistance, cursor.y + behindY * secondaryDistance, delta);
      constrainTrailDistance(mainSpring, cursor.x, cursor.y, behindX, behindY, 14, 30);
      constrainTrailDistance(secondarySpring, cursor.x, cursor.y, behindX, behindY, 30, 58);

      const mainTargetScale = isPressed ? .78 : isInteractive ? 1.28 : 1;
      const secondaryTargetScale = isInteractive ? .9 : 1;
      stepScaleSpring(mainScale, mainTargetScale, delta);
      stepScaleSpring(secondaryScale, secondaryTargetScale, delta);

      const isIdle = time - lastMove > 650 && !isInteractive && !isPressed;
      idleMix += ((isIdle ? 1 : 0) - idleMix) * Math.min(1, delta * 5.5);
      const phase = time / 1550;
      const mainBreath = 1 + Math.sin(phase * Math.PI) * .06 * idleMix;
      const secondaryBreath = 1 + (-.09 + Math.sin(phase * Math.PI) * .09) * idleMix;

      main.style.transform = `translate3d(${(mainSpring.x - 8).toFixed(2)}px, ${(mainSpring.y - 8).toFixed(2)}px, 0) scale(${(mainScale.value * mainBreath).toFixed(4)})`;
      secondary.style.transform = `translate3d(${(secondarySpring.x - 3.5).toFixed(2)}px, ${(secondarySpring.y - 3.5).toFixed(2)}px, 0) scale(${(secondaryScale.value * secondaryBreath).toFixed(4)})`;
      frameId = window.requestAnimationFrame(render);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    window.addEventListener("pointercancel", handlePointerUp, { passive: true });
    frameId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, []);

  return (
    <div ref={rootRef} className="custom-cursor" aria-hidden="true" data-visible="false" data-contrast="light">
      <svg ref={mainRef} className="custom-cursor__star custom-cursor__star--main" viewBox="0 0 100 100" focusable="false">
        <path d={STAR_PATH} />
      </svg>
      <svg ref={secondaryRef} className="custom-cursor__star custom-cursor__star--secondary" viewBox="0 0 100 100" focusable="false">
        <path d={STAR_PATH} />
      </svg>
    </div>
  );
}
