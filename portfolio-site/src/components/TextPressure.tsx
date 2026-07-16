import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./TextPressure.css";

type Point = { x: number; y: number };

type TextPressureProps = {
  text?: string;
  fontFamily?: string;
  fontUrl?: string;
  width?: boolean;
  weight?: boolean;
  italic?: boolean;
  alpha?: boolean;
  flex?: boolean;
  stroke?: boolean;
  scale?: boolean;
  textColor?: string;
  strokeColor?: string;
  className?: string;
  minFontSize?: number;
  minWeight?: number;
  maxWeight?: number;
  minWidth?: number;
  maxWidth?: number;
  maxItalic?: number;
};

const dist = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y);

const getAttr = (distance: number, maxDist: number, minVal: number, maxVal: number) => {
  const value = maxVal - Math.abs((maxVal * distance) / Math.max(1, maxDist));
  return Math.max(minVal, value + minVal);
};

const debounce = (func: () => void, delay: number) => {
  let timeoutId = 0;
  return () => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(func, delay);
  };
};

export default function TextPressure({
  text = "Compressa",
  fontFamily = "Roboto Flex",
  fontUrl = "https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wdth,wght@8..144,25..151,100..1000&display=swap",
  width = true,
  weight = true,
  italic = true,
  alpha = false,
  flex = true,
  stroke = false,
  scale = false,
  textColor = "#fffaf1",
  strokeColor = "#d5ad58",
  className = "",
  minFontSize = 36,
  minWeight = 320,
  maxWeight = 680,
  minWidth = 72,
  maxWidth = 128,
  maxItalic = .28,
}: TextPressureProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const spansRef = useRef<(HTMLSpanElement | null)[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const cursorRef = useRef({ x: 0, y: 0 });
  const visibleRef = useRef(false);
  const [fontSize, setFontSize] = useState(minFontSize);
  const [scaleY, setScaleY] = useState(1);
  const [lineHeight, setLineHeight] = useState(1);
  const characters = useMemo(() => text.split(""), [text]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      cursorRef.current = { x: event.clientX, y: event.clientY };
    };
    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) cursorRef.current = { x: touch.clientX, y: touch.clientY };
    };
    const container = containerRef.current;
    if (container) {
      const bounds = container.getBoundingClientRect();
      const center = { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
      mouseRef.current = center;
      cursorRef.current = center;
    }
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  const setSize = useCallback(() => {
    const container = containerRef.current;
    const title = titleRef.current;
    if (!container || !title) return;
    const { width: containerWidth, height: containerHeight } = container.getBoundingClientRect();
    const nextFontSize = Math.max(containerWidth / Math.max(1, characters.length / 2), minFontSize);
    setFontSize(nextFontSize);
    setScaleY(1);
    setLineHeight(1);
    window.requestAnimationFrame(() => {
      const textHeight = titleRef.current?.getBoundingClientRect().height ?? 0;
      if (scale && textHeight > 0) {
        const ratio = containerHeight / textHeight;
        setScaleY(ratio);
        setLineHeight(ratio);
      }
    });
  }, [characters.length, minFontSize, scale]);

  useEffect(() => {
    const debouncedSetSize = debounce(setSize, 100);
    debouncedSetSize();
    const resizeObserver = new ResizeObserver(debouncedSetSize);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    window.addEventListener("resize", debouncedSetSize);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", debouncedSetSize);
    };
  }, [setSize]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
      if (entry.isIntersecting) window.requestAnimationFrame(setSize);
    }, { threshold: .05 });
    observer.observe(container);
    return () => observer.disconnect();
  }, [setSize]);

  useEffect(() => {
    let frameId = 0;
    const animate = () => {
      if (visibleRef.current) {
        mouseRef.current.x += (cursorRef.current.x - mouseRef.current.x) / 15;
        mouseRef.current.y += (cursorRef.current.y - mouseRef.current.y) / 15;
        const title = titleRef.current;
        if (title) {
          const titleBounds = title.getBoundingClientRect();
          const maximumDistance = titleBounds.width / 2;
          spansRef.current.forEach((span) => {
            if (!span) return;
            const bounds = span.getBoundingClientRect();
            const distance = dist(mouseRef.current, {
              x: bounds.x + bounds.width / 2,
              y: bounds.y + bounds.height / 2,
            });
            const widthValue = width ? Math.floor(getAttr(distance, maximumDistance, minWidth, maxWidth)) : 100;
            const weightValue = weight ? Math.floor(getAttr(distance, maximumDistance, minWeight, maxWeight)) : 440;
            const italicValue = italic ? getAttr(distance, maximumDistance, 0, maxItalic).toFixed(2) : "0";
            const alphaValue = alpha ? getAttr(distance, maximumDistance, 0, 1).toFixed(2) : "1";
            const fontVariationSettings = `'wght' ${weightValue}, 'wdth' ${widthValue}, 'ital' ${italicValue}`;
            if (span.style.fontVariationSettings !== fontVariationSettings) {
              span.style.fontVariationSettings = fontVariationSettings;
            }
            if (alpha) span.style.opacity = alphaValue;
          });
        }
      }
      frameId = window.requestAnimationFrame(animate);
    };
    animate();
    return () => window.cancelAnimationFrame(frameId);
  }, [alpha, italic, maxItalic, maxWeight, maxWidth, minWeight, minWidth, weight, width]);

  const fontImport = useMemo(() => (
    <style>{`@import url('${fontUrl}');`}</style>
  ), [fontUrl]);
  const dynamicClassName = [
    "text-pressure__title",
    className,
    flex ? "text-pressure__title--flex" : "",
    stroke ? "text-pressure__title--stroke" : "",
  ].filter(Boolean).join(" ");

  return (
    <div ref={containerRef} className="text-pressure">
      {fontImport}
      <h2
        ref={titleRef}
        className={dynamicClassName}
        style={{
          color: textColor,
          fontFamily,
          fontSize,
          lineHeight,
          transform: `scale(1, ${scaleY})`,
          ["--text-pressure-stroke" as string]: strokeColor,
        }}
      >
        {characters.map((character, index) => (
          <span
            key={`${character}-${index}`}
            ref={(element) => { spansRef.current[index] = element; }}
            data-char={character}
          >
            {character === " " ? "\u00a0" : character}
          </span>
        ))}
      </h2>
    </div>
  );
}
