import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import "./CircularGallery.css";

export type CircularGalleryItem = {
  image: string;
  text: string;
  previewLabel: string;
};

type CircularGalleryProps = {
  items: CircularGalleryItem[];
};

type CardComposition = {
  offset: number;
  rotation: number;
  scale: number;
  float: number;
  floatX: number;
  floatRotation: number;
  breath: number;
  duration: number;
  delay: number;
  scrollX: number;
  scrollY: number;
  scrollRotation: number;
};

type MotionValue = {
  current: number;
  target: number;
  velocity: number;
};

type CardMotion = {
  rotateX: MotionValue;
  rotateY: MotionValue;
  lift: MotionValue;
  scale: MotionValue;
};

type GalleryCardStyle = CSSProperties & {
  "--offset-y": string;
  "--rest-rotation": string;
  "--depth-scale": string;
  "--depth-opacity": string;
  "--float-amount": string;
  "--float-x": string;
  "--float-rotation": string;
  "--breath-scale": string;
  "--float-duration": string;
  "--float-delay": string;
  "--scroll-x": string;
  "--scroll-y": string;
  "--scroll-rotation": string;
  "--neighbor-x": string;
  "--neighbor-scale": string;
};

const CARD_COMPOSITION: CardComposition[] = [
  { offset: 58, rotation: -3.4, scale: 0.9, float: 22, floatX: 9, floatRotation: 2.3, breath: 1.014, duration: 7.7, delay: -2.4, scrollX: -46, scrollY: 34, scrollRotation: -1.1 },
  { offset: -44, rotation: 1.8, scale: 0.97, float: 16, floatX: 6, floatRotation: 1.5, breath: 1.01, duration: 6.3, delay: -4.9, scrollX: 34, scrollY: -38, scrollRotation: .8 },
  { offset: 42, rotation: -0.9, scale: 1.02, float: 20, floatX: 5, floatRotation: 1.2, breath: 1.015, duration: 5.4, delay: -1.7, scrollX: -24, scrollY: 31, scrollRotation: -.55 },
  { offset: -62, rotation: 3, scale: 0.97, float: 24, floatX: 10, floatRotation: 2.5, breath: 1.012, duration: 7.9, delay: -5.8, scrollX: 42, scrollY: -40, scrollRotation: 1 },
  { offset: 54, rotation: -2.3, scale: 0.91, float: 18, floatX: 8, floatRotation: 1.9, breath: 1.013, duration: 6.9, delay: -3.5, scrollX: -38, scrollY: 35, scrollRotation: -.8 },
];

const springValue = (value: MotionValue) => {
  value.velocity += (value.target - value.current) * 0.115;
  value.velocity *= 0.74;
  value.current += value.velocity;
};

const isSettled = (value: MotionValue) =>
  Math.abs(value.target - value.current) < 0.008 && Math.abs(value.velocity) < 0.008;

function GravityCard({
  item,
  index,
  composition,
  neighborOffset,
  neighborScale,
  onActiveChange,
}: {
  item: CircularGalleryItem;
  index: number;
  composition: CardComposition;
  neighborOffset: number;
  neighborScale: number;
  onActiveChange: (index: number | null) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const motionRef = useRef<CardMotion>({
    rotateX: { current: 0, target: 0, velocity: 0 },
    rotateY: { current: 0, target: 0, velocity: 0 },
    lift: { current: 0, target: 0, velocity: 0 },
    scale: { current: 1, target: 1, velocity: 0 },
  });

  const renderMotion = () => {
    const card = cardRef.current;
    if (!card) return;
    const motion = motionRef.current;
    springValue(motion.rotateX);
    springValue(motion.rotateY);
    springValue(motion.lift);
    springValue(motion.scale);
    card.style.transform = `perspective(960px) translate3d(0, ${motion.lift.current.toFixed(2)}px, 0) rotateX(${motion.rotateX.current.toFixed(2)}deg) rotateY(${motion.rotateY.current.toFixed(2)}deg) scale(${motion.scale.current.toFixed(4)})`;

    if (![motion.rotateX, motion.rotateY, motion.lift, motion.scale].every(isSettled)) {
      frameRef.current = window.requestAnimationFrame(renderMotion);
    } else {
      frameRef.current = 0;
    }
  };

  const requestMotion = () => {
    if (frameRef.current === 0) renderMotion();
  };

  const setHoverTargets = (active: boolean) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const motion = motionRef.current;
    motion.lift.target = active ? -24 : 0;
    motion.scale.target = active ? 1.11 : 1;
    if (!active) {
      motion.rotateX.target = 0;
      motion.rotateY.target = 0;
    }
    requestMotion();
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const card = cardRef.current;
    if (!card) return;
    const bounds = card.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    motionRef.current.rotateX.target = (0.5 - y) * 16;
    motionRef.current.rotateY.target = (x - 0.5) * 22;
    card.style.setProperty("--gloss-x", `${(x * 100).toFixed(1)}%`);
    card.style.setProperty("--gloss-y", `${(y * 100).toFixed(1)}%`);
    requestMotion();
  };

  useEffect(() => () => window.cancelAnimationFrame(frameRef.current), []);

  const style: GalleryCardStyle = {
    "--offset-y": `${composition.offset}px`,
    "--rest-rotation": `${composition.rotation}deg`,
    "--depth-scale": `${composition.scale}`,
    "--depth-opacity": "1",
    "--float-amount": `${composition.float}px`,
    "--float-x": `${composition.floatX}px`,
    "--float-rotation": `${composition.floatRotation}deg`,
    "--breath-scale": `${composition.breath}`,
    "--float-duration": `${composition.duration}s`,
    "--float-delay": `${composition.delay}s`,
    "--scroll-x": "0px",
    "--scroll-y": "0px",
    "--scroll-rotation": "0deg",
    "--neighbor-x": `${neighborOffset}px`,
    "--neighbor-scale": `${neighborScale}`,
  };

  return (
    <li
      className="floating-gallery__card-shell"
      style={style}
      data-base-scale={composition.scale}
      data-scroll-x={composition.scrollX}
      data-scroll-y={composition.scrollY}
      data-scroll-rotation={composition.scrollRotation}
    >
      <div className="floating-gallery__card-float">
        <div
          ref={cardRef}
          className="floating-gallery__card"
          data-gravity-card
          tabIndex={0}
          role="img"
          aria-label={`项目预览：${item.text}`}
          onPointerEnter={() => { setHoverTargets(true); onActiveChange(index); }}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => { setHoverTargets(false); onActiveChange(null); }}
          onFocus={() => { setHoverTargets(true); onActiveChange(index); }}
          onBlur={() => { setHoverTargets(false); onActiveChange(null); }}
        >
          <img src={item.image} alt="" decoding="async" draggable={false} />
          <span className="floating-gallery__project-quote" aria-hidden="true">
            <span className="floating-gallery__quote-mark floating-gallery__quote-mark--open">“</span>
            <span className="floating-gallery__quote-copy">{item.previewLabel}</span>
            <span className="floating-gallery__quote-mark floating-gallery__quote-mark--close">”</span>
          </span>
          <span className="floating-gallery__gloss" aria-hidden="true" />
          <span className="floating-gallery__edge" aria-hidden="true" />
        </div>
      </div>
      <span className="floating-gallery__index" aria-hidden="true">0{index + 1}</span>
    </li>
  );
}

export default function CircularGallery({ items }: CircularGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, startX: 0, startScroll: 0 });
  const depthFrameRef = useRef(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDepth = () => {
      depthFrameRef.current = 0;
      const bounds = container.getBoundingClientRect();
      const center = bounds.left + bounds.width / 2;
      const shells = container.querySelectorAll<HTMLElement>(".floating-gallery__card-shell");
      shells.forEach((shell) => {
        const cardBounds = shell.getBoundingClientRect();
        const distance = Math.min(1, Math.abs(cardBounds.left + cardBounds.width / 2 - center) / (bounds.width * 0.72));
        const baseScale = Number(shell.dataset.baseScale ?? 1);
        const centerScale = 0.92 + (1 - distance) * 0.08;
        const scale = baseScale * 0.35 + centerScale * 0.65;
        shell.style.setProperty("--depth-scale", scale.toFixed(4));
        shell.style.setProperty("--depth-opacity", (0.82 + (1 - distance) * 0.18).toFixed(3));
      });
    };

    const updateScrollMotion = () => {
      const bounds = container.getBoundingClientRect();
      const startLine = window.innerHeight * 0.55;
      const progress = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? 0
        : Math.min(1, Math.max(0, (startLine - bounds.top) / (startLine + bounds.height * 0.9)));
      const shells = container.querySelectorAll<HTMLElement>(".floating-gallery__card-shell");
      shells.forEach((shell) => {
        shell.style.setProperty("--scroll-x", `${(Number(shell.dataset.scrollX ?? 0) * progress).toFixed(2)}px`);
        shell.style.setProperty("--scroll-y", `${(Number(shell.dataset.scrollY ?? 0) * progress).toFixed(2)}px`);
        shell.style.setProperty("--scroll-rotation", `${(Number(shell.dataset.scrollRotation ?? 0) * progress).toFixed(3)}deg`);
      });
    };

    const requestDepth = () => {
      if (depthFrameRef.current === 0) depthFrameRef.current = window.requestAnimationFrame(updateDepth);
    };

    let scrollFrameId = 0;
    const requestScrollMotion = () => {
      if (scrollFrameId) return;
      scrollFrameId = window.requestAnimationFrame(() => {
        scrollFrameId = 0;
        updateScrollMotion();
      });
    };

    const centerGallery = () => {
      container.scrollLeft = Math.max(0, (container.scrollWidth - container.clientWidth) / 2);
      updateDepth();
      updateScrollMotion();
    };

    centerGallery();
    const initialFrame = window.requestAnimationFrame(centerGallery);
    const initialTimer = window.setTimeout(centerGallery, 120);
    const resizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(requestDepth) : null;
    resizeObserver?.observe(container);
    container.addEventListener("scroll", requestDepth, { passive: true });
    window.addEventListener("scroll", requestScrollMotion, { passive: true });

    return () => {
      window.cancelAnimationFrame(initialFrame);
      window.clearTimeout(initialTimer);
      window.cancelAnimationFrame(depthFrameRef.current);
      window.cancelAnimationFrame(scrollFrameId);
      resizeObserver?.disconnect();
      container.removeEventListener("scroll", requestDepth);
      window.removeEventListener("scroll", requestScrollMotion);
    };
  }, [items]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const container = containerRef.current;
    if (!container) return;
    dragRef.current = {
      active: true,
      startX: event.clientX,
      startScroll: container.scrollLeft,
    };
    container.classList.add("circular-gallery--dragging");
    container.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    const drag = dragRef.current;
    if (!container || !drag.active) return;
    const distance = event.clientX - drag.startX;
    container.scrollLeft = drag.startScroll - distance;
  };

  const stopDragging = (event: ReactPointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container || !dragRef.current.active) return;
    dragRef.current.active = false;
    container.classList.remove("circular-gallery--dragging");
    if (container.hasPointerCapture(event.pointerId)) container.releasePointerCapture(event.pointerId);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    containerRef.current?.scrollBy({
      left: (event.key === "ArrowRight" ? 1 : -1) * (containerRef.current.clientWidth * 0.34),
      behavior: "auto",
    });
  };

  return (
    <div
      className="circular-gallery"
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-label="项目画廊，可拖拽或使用左右方向键浏览"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      onKeyDown={handleKeyDown}
    >
      <ol className="floating-gallery__track">
        {items.map((item, index) => (
          <GravityCard
            item={item}
            index={index}
            composition={CARD_COMPOSITION[index % CARD_COMPOSITION.length]}
            neighborOffset={hoveredIndex === null || hoveredIndex === index
              ? 0
              : Math.sign(index - hoveredIndex) * (Math.abs(index - hoveredIndex) === 1 ? 22 : 12)}
            neighborScale={hoveredIndex === null || hoveredIndex === index
              ? 1
              : Math.abs(index - hoveredIndex) === 1 ? .955 : .98}
            onActiveChange={setHoveredIndex}
            key={item.text}
          />
        ))}
      </ol>
      <ul className="circular-gallery__sr-list">
        {items.map((item) => <li key={item.text}>{item.text}</li>)}
      </ul>
    </div>
  );
}
