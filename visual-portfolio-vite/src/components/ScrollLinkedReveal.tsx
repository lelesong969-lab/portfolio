import { type ReactNode, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./ScrollLinkedReveal.css";

gsap.registerPlugin(ScrollTrigger);

type ScrollLinkedRevealProps = {
  children: ReactNode;
  direction?: "left" | "right" | "up";
  variant?: "cinematic" | "water";
  offset?: number;
  blur?: number;
  start?: string;
  end?: string;
  scaleFrom?: number;
  className?: string;
};

export default function ScrollLinkedReveal({
  children,
  direction = "up",
  variant = "cinematic",
  offset = 64,
  blur = 8,
  start = "top 92%",
  end = "top 48%",
  scaleFrom = .985,
  className = "",
}: ScrollLinkedRevealProps) {
  const revealRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = revealRef.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const waterReveal = variant === "water";
    const x = direction === "left" ? -offset : direction === "right" ? offset : 0;
    const y = waterReveal ? 28 : direction === "up" ? offset : 0;
    const context = gsap.context(() => {
      gsap.fromTo(
        element,
        {
          x,
          y,
          opacity: 0,
          scale: scaleFrom,
          filter: `blur(${waterReveal ? 10 : blur}px)`,
          ...(waterReveal ? { clipPath: "inset(100% 0 0 0 round 48% 48% 0 0)" } : {}),
          "--scroll-reveal-progress": 0,
        },
        {
          x: 0,
          y: 0,
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
          ...(waterReveal ? { clipPath: "inset(0% 0 0 0 round 0% 0% 0 0)" } : {}),
          "--scroll-reveal-progress": 1,
          ease: waterReveal ? "power2.out" : "back.out(1.08)",
          scrollTrigger: {
            trigger: element,
            start,
            end,
            scrub: .55,
            invalidateOnRefresh: true,
          },
        },
      );
    }, element);
    const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      window.cancelAnimationFrame(refreshFrame);
      context.revert();
    };
  }, [blur, direction, end, offset, scaleFrom, start, variant]);

  return (
    <div
      ref={revealRef}
      className={`scroll-linked-reveal scroll-linked-reveal--${variant} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
