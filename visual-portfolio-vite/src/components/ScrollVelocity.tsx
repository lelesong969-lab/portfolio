import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import "./ScrollVelocity.css";

type ScrollVelocityProps = {
  scrollContainerRef?: RefObject<HTMLElement | null>;
  texts?: ReactNode[];
  velocity?: number;
  className?: string;
  damping?: number;
  stiffness?: number;
  numCopies?: number;
  velocityMapping?: { input: number[]; output: number[] };
  parallaxClassName?: string;
  scrollerClassName?: string;
  parallaxStyle?: CSSProperties;
  scrollerStyle?: CSSProperties;
};

const wrap = (minimum: number, maximum: number, value: number) => {
  const range = maximum - minimum;
  return (((value - minimum) % range) + range) % range + minimum;
};

type VelocityTextProps = Omit<ScrollVelocityProps, "texts"> & {
  children: ReactNode;
  baseVelocity: number;
};

function VelocityText({
  children,
  baseVelocity,
  scrollContainerRef,
  className = "",
  damping = 50,
  stiffness = 400,
  numCopies = 6,
  velocityMapping = { input: [0, 1000], output: [0, 5] },
  parallaxClassName = "scroll-velocity",
  scrollerClassName = "scroll-velocity__scroller",
  parallaxStyle,
  scrollerStyle,
}: VelocityTextProps) {
  const copyRef = useRef<HTMLSpanElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [copyWidth, setCopyWidth] = useState(0);

  useLayoutEffect(() => {
    const copy = copyRef.current;
    if (!copy) return;
    const updateWidth = () => setCopyWidth(copy.offsetWidth);
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(copy);
    return () => observer.disconnect();
  }, [children]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || copyWidth === 0) return;

    const container = scrollContainerRef?.current;
    const getScrollPosition = () => container ? container.scrollTop : window.scrollY;
    let previousScroll = getScrollPosition();
    let previousTime = performance.now();
    let smoothVelocity = 0;
    let offset = 0;
    let direction = 1;
    let frameId = 0;

    const render = (time: number) => {
      const delta = Math.min(.05, Math.max(.001, (time - previousTime) / 1000));
      const currentScroll = getScrollPosition();
      const rawVelocity = (currentScroll - previousScroll) / delta;
      const response = Math.min(1, delta * Math.max(1, stiffness / Math.max(1, damping)) * 5);
      smoothVelocity += (rawVelocity - smoothVelocity) * response;
      const [inputStart = 0, inputEnd = 1000] = velocityMapping.input;
      const [outputStart = 0, outputEnd = 5] = velocityMapping.output;
      const mapped = outputStart + ((Math.abs(smoothVelocity) - inputStart) / Math.max(1, inputEnd - inputStart)) * (outputEnd - outputStart);
      const factor = Math.max(0, Math.min(4, mapped));

      if (smoothVelocity < -1) direction = -1;
      if (smoothVelocity > 1) direction = 1;

      const moveBy = direction * baseVelocity * delta * (1 + factor);
      offset += moveBy;
      const scroller = scrollerRef.current;
      if (scroller) scroller.style.transform = `translate3d(${wrap(-copyWidth, 0, offset).toFixed(2)}px, 0, 0)`;

      previousScroll = currentScroll;
      previousTime = time;
      frameId = window.requestAnimationFrame(render);
    };

    frameId = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(frameId);
  }, [baseVelocity, copyWidth, damping, scrollContainerRef, stiffness, velocityMapping]);

  const spokenText = typeof children === "string" ? children.replace(/\s+/g, " ").trim() : undefined;

  return (
    <div className={parallaxClassName} style={parallaxStyle} aria-label={spokenText}>
      <div ref={scrollerRef} className={scrollerClassName} style={scrollerStyle} aria-hidden="true">
        {Array.from({ length: numCopies }, (_, index) => (
          <span ref={index === 0 ? copyRef : undefined} className={className} key={index}>
            {children}&nbsp;
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ScrollVelocity({ texts = [], velocity = 100, ...props }: ScrollVelocityProps) {
  return (
    <section className="scroll-velocity__group">
      {texts.map((text, index) => (
        <VelocityText key={index} baseVelocity={index % 2 === 0 ? velocity : -velocity} {...props}>
          {text}
        </VelocityText>
      ))}
    </section>
  );
}
