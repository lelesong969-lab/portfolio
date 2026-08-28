import { type ReactNode, type RefObject, useLayoutEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./ScrollReveal.css";

gsap.registerPlugin(ScrollTrigger);

type ScrollRevealProps = {
  children: ReactNode;
  scrollContainerRef?: RefObject<HTMLElement | null>;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  containerClassName?: string;
  textClassName?: string;
  rotationEnd?: string;
  wordAnimationEnd?: string;
};

function ScrollReveal({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = "",
  textClassName = "",
  rotationEnd = "bottom bottom",
  wordAnimationEnd = "bottom bottom",
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const content = useMemo(() => {
    if (typeof children !== "string") return children;
    return (
      <p className={`scroll-reveal__text ${textClassName}`}>
        {children.split(/(\s+)/).map((word, index) =>
          /^\s+$/.test(word) ? word : (
            <span className="scroll-reveal__word" data-scroll-reveal-word key={`${word}-${index}`}>
              {word}
            </span>
          ),
        )}
      </p>
    );
  }, [children, textClassName]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const words = Array.from(container.querySelectorAll<HTMLElement>("[data-scroll-reveal-word]"));
    const targets: HTMLElement[] = words.length ? words : [container];
    const scroller = scrollContainerRef?.current;
    const scrollerConfig = scroller ? { scroller } : {};

    const context = gsap.context(() => {
      gsap.fromTo(
        container,
        { transformOrigin: "0% 50%", rotate: baseRotation },
        {
          rotate: 0,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            ...scrollerConfig,
            start: "top bottom",
            end: rotationEnd,
            scrub: true,
          },
        },
      );

      gsap.fromTo(
        targets,
        { opacity: baseOpacity },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.05,
          scrollTrigger: {
            trigger: container,
            ...scrollerConfig,
            start: "top bottom-=20%",
            end: wordAnimationEnd,
            scrub: true,
          },
        },
      );

      if (enableBlur) {
        gsap.fromTo(
          targets,
          { filter: `blur(${blurStrength}px)` },
          {
            filter: "blur(0px)",
            ease: "none",
            stagger: 0.05,
            scrollTrigger: {
              trigger: container,
              ...scrollerConfig,
              start: "top bottom-=20%",
              end: wordAnimationEnd,
              scrub: true,
            },
          },
        );
      }
    }, container);

    const refreshId = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      window.cancelAnimationFrame(refreshId);
      context.revert();
    };
  }, [baseOpacity, baseRotation, blurStrength, enableBlur, rotationEnd, scrollContainerRef, wordAnimationEnd]);

  return (
    <div ref={containerRef} className={`scroll-reveal ${containerClassName}`}>
      {content}
    </div>
  );
}

export default ScrollReveal;
