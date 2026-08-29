import {
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Project } from "../data/portfolio";
import type { Language } from "../language";
import { projectRouteClass, projectTheme } from "../data/projectTheme";
import "./ProjectCaseNavigator.css";

type ProjectCaseNavigatorProps = {
  projects: Project[];
  currentProject: Project;
  nextProject: Project;
  language: Language;
  onOpenProject: (project: Project) => void;
};

type RouteTransition = {
  project: Project;
  top: number;
  height: number;
};

const MARQUEE_SECONDS = 19;

gsap.registerPlugin(ScrollTrigger);

function isModifiedClick(event: MouseEvent<HTMLAnchorElement>) {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

function projectImage(project: Project) {
  return project.previewImage ?? project.coverImage;
}

async function decodeProjectCover(project: Project) {
  const image = new Image();
  image.src = project.coverImage;
  try {
    await image.decode?.();
  } catch {
    // Navigation remains available when a browser cannot decode ahead of time.
  }
}

function NavigatorRow({
  project,
  language,
  next,
  opening,
  onNavigate,
}: {
  project: Project;
  language: Language;
  next: boolean;
  opening: boolean;
  onNavigate: (project: Project, origin: HTMLElement) => void;
}) {
  const rowRef = useRef<HTMLLIElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const revealTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const marqueeLoopRef = useRef<gsap.core.Tween | null>(null);
  const hoveredRef = useRef(false);

  useLayoutEffect(() => {
    const row = rowRef.current;
    const overlay = overlayRef.current;
    const counter = counterRef.current;
    const track = trackRef.current;
    if (!row || !overlay || !counter || !track) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const precisePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let firstFrame = 0;
    let secondFrame = 0;

    gsap.set(overlay, { yPercent: 101, autoAlpha: 1, visibility: "hidden" });
    gsap.set(counter, { yPercent: -101 });
    gsap.set(track, { x: 0, force3D: true });

    const createLoop = () => {
      const segment = track.querySelector<HTMLElement>(".project-navigator-row__marquee-segment");
      if (!segment) return;
      const segmentWidth = segment.getBoundingClientRect().width;
      if (segmentWidth <= 0) return;

      marqueeLoopRef.current?.kill();
      gsap.killTweensOf(track);
      gsap.set(track, { x: 0, force3D: true });
      if (!precisePointer || reducedMotion) return;

      marqueeLoopRef.current = gsap.to(track, {
        x: -segmentWidth,
        duration: MARQUEE_SECONDS,
        ease: "none",
        repeat: -1,
        paused: true,
        force3D: true,
      });
    };

    createLoop();
    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(createLoop);
    });
    const resizeObserver = new ResizeObserver(createLoop);
    resizeObserver.observe(row);

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      resizeObserver.disconnect();
      revealTimelineRef.current?.kill();
      marqueeLoopRef.current?.kill();
      gsap.killTweensOf([overlay, counter, track]);
    };
  }, [language, project.slug]);

  const closestEdge = (event: PointerEvent<HTMLLIElement>) => {
    const rect = rowRef.current?.getBoundingClientRect();
    if (!rect) return "bottom" as const;
    return event.clientY - rect.top < rect.height / 2 ? "top" as const : "bottom" as const;
  };

  const revealFrom = (direction: "top" | "bottom") => {
    const overlay = overlayRef.current;
    const counter = counterRef.current;
    if (!overlay || !counter) return;
    const precisePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!precisePointer && !reducedMotion) return;

    hoveredRef.current = true;
    revealTimelineRef.current?.kill();
    gsap.killTweensOf([overlay, counter]);

    if (reducedMotion) {
      gsap.set([overlay, counter], { yPercent: 0 });
      gsap.set(overlay, { autoAlpha: 0, visibility: "visible" });
      revealTimelineRef.current = gsap.timeline().to(overlay, { autoAlpha: 1, duration: .18, ease: "power1.out" });
      return;
    }

    gsap.set(overlay, { yPercent: direction === "top" ? -101 : 101, autoAlpha: 1, visibility: "visible" });
    gsap.set(counter, { yPercent: direction === "top" ? 101 : -101 });
    marqueeLoopRef.current?.play();
    revealTimelineRef.current = gsap.timeline({ defaults: { duration: .6, ease: "expo.out", overwrite: "auto" } })
      .to(overlay, { yPercent: 0 }, 0)
      .to(counter, { yPercent: 0 }, 0);
  };

  const hideTo = (direction: "top" | "bottom") => {
    const overlay = overlayRef.current;
    const counter = counterRef.current;
    if (!overlay || !counter) return;
    const precisePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!precisePointer && !reducedMotion) return;

    hoveredRef.current = false;
    revealTimelineRef.current?.kill();
    gsap.killTweensOf([overlay, counter]);
    revealTimelineRef.current = gsap.timeline({
      defaults: { duration: reducedMotion ? .16 : .48, ease: reducedMotion ? "power1.out" : "expo.inOut", overwrite: "auto" },
      onComplete: () => {
        if (hoveredRef.current) return;
        gsap.set(overlay, { visibility: "hidden" });
        marqueeLoopRef.current?.pause(0);
      },
    })
      .to(overlay, { yPercent: reducedMotion ? 0 : direction === "top" ? -101 : 101, autoAlpha: reducedMotion ? 0 : 1 }, 0)
      .to(counter, { yPercent: reducedMotion ? 0 : direction === "top" ? 101 : -101 }, 0);
  };

  const title = language === "en" ? project.titleEn : project.titleZh;
  const category = language === "en" ? project.categoryEn : project.categoryZh;
  const marqueeSegments = Array.from({ length: 4 }, (_, index) => `${project.slug}-${index}`);

  return (
    <li
      ref={rowRef}
      className="project-navigator-row"
      data-next={next}
      data-opening={opening}
      onPointerEnter={(event) => revealFrom(closestEdge(event))}
      onPointerLeave={(event) => hideTo(closestEdge(event))}
    >
      <button
        className="project-navigator-row__button"
        type="button"
        aria-label={language === "en" ? `Open project ${project.index}: ${project.titleEn}` : `打开项目 ${project.index}：${project.titleZh}`}
        onFocus={() => revealFrom("bottom")}
        onBlur={() => hideTo("bottom")}
        onClick={(event) => onNavigate(project, event.currentTarget)}
      >
        <span className="project-navigator-row__number" aria-hidden="true">{project.index}</span>
        <span className="project-navigator-row__titles">
          <strong>{title}</strong>
          {language === "zh" && <small>{project.titleEn}</small>}
        </span>
        <span className="project-navigator-row__category">
          {category}
          {language === "zh" && <small>{project.categoryEn}</small>}
        </span>
        {next && (
          <span className="project-navigator-row__status">
            {language === "en" ? "NEXT" : "下一个"}
          </span>
        )}
        <span className="project-navigator-row__mobile-image" aria-hidden="true">
          <img src={projectImage(project)} alt="" loading="lazy" decoding="async" />
        </span>
      </button>

      <div ref={overlayRef} className="project-navigator-row__overlay" aria-hidden="true">
        <div ref={counterRef} className="project-navigator-row__counter-motion">
          <div className="project-navigator-row__marquee-viewport">
            <div ref={trackRef} className="project-navigator-row__marquee-track">
              {marqueeSegments.map((key) => (
                <div className="project-navigator-row__marquee-segment" key={key}>
                  <span className="project-navigator-row__marquee-number">{project.index}</span>
                  <span className="project-navigator-row__marquee-title">{title}</span>
                  <span className="project-navigator-row__marquee-image"><img src={projectImage(project)} alt="" loading="lazy" decoding="async" /></span>
                  <span className="project-navigator-row__marquee-category">{category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

export default function ProjectCaseNavigator({
  projects,
  currentProject,
  nextProject,
  language,
  onOpenProject,
}: ProjectCaseNavigatorProps) {
  const rootRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const routeTransitionRef = useRef<HTMLDivElement>(null);
  const openingSlugRef = useRef<string | null>(null);
  const [openingSlug, setOpeningSlug] = useState<string | null>(null);
  const [routeTransition, setRouteTransition] = useState<RouteTransition | null>(null);
  const total = String(projects.length).padStart(2, "0");
  const availableProjects = projects.filter((project) => project.slug !== currentProject.slug);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const context = gsap.context(() => {
      gsap.timeline({
        defaults: { ease: "power4.out" },
        scrollTrigger: { trigger: root, start: "top 78%", once: true },
      })
        .fromTo(".project-case-navigator__giant-number", {
          y: 62,
          scaleY: .82,
          autoAlpha: 0,
        }, {
          y: 0,
          scaleY: 1,
          autoAlpha: .66,
          duration: .92,
          ease: "expo.out",
        })
        .fromTo(".project-case-navigator__copy > *:not(.project-case-navigator__giant-number)", {
          y: 34,
          autoAlpha: 0,
        }, {
          y: 0,
          autoAlpha: 1,
          duration: .64,
          stagger: .065,
        }, .14)
        .fromTo(".project-case-navigator__cover", {
          clipPath: "inset(0 0 100% 0)",
        }, {
          clipPath: "inset(0 0 0% 0)",
          duration: .96,
          ease: "expo.inOut",
        }, .28)
        .fromTo(".project-case-navigator__cover img", { scale: 1.06 }, { scale: 1, duration: 1.04, ease: "power3.out" }, .3)
        .fromTo(".project-case-navigator__browse", { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .54 }, .58);
    }, root);

    return () => context.revert();
  }, [currentProject.slug, nextProject.slug]);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const root = rootRef.current;
    if (!panel || !root) return;
    const rows = Array.from(panel.querySelectorAll<HTMLElement>(".project-navigator-row"));
    const numbers = Array.from(panel.querySelectorAll<HTMLElement>(".project-navigator-row__number"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    gsap.killTweensOf([panel, ...rows, ...numbers]);
    gsap.set(panel, { height: "auto", autoAlpha: 1, visibility: "visible" });

    if (reducedMotion) {
      gsap.set([...rows, ...numbers], { y: 0, scaleY: 1, autoAlpha: 1 });
      return;
    }

    const context = gsap.context(() => {
      gsap.timeline({
        defaults: { ease: "power4.out" },
        scrollTrigger: { trigger: ".project-case-navigator__browse", start: "top 90%", once: true },
      })
        .fromTo(rows, {
          y: 38,
          scaleY: .9,
          autoAlpha: 0,
          transformOrigin: "top center",
        }, {
          y: 0,
          scaleY: 1,
          autoAlpha: 1,
          duration: .62,
          stagger: .055,
        })
        .fromTo(numbers, { y: 24 }, { y: 0, duration: .54, stagger: .045 }, .04);
    }, root);

    return () => {
      context.revert();
    };
  }, [currentProject.slug]);

  useLayoutEffect(() => {
    const transition = routeTransitionRef.current;
    if (!transition || !routeTransition) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      onOpenProject(routeTransition.project);
      setRouteTransition(null);
      openingSlugRef.current = null;
      setOpeningSlug(null);
      return;
    }

    const title = transition.querySelector<HTMLElement>(".project-case-navigator__route-title");
    const image = transition.querySelector<HTMLElement>(".project-case-navigator__route-image");
    gsap.set(transition, { top: routeTransition.top, height: routeTransition.height, autoAlpha: 1 });
    gsap.set(title, { y: 30, autoAlpha: 0 });
    gsap.set(image, { scale: 1.035, autoAlpha: 0 });

    const timeline = gsap.timeline({ defaults: { ease: "expo.inOut" } })
      .to(transition, { top: 0, height: window.innerHeight, duration: .72 }, 0)
      .to(title, { y: 0, autoAlpha: 1, duration: .5, ease: "expo.out" }, .14)
      .to(image, { scale: 1, autoAlpha: 1, duration: .52, ease: "expo.out" }, .18);
    const routeCall = gsap.delayedCall(.64, () => {
      onOpenProject(routeTransition.project);
      setRouteTransition(null);
      openingSlugRef.current = null;
      setOpeningSlug(null);
    });

    return () => {
      timeline.kill();
      routeCall.kill();
      gsap.killTweensOf([transition, title, image]);
    };
  }, [onOpenProject, routeTransition]);

  const navigate = async (project: Project, origin: HTMLElement) => {
    if (project.slug === currentProject.slug || openingSlugRef.current) return;
    openingSlugRef.current = project.slug;
    setOpeningSlug(project.slug);
    await decodeProjectCover(project);
    const rect = origin.getBoundingClientRect();
    document.documentElement.classList.add(projectRouteClass);
    document.body.classList.add(projectRouteClass);
    document.documentElement.style.backgroundColor = projectTheme.entryBackground;
    document.body.style.backgroundColor = projectTheme.entryBackground;
    setRouteTransition({ project, top: rect.top, height: rect.height });
  };

  const title = language === "en" ? nextProject.titleEn : nextProject.titleZh;
  const category = language === "en" ? nextProject.categoryEn : nextProject.categoryZh;
  const focus = language === "en" ? nextProject.detailEn.categoryDetail : nextProject.categoryDetail;

  return (
    <nav ref={rootRef} className="project-case-navigator" aria-label={language === "en" ? "Project navigation" : "项目导航"}>
      <a
        className="project-case-navigator__next"
        href={nextProject.href}
        aria-label={language === "en" ? `Open next project ${nextProject.index}: ${nextProject.titleEn}` : `打开下一个项目 ${nextProject.index}：${nextProject.titleZh}`}
        data-opening={openingSlug === nextProject.slug}
        onClick={(event) => {
          if (isModifiedClick(event)) return;
          event.preventDefault();
          void navigate(nextProject, event.currentTarget);
        }}
      >
        <div className="project-case-navigator__copy">
          <span className="project-case-navigator__giant-number" aria-hidden="true">{nextProject.index}</span>
          <p className="project-case-navigator__meta">
            {language === "en" ? "NEXT PROJECT" : "下一个项目"} · {nextProject.index} / {total}
          </p>
          <h2 className="project-case-navigator__title">
            <span>{title}</span>
            {language === "zh" && <small>{nextProject.titleEn}</small>}
          </h2>
          <p className="project-case-navigator__category">
            <span>{category}</span>
            {language === "zh" && <small>{nextProject.categoryEn}</small>}
          </p>
          <p className="project-case-navigator__focus">
            <span>{focus}</span>
            {language === "zh" && <small>{nextProject.detailEn.categoryDetail}</small>}
          </p>
          <span className="project-case-navigator__cta">
            {language === "en" ? "VIEW NEXT PROJECT" : "查看下一个项目"}
            <b aria-hidden="true">→</b>
          </span>
        </div>
        <figure className="project-case-navigator__cover" aria-hidden="true">
          <img src={projectImage(nextProject)} alt="" loading="lazy" decoding="async" />
        </figure>
      </a>

      <div className="project-case-navigator__browse">
        <span className="project-case-navigator__browse-lead">
          <span>{language === "en" ? "BROWSE ALL PROJECTS" : "浏览全部项目"}</span>
          <b aria-hidden="true">↓</b>
        </span>
        <span className="project-case-navigator__browse-count">{language === "en" ? `${total} PROJECTS` : `${projects.length} 个项目`}</span>
      </div>

      <div ref={panelRef} className="project-case-navigator__index" id="project-case-project-index">
        <ol className="project-case-navigator__list">
          {availableProjects.map((project) => (
            <NavigatorRow
              project={project}
              language={language}
              next={project.slug === nextProject.slug}
              opening={project.slug === openingSlug}
              onNavigate={(selected, origin) => void navigate(selected, origin)}
              key={project.slug}
            />
          ))}
        </ol>
      </div>

      {routeTransition && (
        <div ref={routeTransitionRef} className="project-case-navigator__route-transition" aria-hidden="true">
          <p>{routeTransition.project.index} / {total}</p>
          <h2 className="project-case-navigator__route-title">
            {language === "en" ? routeTransition.project.titleEn : routeTransition.project.titleZh}
          </h2>
          <div className="project-case-navigator__route-image">
            <img src={projectImage(routeTransition.project)} alt="" />
          </div>
        </div>
      )}
    </nav>
  );
}
