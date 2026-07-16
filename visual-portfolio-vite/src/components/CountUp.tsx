import { useEffect, useRef } from "react";
import { gsap } from "gsap";

type CountUpProps = {
  from?: number;
  to: number;
  duration?: number;
  delay?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
};

function CountUp({
  from = 0,
  to,
  duration = 0.85,
  delay = 0,
  className = "",
  prefix = "",
  suffix = "",
}: CountUpProps) {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    const state = { value: from };
    const render = () => {
      node.textContent = `${prefix}${Math.round(state.value)}${suffix}`;
    };
    render();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      state.value = to;
      render();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        gsap.to(state, {
          value: to,
          duration,
          delay,
          ease: "power2.out",
          snap: { value: 1 },
          onUpdate: render,
        });
        observer.disconnect();
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      gsap.killTweensOf(state);
    };
  }, [delay, duration, from, prefix, suffix, to]);

  return <span ref={nodeRef} className={className} />;
}

export default CountUp;
