import { type ReactNode, type RefObject, useLayoutEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./ScrollFloat.css";

gsap.registerPlugin(ScrollTrigger);

type ScrollFloatProps = {
  children: ReactNode;
  scrollContainerRef?: RefObject<HTMLElement | null>;
  as?: "h2" | "span" | "div";
  containerClassName?: string;
  textClassName?: string;
  animationDuration?: number;
  ease?: string;
  scrollStart?: string;
  scrollEnd?: string;
  stagger?: number;
  scrub?: boolean | number;
};

function ScrollFloat({
  children,
  scrollContainerRef,
  as: Tag = "h2",
  containerClassName = "",
  textClassName = "",
  animationDuration = 1,
  ease = "back.inOut(2)",
  scrollStart = "center bottom+=50%",
  scrollEnd = "bottom bottom-=40%",
  stagger = 0.03,
  scrub = true,
}: ScrollFloatProps) {
  const containerRef = useRef<HTMLElement>(null);
  const text = typeof children === "string" ? children : undefined;

  const content = useMemo(() => {
    if (typeof children !== "string") return children;

    return children.split("").map((character, index) => (
      <span className="scroll-float__char" data-scroll-float-char key={`${character}-${index}`}>
        {character === " " ? "\u00a0" : character}
      </span>
    ));
  }, [children]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const characters = container.querySelectorAll<HTMLElement>("[data-scroll-float-char]");
    if (!characters.length) return;

    const scroller = scrollContainerRef?.current;
    const scrollerConfig = scroller ? { scroller } : {};
    const context = gsap.context(() => {
      gsap.fromTo(
        characters,
        {
          willChange: "opacity, transform",
          opacity: 0,
          yPercent: 120,
          scaleY: 2.3,
          scaleX: 0.7,
          transformOrigin: "50% 0%",
        },
        {
          duration: animationDuration,
          ease,
          opacity: 1,
          yPercent: 0,
          scaleY: 1,
          scaleX: 1,
          stagger,
          scrollTrigger: {
            trigger: container,
            ...scrollerConfig,
            start: scrollStart,
            end: scrollEnd,
            scrub,
          },
        },
      );
    }, container);

    const refreshId = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      window.cancelAnimationFrame(refreshId);
      context.revert();
    };
  }, [animationDuration, ease, scrollContainerRef, scrollEnd, scrollStart, stagger, scrub]);

  return (
    <Tag ref={containerRef as never} className={`scroll-float ${containerClassName}`} aria-label={text}>
      <span className={`scroll-float__text ${textClassName}`} aria-hidden={text ? "true" : undefined}>
        {content}
      </span>
    </Tag>
  );
}

export default ScrollFloat;
