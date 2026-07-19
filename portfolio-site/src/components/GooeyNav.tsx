import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import "./GooeyNav.css";

export type GooeyNavItem = {
  label: string;
  href: string;
};

type GooeyNavProps = {
  items: GooeyNavItem[];
  animationTime?: number;
  particleCount?: number;
  particleDistances?: [number, number];
  particleR?: number;
  timeVariance?: number;
  colors?: number[];
  initialActiveIndex?: number;
};

type ParticleStyle = CSSProperties & Record<`--${string}`, string | number>;

export default function GooeyNav({
  items,
  animationTime = 520,
  particleCount = 12,
  particleDistances = [58, 8],
  particleR = 82,
  timeVariance = 180,
  colors = [1, 2, 3, 1, 3, 2, 4],
  initialActiveIndex = 0,
}: GooeyNavProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const filterRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const cleanupTimersRef = useRef<number[]>([]);
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);

  const noise = (amount = 1) => amount / 2 - Math.random() * amount;

  const getXY = (distance: number, pointIndex: number) => {
    const angle = ((360 + noise(8)) / particleCount) * pointIndex * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  };

  const updateEffectPosition = (element: HTMLElement) => {
    const container = containerRef.current;
    const filter = filterRef.current;
    const text = textRef.current;
    if (!container || !filter || !text) return;

    const containerRect = container.getBoundingClientRect();
    const itemRect = element.getBoundingClientRect();
    const styles = {
      left: `${itemRect.left - containerRect.left}px`,
      top: `${itemRect.top - containerRect.top}px`,
      width: `${itemRect.width}px`,
      height: `${itemRect.height}px`,
    };
    Object.assign(filter.style, styles);
    Object.assign(text.style, styles);
    text.textContent = element.textContent;
  };

  const clearParticles = () => {
    const filter = filterRef.current;
    if (!filter) return;
    filter.querySelectorAll(".gooey-nav__particle").forEach((particle) => particle.remove());
  };

  const makeParticles = (element: HTMLSpanElement) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bubbleTime = animationTime * 2 + timeVariance;
    element.style.setProperty("--gooey-time", `${bubbleTime}ms`);
    element.classList.remove("is-active");

    for (let index = 0; index < particleCount; index += 1) {
      const duration = animationTime * 2 + noise(timeVariance * 2);
      const start = getXY(particleDistances[0], particleCount - index);
      const end = getXY(particleDistances[1] + noise(7), particleCount - index);
      const rotationNoise = noise(particleR / 10);
      const rotation = rotationNoise > 0
        ? (rotationNoise + particleR / 20) * 10
        : (rotationNoise - particleR / 20) * 10;
      const style: ParticleStyle = {
        "--start-x": `${start[0]}px`,
        "--start-y": `${start[1]}px`,
        "--end-x": `${end[0]}px`,
        "--end-y": `${end[1]}px`,
        "--particle-time": `${duration}ms`,
        "--particle-scale": `${1 + noise(.2)}`,
        "--particle-color": `var(--gooey-color-${colors[Math.floor(Math.random() * colors.length)]}, var(--ink))`,
        "--particle-rotate": `${rotation}deg`,
      };

      const startTimer = window.setTimeout(() => {
        const particle = document.createElement("span");
        const point = document.createElement("span");
        particle.className = "gooey-nav__particle";
        point.className = "gooey-nav__point";
        Object.entries(style).forEach(([property, value]) => {
          particle.style.setProperty(property, String(value));
        });
        particle.appendChild(point);
        element.appendChild(particle);
        window.requestAnimationFrame(() => element.classList.add("is-active"));

        const removeTimer = window.setTimeout(() => particle.remove(), duration);
        cleanupTimersRef.current.push(removeTimer);
      }, 30);
      cleanupTimersRef.current.push(startTimer);
    }
  };

  const handleClick = (event: MouseEvent<HTMLAnchorElement>, index: number) => {
    const item = event.currentTarget.parentElement;
    if (!item || activeIndex === index) return;

    setActiveIndex(index);
    updateEffectPosition(item);
    clearParticles();

    const text = textRef.current;
    if (text) {
      text.classList.remove("is-active");
      void text.offsetWidth;
      text.classList.add("is-active");
    }
    if (filterRef.current) makeParticles(filterRef.current);
  };

  useEffect(() => {
    const container = containerRef.current;
    const nav = navRef.current;
    if (!container || !nav) return;

    const positionActiveItem = () => {
      const activeItem = nav.querySelectorAll<HTMLElement>("li")[activeIndex];
      if (activeItem) updateEffectPosition(activeItem);
    };

    const frameId = window.requestAnimationFrame(() => {
      positionActiveItem();
      textRef.current?.classList.add("is-active");
    });
    const resizeObserver = typeof ResizeObserver === "function"
      ? new ResizeObserver(positionActiveItem)
      : null;
    resizeObserver?.observe(container);
    window.addEventListener("resize", positionActiveItem, { passive: true });

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", positionActiveItem);
    };
  }, [activeIndex]);

  useEffect(() => () => {
    cleanupTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    clearParticles();
  }, []);

  return (
    <div ref={containerRef} className="gooey-nav-container">
      <nav aria-label="主导航">
        <ul ref={navRef}>
          {items.map((item, index) => (
            <li className={activeIndex === index ? "is-active" : ""} key={item.href}>
              <a href={item.href} onClick={(event) => handleClick(event, index)}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <span ref={filterRef} className="gooey-nav__effect gooey-nav__effect--filter" aria-hidden="true" />
      <span ref={textRef} className="gooey-nav__effect gooey-nav__effect--text" aria-hidden="true" />
    </div>
  );
}
