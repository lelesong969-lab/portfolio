import {
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { gsap } from "gsap";
import type { Project } from "../../data/portfolio";
import { projectRouteClass, projectTheme } from "../../data/projectTheme";
import "./FlowingMenu.css";

type FlowingMenuProps = {
  projects: Project[];
  onOpenProject: (project: Project) => void;
};

type RouteTransition = {
  project: Project;
  top: number;
  height: number;
};

const MARQUEE_SECONDS = 21;

function isModifiedClick(event: MouseEvent<HTMLAnchorElement>) {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

function FlowingMenuRow({
  project,
  active,
  opening,
  frozen,
  onActivate,
  onDeactivate,
  onNavigate,
}: {
  project: Project;
  active: boolean;
  opening: boolean;
  frozen: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  onNavigate: (project: Project, row: HTMLAnchorElement) => void;
}) {
  const itemRef = useRef<HTMLLIElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const marqueeOverlayRef = useRef<HTMLDivElement>(null);
  const marqueeTrackRef = useRef<HTMLDivElement>(null);
  const hoverTimelineRef = useRef<gsap.core.Tween | null>(null);
  const marqueeLoopRef = useRef<gsap.core.Tween | null>(null);
  const isHoveredRef = useRef(false);
  const [repetitions, setRepetitions] = useState(4);

  useLayoutEffect(() => {
    const overlay = marqueeOverlayRef.current;
    const track = marqueeTrackRef.current;
    if (!overlay || !track) return;

    gsap.set(overlay, { yPercent: 101, visibility: "hidden" });
    gsap.set(track, { x: 0, force3D: true });

    return () => {
      hoverTimelineRef.current?.kill();
      marqueeLoopRef.current?.kill();
      gsap.killTweensOf(overlay);
      gsap.killTweensOf(track);
    };
  }, []);

  useLayoutEffect(() => {
    const item = itemRef.current;
    const track = marqueeTrackRef.current;
    if (!item || !track) return;
    let cancelled = false;
    let firstFrame = 0;
    let secondFrame = 0;

    const calculateRepetitions = () => {
      const firstPart = track.querySelector<HTMLElement>(".flowing-menu__segment");
      if (!firstPart) return;
      const partWidth = firstPart.getBoundingClientRect().width;
      const viewportWidth = item.getBoundingClientRect().width || window.innerWidth;
      if (partWidth <= 0) return;
      const requiredCopies = Math.ceil((viewportWidth * 2.2) / partWidth) + 2;
      setRepetitions((current) => {
        const next = Math.max(4, requiredCopies);
        return current === next ? current : next;
      });
    };

    const initialize = async () => {
      if (document.fonts?.ready) await document.fonts.ready;
      if (cancelled) return;
      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(calculateRepetitions);
      });
    };

    void initialize();
    const resizeObserver = new ResizeObserver(calculateRepetitions);
    resizeObserver.observe(item);
    const firstPart = track.querySelector<HTMLElement>(".flowing-menu__segment");
    if (firstPart) resizeObserver.observe(firstPart);
    window.addEventListener("resize", calculateRepetitions, { passive: true });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", calculateRepetitions);
    };
  }, [project.coverImage, project.marqueeText]);

  useLayoutEffect(() => {
    const item = itemRef.current;
    const track = marqueeTrackRef.current;
    if (!item || !track) return;
    const precisePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let firstFrame = 0;
    let secondFrame = 0;

    const createLoop = () => {
      const firstPart = track.querySelector<HTMLElement>(".flowing-menu__segment");
      if (!firstPart) return;
      const partWidth = firstPart.getBoundingClientRect().width;
      if (partWidth <= 0) return;

      marqueeLoopRef.current?.kill();
      gsap.killTweensOf(track);
      gsap.set(track, { x: 0, force3D: true });
      item.dataset.loopDistance = partWidth.toFixed(2);

      if (!precisePointer || reducedMotion) return;
      marqueeLoopRef.current = gsap.to(track, {
        x: -partWidth,
        duration: MARQUEE_SECONDS,
        ease: "none",
        repeat: -1,
        paused: !isHoveredRef.current,
        force3D: true,
      });
    };

    createLoop();
    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(createLoop);
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      marqueeLoopRef.current?.kill();
      marqueeLoopRef.current = null;
      gsap.killTweensOf(track);
    };
  }, [repetitions, project.titleEn, project.coverImage]);

  const getClosestVerticalEdge = (event: PointerEvent<HTMLLIElement>) => {
    const rect = itemRef.current?.getBoundingClientRect();
    if (!rect) return "bottom" as const;
    return event.clientY - rect.top < rect.height / 2 ? "top" as const : "bottom" as const;
  };

  const stopHoverTimeline = () => {
    hoverTimelineRef.current?.kill();
    hoverTimelineRef.current = null;
    if (marqueeOverlayRef.current) gsap.killTweensOf(marqueeOverlayRef.current);
  };

  const openFromDirection = (direction: "top" | "bottom") => {
    if (frozen) return;
    const overlay = marqueeOverlayRef.current;
    if (!overlay) return;
    const precisePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!precisePointer && !reducedMotion) return;

    isHoveredRef.current = true;
    onActivate();
    stopHoverTimeline();
    itemRef.current?.setAttribute("data-preview", "entering");

    if (reducedMotion) {
      gsap.set(overlay, { yPercent: 0, autoAlpha: 0, visibility: "visible" });
      hoverTimelineRef.current = gsap.to(overlay, {
        autoAlpha: 1,
        duration: .18,
        ease: "power1.out",
        overwrite: "auto",
        onComplete: () => itemRef.current?.setAttribute("data-preview", "open"),
      });
      return;
    }

    gsap.set(overlay, {
      yPercent: direction === "top" ? -101 : 101,
      autoAlpha: 1,
      visibility: "visible",
    });
    marqueeLoopRef.current?.play();
    hoverTimelineRef.current = gsap.to(overlay, {
      yPercent: 0,
      duration: .64,
      ease: "expo.out",
      overwrite: "auto",
      onComplete: () => itemRef.current?.setAttribute("data-preview", "open"),
    });
  };

  const closeToDirection = (direction: "top" | "bottom") => {
    if (frozen) return;
    const overlay = marqueeOverlayRef.current;
    if (!overlay) return;
    const precisePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!precisePointer && !reducedMotion) return;

    isHoveredRef.current = false;
    onDeactivate();
    stopHoverTimeline();
    itemRef.current?.setAttribute("data-preview", "exiting");

    hoverTimelineRef.current = gsap.to(overlay, {
      yPercent: reducedMotion ? 0 : direction === "top" ? -101 : 101,
      autoAlpha: reducedMotion ? 0 : 1,
      duration: reducedMotion ? .16 : .54,
      ease: reducedMotion ? "power1.out" : "expo.inOut",
      overwrite: "auto",
      onComplete: () => {
        if (isHoveredRef.current) return;
        gsap.set(overlay, { visibility: "hidden" });
        itemRef.current?.setAttribute("data-preview", "closed");
      },
    });
  };

  const segmentKeys = Array.from({ length: repetitions }, (_, index) => `${project.slug}-${index}`);

  return (
    <li
      ref={itemRef}
      className="flowing-menu__item"
      data-project-index={project.index}
      data-active={active}
      data-opening={opening}
      data-preview="closed"
      onPointerEnter={(event) => openFromDirection(getClosestVerticalEdge(event))}
      onPointerLeave={(event) => closeToDirection(getClosestVerticalEdge(event))}
    >
      <a
        ref={linkRef}
        className="flowing-menu__link"
        href={project.href}
        onFocus={() => openFromDirection("bottom")}
        onBlur={() => closeToDirection("bottom")}
        onClick={(event) => {
          if (isModifiedClick(event)) return;
          event.preventDefault();
          if (!frozen) onNavigate(project, event.currentTarget);
        }}
        aria-label={`查看${project.titleZh}完整项目`}
      >
        <span className="flowing-menu__default">
          <span className="flowing-menu__number">{project.index}</span>
          <span className="flowing-menu__titles">
            <strong>{project.titleZh}</strong>
            <span>{project.titleEn}</span>
          </span>
          <span className="flowing-menu__mobile-image" aria-hidden="true">
            <img src={project.coverImage} alt="" loading="lazy" />
          </span>
        </span>
      </a>

      <div ref={marqueeOverlayRef} className="flowing-menu__overlay" aria-hidden="true">
        <div className="flowing-menu__marquee-viewport">
          <div ref={marqueeTrackRef} className="flowing-menu__marquee-track">
            {segmentKeys.map((key) => (
              <div className="flowing-menu__segment" key={key}>
                <span className="flowing-menu__marquee-copy">{project.marqueeText}</span>
                <span className="flowing-menu__marquee-image">
                  <img src={project.coverImage} alt="" loading="lazy" decoding="async" draggable={false} />
                </span>
                <span className="flowing-menu__marquee-label">{project.marqueeLabel}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </li>
  );
}

export default function FlowingMenu({ projects, onOpenProject }: FlowingMenuProps) {
  const transitionRef = useRef<HTMLDivElement>(null);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [routeTransition, setRouteTransition] = useState<RouteTransition | null>(null);

  useLayoutEffect(() => {
    const transition = transitionRef.current;
    if (!transition || !routeTransition) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      onOpenProject(routeTransition.project);
      return;
    }

    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const duration = mobile ? .42 : .74;
    const navigateAt = mobile ? .38 : .68;
    const title = transition.querySelector<HTMLElement>(".flowing-menu__route-title");
    const image = transition.querySelector<HTMLElement>(".flowing-menu__route-image");

    gsap.set(transition, {
      top: routeTransition.top,
      height: routeTransition.height,
      autoAlpha: 1,
    });
    gsap.set(title, { y: 28, autoAlpha: 0 });
    gsap.set(image, { scale: 1.035, autoAlpha: 0 });

    const timeline = gsap.timeline({ defaults: { ease: "expo.inOut" } });
    timeline
      .to(transition, { top: 0, height: window.innerHeight, duration }, 0)
      .to(title, { y: 0, autoAlpha: 1, duration: duration * .68, ease: "expo.out" }, duration * .16)
      .to(image, { scale: 1, autoAlpha: 1, duration: duration * .7, ease: "expo.out" }, duration * .22);
    const routeCall = gsap.delayedCall(navigateAt, () => onOpenProject(routeTransition.project));

    return () => {
      timeline.kill();
      routeCall.kill();
      gsap.killTweensOf([transition, title, image]);
    };
  }, [onOpenProject, routeTransition]);

  const navigate = (project: Project, row: HTMLAnchorElement) => {
    if (routeTransition) return;
    const rect = row.getBoundingClientRect();
    document.documentElement.classList.add(projectRouteClass);
    document.body.classList.add(projectRouteClass);
    document.documentElement.style.backgroundColor = projectTheme.entryBackground;
    document.body.style.backgroundColor = projectTheme.entryBackground;
    const hero = new Image();
    hero.src = project.coverImage;
    void hero.decode?.().catch(() => undefined);
    setActiveSlug(project.slug);
    setRouteTransition({ project, top: rect.top, height: rect.height });
  };

  return (
    <div className={`flowing-menu${routeTransition ? " flowing-menu--opening" : ""}`}>
      <ol className="flowing-menu__list">
        {projects.map((project) => (
          <FlowingMenuRow
            project={project}
            active={activeSlug === project.slug}
            opening={routeTransition?.project.slug === project.slug}
            frozen={routeTransition !== null}
            onActivate={() => setActiveSlug(project.slug)}
            onDeactivate={() => setActiveSlug((current) => current === project.slug ? null : current)}
            onNavigate={navigate}
            key={project.slug}
          />
        ))}
      </ol>

      {routeTransition && (
        <div ref={transitionRef} className="flowing-menu__route-transition" aria-hidden="true">
          <p className="flowing-menu__route-index">{routeTransition.project.index} / 05</p>
          <h2 className="flowing-menu__route-title">{routeTransition.project.titleEn}</h2>
          <div className="flowing-menu__route-image">
            <img src={routeTransition.project.coverImage} alt="" />
          </div>
        </div>
      )}
    </div>
  );
}
