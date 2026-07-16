import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { useGesture } from "@use-gesture/react";
import type { GalleryImage, GalleryImageType } from "../../data/portfolio";
import "./ProjectDomeGallery.css";

type ProjectDomeGalleryProps = {
  images: GalleryImage[];
  fit?: number;
  fitBasis?: "auto" | "min" | "max" | "width" | "height";
  minRadius?: number;
  maxRadius?: number;
  padFactor?: number;
  overlayBlurColor?: string;
  maxVerticalRotationDeg?: number;
  dragSensitivity?: number;
  enlargeTransitionMs?: number;
  segments?: number;
  dragDampening?: number;
  openedImageWidth?: string;
  openedImageHeight?: string;
  imageBorderRadius?: string;
  openedImageBorderRadius?: string;
  grayscale?: boolean;
};

type DomeItem = GalleryImage & { x: number; y: number };

const FIT_BY_TYPE: Record<GalleryImageType, "cover" | "contain"> = {
  render: "cover",
  photo: "cover",
  "context-reference": "cover",
  process: "cover",
  diagram: "contain",
  chart: "contain",
  poster: "contain",
  "technical-drawing": "contain",
  interface: "contain",
  "project-board": "contain",
};

const CENTRAL_COORDS = [
  { x: -6, y: -1 },
  { x: 0, y: 0 },
  { x: 6, y: -1 },
  { x: -8, y: 4 },
  { x: -3, y: 4 },
  { x: 3, y: 4 },
  { x: 8, y: 4 },
  { x: -7, y: -5 },
  { x: -2, y: -5 },
  { x: 3, y: -5 },
  { x: 8, y: -5 },
  { x: 11, y: 0 },
] as const;

const AMBIENT_COORDS = [
  { x: -14, y: -4, sizeX: 2, sizeY: 2 },
  { x: -13, y: 4, sizeX: 3, sizeY: 2 },
  { x: 14, y: -4, sizeX: 2, sizeY: 2 },
  { x: 14, y: 4, sizeX: 3, sizeY: 2 },
] as const;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function useSimpleGalleryMode() {
  const [simple, setSimple] = useState(false);

  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 767px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSimple(narrow.matches || reduced.matches);
    update();
    narrow.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      narrow.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
    };
  }, []);

  return simple;
}

export default function ProjectDomeGallery({
  images,
  fit = 0.62,
  fitBasis = "auto",
  minRadius = 720,
  maxRadius = 1500,
  padFactor = 0.08,
  overlayBlurColor = "#D8D0C4",
  maxVerticalRotationDeg = 6,
  dragSensitivity = 28,
  enlargeTransitionMs = 480,
  segments = 32,
  dragDampening = 0.72,
  openedImageWidth = "min(88vw, 1360px)",
  openedImageHeight = "min(82vh, 900px)",
  imageBorderRadius = "14px",
  openedImageBorderRadius = "18px",
  grayscale = false,
}: ProjectDomeGalleryProps) {
  const simpleMode = useSimpleGalleryMode();
  const rootRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const originRectRef = useRef<DOMRect | null>(null);
  const viewerPanelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const rotationRef = useRef({ x: 0, y: 0 });
  const startRotationRef = useRef({ x: 0, y: 0 });
  const inertiaFrameRef = useRef<number | null>(null);
  const movedRef = useRef(false);
  const suppressClickUntilRef = useRef(0);
  const closeTimerRef = useRef<number | null>(null);
  const openFrameRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [viewerReady, setViewerReady] = useState(false);
  const [originTransform, setOriginTransform] = useState("translate3d(0, 18px, 0) scale(.82)");

  const normalizedImages = useMemo(
    () => images.map((image) => ({ ...image, fit: image.fit ?? FIT_BY_TYPE[image.type] })),
    [images],
  );

  const domeItems = useMemo<DomeItem[]>(
    () =>
      normalizedImages.slice(0, CENTRAL_COORDS.length).map((image, index) => ({
        ...image,
        x: image.x ?? CENTRAL_COORDS[index].x,
        y: image.y ?? CENTRAL_COORDS[index].y,
      })),
    [normalizedImages],
  );

  const applyTransform = useCallback((x: number, y: number) => {
    if (!sphereRef.current) return;
    sphereRef.current.style.transform = `translateZ(calc(var(--dome-radius) * -1)) rotateX(${x}deg) rotateY(${y}deg)`;
  }, []);

  const stopInertia = useCallback(() => {
    if (inertiaFrameRef.current !== null) {
      window.cancelAnimationFrame(inertiaFrameRef.current);
      inertiaFrameRef.current = null;
    }
  }, []);

  const startInertia = useCallback(
    (velocityX: number, velocityY: number) => {
      stopInertia();
      let vx = clamp(velocityX, -1.25, 1.25) * 56;
      let vy = clamp(velocityY, -1.25, 1.25) * 56;
      const friction = 0.955 + clamp(dragDampening, 0, 1) * 0.032;
      let frames = 0;

      const tick = () => {
        vx *= friction;
        vy *= friction;
        frames += 1;
        if ((Math.abs(vx) < 0.055 && Math.abs(vy) < 0.055) || frames > 250) {
          inertiaFrameRef.current = null;
          return;
        }
        const nextX = clamp(rotationRef.current.x - vy / 220, -maxVerticalRotationDeg, maxVerticalRotationDeg);
        const nextY = clamp(rotationRef.current.y + vx / 220, -34, 34);
        rotationRef.current = { x: nextX, y: nextY };
        applyTransform(nextX, nextY);
        inertiaFrameRef.current = window.requestAnimationFrame(tick);
      };

      inertiaFrameRef.current = window.requestAnimationFrame(tick);
    },
    [applyTransform, dragDampening, maxVerticalRotationDeg, stopInertia],
  );

  useGesture(
    {
      onDragStart: () => {
        if (activeIndex !== null || simpleMode) return;
        stopInertia();
        movedRef.current = false;
        startRotationRef.current = { ...rotationRef.current };
      },
      onDrag: ({ movement: [mx, my], velocity: [speedX, speedY], direction: [directionX, directionY], last }) => {
        if (activeIndex !== null || simpleMode) return;
        if (Math.hypot(mx, my) > 5) movedRef.current = true;
        const nextX = clamp(
          startRotationRef.current.x - my / dragSensitivity,
          -maxVerticalRotationDeg,
          maxVerticalRotationDeg,
        );
        const nextY = clamp(startRotationRef.current.y + mx / dragSensitivity, -34, 34);
        rotationRef.current = { x: nextX, y: nextY };
        applyTransform(nextX, nextY);

        if (last) {
          if (movedRef.current) suppressClickUntilRef.current = performance.now() + 140;
          startInertia(speedX * directionX, speedY * directionY);
          movedRef.current = false;
        }
      },
    },
    {
      target: mainRef,
      enabled: !simpleMode && activeIndex === null,
      eventOptions: { passive: true },
    },
  );

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || simpleMode) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = Math.max(1, entry.contentRect.width);
      const height = Math.max(1, entry.contentRect.height);
      const min = Math.min(width, height);
      const max = Math.max(width, height);
      const aspect = width / height;
      const basis =
        fitBasis === "min"
          ? min
          : fitBasis === "max"
            ? max
            : fitBasis === "width"
              ? width
              : fitBasis === "height"
                ? height
                : aspect >= 1.3
                  ? width
                  : min;
      const radius = clamp(Math.min(basis * fit, height * 1.35), minRadius, maxRadius);
      root.style.setProperty("--dome-radius", `${Math.round(radius)}px`);
      root.style.setProperty("--dome-viewer-pad", `${Math.max(8, Math.round(min * padFactor))}px`);
      applyTransform(rotationRef.current.x, rotationRef.current.y);
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, [applyTransform, fit, fitBasis, maxRadius, minRadius, padFactor, simpleMode]);

  const closeViewer = useCallback(() => {
    if (activeIndex === null || closeTimerRef.current !== null) return;
    setViewerReady(false);
    closeTimerRef.current = window.setTimeout(() => {
      setActiveIndex(null);
      document.body.classList.remove("project-gallery-scroll-lock");
      openerRef.current?.focus({ preventScroll: true });
      closeTimerRef.current = null;
    }, enlargeTransitionMs);
  }, [activeIndex, enlargeTransitionMs]);

  const openViewer = useCallback(
    (index: number, element: HTMLButtonElement) => {
      if (performance.now() < suppressClickUntilRef.current) return;
      stopInertia();
      openerRef.current = element;
      originRectRef.current = element.getBoundingClientRect();
      setViewerReady(false);
      setActiveIndex(index);
    },
    [stopInertia],
  );

  useLayoutEffect(() => {
    if (activeIndex === null) return;
    document.body.classList.add("project-gallery-scroll-lock");
    const panel = viewerPanelRef.current;
    const origin = originRectRef.current;
    if (panel && origin) {
      const target = panel.getBoundingClientRect();
      const originCenterX = origin.left + origin.width / 2;
      const originCenterY = origin.top + origin.height / 2;
      const targetCenterX = target.left + target.width / 2;
      const targetCenterY = target.top + target.height / 2;
      setOriginTransform(
        `translate3d(${originCenterX - targetCenterX}px, ${originCenterY - targetCenterY}px, 0) scale(${Math.max(0.06, origin.width / target.width)}, ${Math.max(0.06, origin.height / target.height)})`,
      );
    }

    const firstFrame = window.requestAnimationFrame(() => {
      const secondFrame = window.requestAnimationFrame(() => {
        setViewerReady(true);
        closeButtonRef.current?.focus({ preventScroll: true });
        openFrameRef.current = null;
      });
      openFrameRef.current = secondFrame;
    });
    openFrameRef.current = firstFrame;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeViewer();
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      if (openFrameRef.current !== null) {
        window.cancelAnimationFrame(openFrameRef.current);
        openFrameRef.current = null;
      }
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [activeIndex, closeViewer]);

  useEffect(
    () => () => {
      stopInertia();
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
      if (openFrameRef.current !== null) window.cancelAnimationFrame(openFrameRef.current);
      document.body.classList.remove("project-gallery-scroll-lock");
    },
    [stopInertia],
  );

  const rootStyle = {
    "--dome-segments-x": segments,
    "--dome-segments-y": segments,
    "--dome-overlay-color": overlayBlurColor,
    "--dome-tile-radius": imageBorderRadius,
    "--dome-open-radius": openedImageBorderRadius,
    "--dome-image-filter": grayscale ? "grayscale(1)" : "none",
  } as CSSProperties;

  const activeImage = activeIndex === null ? null : normalizedImages[activeIndex];
  const viewer = activeImage
    ? createPortal(
        <div className={`project-dome-viewer${viewerReady ? " is-open" : ""}`} role="dialog" aria-modal="true" aria-labelledby="project-dome-viewer-caption">
          <button className="project-dome-viewer__backdrop" type="button" aria-label="关闭图片预览" onClick={closeViewer} />
          <div
            ref={viewerPanelRef}
            className={`project-dome-viewer__panel${activeImage.type === "poster" ? " is-poster" : ""}`}
            style={{
              "--viewer-width": activeImage.type === "poster" ? "min(82vw, 1180px)" : openedImageWidth,
              "--viewer-height": activeImage.type === "poster" ? "min(88vh, 1100px)" : openedImageHeight,
              "--viewer-transition": `${enlargeTransitionMs}ms`,
              "--viewer-origin": originTransform,
              "--viewer-image-background": activeImage.background ?? "#EEE8DE",
            } as CSSProperties}
          >
            <button ref={closeButtonRef} className="project-dome-viewer__close" type="button" onClick={closeViewer} aria-label="关闭图片预览">CLOSE ×</button>
            <figure>
              <div className="project-dome-viewer__image-wrap">
                <img
                  src={activeImage.src}
                  alt={activeImage.alt}
                  width={activeImage.width}
                  height={activeImage.height}
                  decoding="async"
                />
              </div>
              <figcaption id="project-dome-viewer-caption">
                <span>{String(activeIndex! + 1).padStart(2, "0")} / {String(normalizedImages.length).padStart(2, "0")}</span>
                <p>{activeImage.caption}</p>
                {activeImage.sourceUrl ? (
                  <a href={activeImage.sourceUrl} target="_blank" rel="noreferrer">{activeImage.sourceName} ↗</a>
                ) : (
                  <em>{activeImage.sourceName}</em>
                )}
              </figcaption>
            </figure>
          </div>
        </div>,
        document.body,
      )
    : null;

  if (simpleMode) {
    return (
      <div ref={rootRef} className="project-dome-gallery project-dome-gallery--simple" style={rootStyle}>
        <div className="project-dome-gallery__simple-list" aria-label="项目视觉证据画廊">
          {normalizedImages.map((image, index) => (
            <figure className={`project-dome-gallery__simple-card is-${image.type}`} key={image.id}>
              <button type="button" onClick={(event) => openViewer(index, event.currentTarget)} aria-label={`放大查看：${image.alt}`}>
                <img
                  src={image.thumbnailSrc ?? image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  loading="lazy"
                  decoding="async"
                  style={{ objectFit: image.fit, background: image.background ?? "#EEE8DE" }}
                />
              </button>
              <figcaption><span>{String(index + 1).padStart(2, "0")}</span>{image.caption}</figcaption>
            </figure>
          ))}
        </div>
        {viewer}
      </div>
    );
  }

  return (
    <div ref={rootRef} className="project-dome-gallery" style={rootStyle}>
      <div ref={mainRef} className="project-dome-gallery__main">
        <div className="project-dome-gallery__stage">
          <div ref={sphereRef} className="project-dome-gallery__sphere">
            {domeItems.map((item) => {
              const index = normalizedImages.findIndex((image) => image.id === item.id);
              return (
                <div
                  className="project-dome-gallery__item"
                  key={item.id}
                  style={{
                    "--offset-x": item.x,
                    "--offset-y": item.y,
                    "--item-size-x": item.sizeX,
                    "--item-size-y": item.sizeY,
                    "--gallery-image-background": item.background ?? "#EEE8DE",
                  } as CSSProperties}
                >
                  <button className="project-dome-gallery__tile" type="button" onClick={(event) => openViewer(index, event.currentTarget)} aria-label={`放大查看：${item.alt}`}>
                    <img
                      src={item.thumbnailSrc ?? item.src}
                      alt={item.alt}
                      width={item.width}
                      height={item.height}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      style={{ "--gallery-image-fit": item.fit } as CSSProperties}
                    />
                    <span className="project-dome-gallery__tile-meta"><b>{item.type.replace("-", " ")}</b><em>{String(index + 1).padStart(2, "0")}</em></span>
                  </button>
                </div>
              );
            })}
            {AMBIENT_COORDS.map((item, index) => (
              <div
                className="project-dome-gallery__item project-dome-gallery__item--ambient"
                aria-hidden="true"
                key={`ambient-${index}`}
                style={{
                  "--offset-x": item.x,
                  "--offset-y": item.y,
                  "--item-size-x": item.sizeX,
                  "--item-size-y": item.sizeY,
                } as CSSProperties}
              ><span /></div>
            ))}
          </div>
        </div>
        <div className="project-dome-gallery__overlay" aria-hidden="true" />
        <div className="project-dome-gallery__edge project-dome-gallery__edge--top" aria-hidden="true" />
        <div className="project-dome-gallery__edge project-dome-gallery__edge--bottom" aria-hidden="true" />
        <p className="project-dome-gallery__hint">DRAG TO EXPLORE · SELECT TO ENLARGE</p>
      </div>
      {viewer}
    </div>
  );
}
