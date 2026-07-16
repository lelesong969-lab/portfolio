import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";

type SplitTextProps = {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  threshold?: number;
  rootMargin?: string;
  textAlign?: "left" | "center" | "right";
  tag?: "h1" | "h2" | "h3" | "strong" | "p" | "span";
  id?: string;
  onLetterAnimationComplete?: () => void;
};

function SplitText({
  text,
  className = "",
  delay = 34,
  duration = 0.62,
  ease = "power3.out",
  from = { opacity: 0, y: 30 },
  to = { opacity: 1, y: 0 },
  threshold = 0.12,
  rootMargin = "-54px",
  textAlign = "left",
  tag: Tag = "p",
  id,
  onLetterAnimationComplete,
}: SplitTextProps) {
  const rootRef = useRef<HTMLElement>(null);
  const characters = useMemo(() => Array.from(text), [text]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-split-char]"));
    if (!targets.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = gsap.context(() => {
      gsap.set(targets, from);
      const reveal = () => {
        gsap.to(targets, {
          ...to,
          duration,
          ease,
          stagger: delay / 1000,
          clearProps: "transform,opacity",
          onComplete: onLetterAnimationComplete,
        });
      };

      const observer = new IntersectionObserver(
        (entries) => {
          if (!entries[0]?.isIntersecting) return;
          reveal();
          observer.disconnect();
        },
        { threshold, rootMargin },
      );
      observer.observe(root);

      return () => observer.disconnect();
    }, root);

    return () => context.revert();
  }, [characters, delay, duration, ease, from, onLetterAnimationComplete, rootMargin, threshold, to]);

  return (
    <Tag
      id={id}
      ref={rootRef as never}
      className={`split-text ${className}`}
      aria-label={text}
      style={{ textAlign }}
    >
      <span aria-hidden="true">
        {characters.map((character, index) => (
          <span className="split-text__char" data-split-char key={`${character}-${index}`}>
            {character === " " ? "\u00a0" : character}
          </span>
        ))}
      </span>
    </Tag>
  );
}

export default SplitText;
