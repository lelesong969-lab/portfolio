import { useEffect } from "react";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const canScrollInside = (target: EventTarget | null, deltaY: number) => {
  let element = target instanceof Element ? target : null;

  while (element && element !== document.documentElement && element !== document.body) {
    const style = getComputedStyle(element);
    const scrollable = /(auto|scroll)/.test(style.overflowY) && element.scrollHeight > element.clientHeight + 1;
    if (scrollable) {
      const canMoveDown = deltaY > 0 && element.scrollTop + element.clientHeight < element.scrollHeight - 1;
      const canMoveUp = deltaY < 0 && element.scrollTop > 1;
      if (canMoveDown || canMoveUp) return true;
    }
    element = element.parentElement;
  }

  return false;
};

const normalizeWheelDelta = (event: WheelEvent) => {
  const modeMultiplier = event.deltaMode === WheelEvent.DOM_DELTA_LINE
    ? 16
    : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
      ? window.innerHeight
      : 1;
  const delta = event.deltaY * modeMultiplier;
  return Math.sign(delta) * Math.min(Math.abs(delta), 220);
};

export default function SmoothWheelScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let currentY = window.scrollY;
    let targetY = currentY;
    let frameId = 0;
    let lastFrame = performance.now();
    let internalScrollUntil = 0;

    const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const render = (time: number) => {
      const deltaSeconds = Math.min(.05, Math.max(.001, (time - lastFrame) / 1000));
      lastFrame = time;
      targetY = clamp(targetY, 0, maxScroll());
      const blend = 1 - Math.exp(-5.2 * deltaSeconds);
      currentY += (targetY - currentY) * blend;

      if (Math.abs(targetY - currentY) < .32) currentY = targetY;
      internalScrollUntil = time + 48;
      window.scrollTo({ top: currentY, left: 0, behavior: "instant" as ScrollBehavior });

      if (currentY === targetY) {
        frameId = 0;
        return;
      }
      frameId = window.requestAnimationFrame(render);
    };

    const start = () => {
      if (frameId) return;
      lastFrame = performance.now();
      frameId = window.requestAnimationFrame(render);
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      const deltaY = normalizeWheelDelta(event);
      if (!deltaY || canScrollInside(event.target, deltaY)) return;

      event.preventDefault();
      if (!frameId) {
        currentY = window.scrollY;
        targetY = currentY;
      }
      targetY = clamp(targetY + deltaY * 1.12, 0, maxScroll());
      start();
    };

    const handleExternalScroll = () => {
      if (performance.now() <= internalScrollUntil) return;
      if (frameId) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
      currentY = window.scrollY;
      targetY = currentY;
    };

    const handleResize = () => {
      targetY = clamp(targetY, 0, maxScroll());
      currentY = clamp(currentY, 0, maxScroll());
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("scroll", handleExternalScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("scroll", handleExternalScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return null;
}
