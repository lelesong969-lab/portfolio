import { useLayoutEffect, useRef, type CSSProperties, type MouseEvent } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Project } from "../data/portfolio";
import { projectRouteClass, projectTheme } from "../data/projectTheme";
import ProjectDomeGallery from "./ProjectDomeGallery/ProjectDomeGallery";
import "./ProjectCaseStudy.css";

type ProjectCaseStudyProps = {
  project: Project;
  nextProject?: Project;
  onClose: () => void;
  onOpenProject: (project: Project) => void;
};

const accentByTone = {
  wood: "#B48363",
  gray: "#A99B8E",
  mangosteen: "#B67883",
  sky: "#86A8C0",
  ink: "#A7A59D",
  gold: "#C79D55",
} as const;

gsap.registerPlugin(ScrollTrigger);

function handleBack(event: MouseEvent<HTMLAnchorElement>, onClose: () => void) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  onClose();
}

export default function ProjectCaseStudy({ project, nextProject, onClose, onOpenProject }: ProjectCaseStudyProps) {
  const pageRef = useRef<HTMLElement>(null);
  const projectStyle = {
    "--detail-accent": accentByTone[project.heroTone],
    "--project-entry": projectTheme.entryBackground,
    "--project-body": projectTheme.bodyBackground,
    "--project-gallery": projectTheme.galleryBackground,
    "--project-light": projectTheme.lightText,
  } as CSSProperties;

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    document.documentElement.classList.add(projectRouteClass);
    document.body.classList.add(projectRouteClass);
    const page = pageRef.current;
    if (!page) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !document.body.classList.contains("project-gallery-scroll-lock")) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    if (reducedMotion) {
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.documentElement.classList.remove(projectRouteClass);
        document.body.classList.remove(projectRouteClass);
      };
    }

    const context = gsap.context(() => {
      const heroTimeline = gsap.timeline({ defaults: { ease: "power4.out" } });
      heroTimeline
        .fromTo(".project-case-study__hero-word", { xPercent: -18, scaleX: 1.24, autoAlpha: 0, clipPath: "inset(0 0 100% 0)" }, { xPercent: 0, scaleX: 1, autoAlpha: 1, clipPath: "inset(0 0 0% 0)", duration: 1.05, ease: "expo.out" })
        .fromTo(".project-case-study__title-block > *", { y: 36, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .62, stagger: .065 }, .12)
        .fromTo(".project-case-study__hero-visual", { y: 70, clipPath: "inset(0 0 100% 0)" }, { y: 0, clipPath: "inset(0 0 0% 0)", duration: 1.05, ease: "expo.inOut" }, .18)
        .fromTo(".project-case-study__hero-visual img", { scale: 1.13, yPercent: 6 }, { scale: 1, yPercent: 0, duration: 1.2, ease: "power3.out" }, .23)
        .fromTo(".project-case-study__project-metrics article", { y: 26, scaleY: .8, autoAlpha: 0 }, { y: 0, scaleY: 1, autoAlpha: 1, duration: .56, stagger: .07 }, .48)
        .fromTo(".project-case-study__external-card", { y: 38, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .64, stagger: .1 }, .58)
        .fromTo(".project-case-study__analysis-panel", { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .62, stagger: .08 }, .68);

      gsap.timeline({
        defaults: { ease: "power4.out" },
        scrollTrigger: { trigger: ".project-case-study__gallery-chapter", start: "top 76%", once: true },
      })
        .fromTo(".project-case-study__gallery-heading > *", { y: 45, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .68, stagger: .09 })
        .fromTo(".project-case-study__dome-wrap", { y: 64, scale: .97, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: .92, ease: "expo.out" }, .2);

      gsap.timeline({
        defaults: { ease: "power4.out" },
        scrollTrigger: { trigger: ".project-case-study__outcome", start: "top 74%", once: true },
      })
        .fromTo(".project-case-study__outcome-copy > *", { y: 38, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .62, stagger: .07 })
        .fromTo(".project-case-study__final-visual", { y: 64, clipPath: "inset(0 0 100% 0)", autoAlpha: 0 }, { y: 0, clipPath: "inset(0 0 0% 0)", autoAlpha: 1, duration: 1, ease: "expo.inOut" }, .16)
        .fromTo(".project-case-study__final-visual img", { scale: 1.1 }, { scale: 1, duration: 1.15, ease: "power3.out" }, .22)
        .fromTo(".project-case-study__next", { y: 48, autoAlpha: 0, clipPath: "inset(100% 0 0 0)" }, { y: 0, autoAlpha: 1, clipPath: "inset(0 0 0 0)", duration: .8 }, .6);
    }, page);

    const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      window.cancelAnimationFrame(refreshFrame);
      context.revert();
      window.removeEventListener("keydown", handleKeyDown);
      document.documentElement.classList.remove(projectRouteClass);
      document.body.classList.remove(projectRouteClass);
    };
  }, [onClose, project.slug]);

  const openNext = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!nextProject || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    document.documentElement.style.backgroundColor = projectTheme.entryBackground;
    document.body.style.backgroundColor = projectTheme.entryBackground;
    onOpenProject(nextProject);
  };

  return (
    <main
      ref={pageRef}
      className={`project-case-study project-case-study--${project.slug}`}
      style={projectStyle}
      id="main-content"
      aria-labelledby="project-case-title"
    >
      <a className="project-case-study__back" href="/#work" onClick={(event) => handleBack(event, onClose)}>← BACK TO MY PROJECTS</a>

      <section className="project-case-study__chapter project-case-study__overview">
        <p className="project-case-study__hero-word" aria-hidden="true">{project.heroWord}</p>
        <div className="project-case-study__shell">
          <div className="project-case-study__hero-grid">
            <div className="project-case-study__title-block">
              <p className="project-case-study__eyebrow">{project.index} / 05 · {project.categoryEn}</p>
              <h1 id="project-case-title">{project.titleZh}</h1>
              <p className="project-case-study__english">{project.titleEn}</p>
              <p className="project-case-study__summary">{project.description}</p>
              <dl className="project-case-study__meta">
                <div><dt>ROLE</dt><dd>{project.role}</dd></div>
                <div><dt>PERIOD</dt><dd>{project.year}</dd></div>
                <div><dt>FOCUS</dt><dd>{project.categoryDetail}</dd></div>
              </dl>
            </div>

            <figure className="project-case-study__hero-visual">
              <img src={project.coverImage} alt={project.alt} fetchPriority="high" width="1600" height="1100" />
            </figure>
          </div>

          <div className={`project-case-study__project-metrics project-case-study__project-metrics--${project.metrics.length}`} aria-label="项目已完成成果">
            {project.metrics.map((metric) => (
              <article key={metric.label}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </article>
            ))}
          </div>

          <div className="project-case-study__context-intro">
            <p className="project-case-study__eyebrow">EXTERNAL CONTEXT → BUSINESS MEANING</p>
            <h2>{project.thesis}</h2>
          </div>

          <div className="project-case-study__external-grid">
            {project.externalMetrics.map((metric) => (
              <a className="project-case-study__external-card" href={metric.sourceUrl} target="_blank" rel="noreferrer" key={`${metric.value}-${metric.label}`}>
                <header><strong>{metric.value}</strong><span>{metric.year}</span></header>
                <h3>{metric.label}</h3>
                <p>{metric.businessMeaning}</p>
                <footer>{metric.sourceName} ↗</footer>
              </a>
            ))}
          </div>

          <div className="project-case-study__analysis-grid">
            <article className="project-case-study__analysis-panel">
              <p className="project-case-study__eyebrow">SIGNAL → ANALYSIS → INSIGHT</p>
              <h2>{project.analysisConclusion}</h2>
              <ol>
                {project.methods.map((method, index) => <li key={method}><span>0{index + 1}</span>{method}</li>)}
              </ol>
            </article>

            <article className="project-case-study__analysis-panel project-case-study__analysis-panel--map">
              <p className="project-case-study__eyebrow">{project.stakeholderValues ? "STAKEHOLDER VALUE" : "PRIORITIZED INSIGHTS"}</p>
              <div className="project-case-study__value-map">
                {(project.stakeholderValues ?? project.findings.map((finding, index) => ({ stakeholder: `INSIGHT 0${index + 1}`, value: finding }))).map((item) => (
                  <div key={item.stakeholder}><strong>{item.stakeholder}</strong><p>{item.value}</p></div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      <div className="project-theme-bridge" aria-hidden="true" />

      <section className="project-case-study__chapter project-case-study__gallery-chapter" aria-labelledby="visual-evidence-title">
        <div className="project-case-study__shell project-case-study__gallery-heading">
          <p className="project-case-study__eyebrow">02 / INTERACTIVE VISUAL EVIDENCE</p>
          <h2 id="visual-evidence-title">完整图表、过程与设计证据，在空间中展开。</h2>
          <p>拖动探索，点击查看原图。图表、海报、界面和技术图均保持完整比例。</p>
        </div>
        <div className="project-case-study__dome-wrap">
          <ProjectDomeGallery
            images={project.gallery}
            fit={0.62}
            fitBasis="auto"
            minRadius={720}
            maxRadius={1500}
            padFactor={0.08}
            overlayBlurColor={projectTheme.galleryBackground}
            maxVerticalRotationDeg={6}
            dragSensitivity={28}
            enlargeTransitionMs={480}
            segments={32}
            dragDampening={0.72}
            openedImageWidth="min(88vw, 1360px)"
            openedImageHeight="min(82vh, 900px)"
            imageBorderRadius="14px"
            openedImageBorderRadius="18px"
            grayscale={false}
          />
        </div>
      </section>

      <section className="project-case-study__chapter project-case-study__outcome">
        <p className="project-case-study__outcome-word" aria-hidden="true">FINAL SOLUTION</p>
        <div className="project-case-study__shell project-case-study__outcome-grid">
          <div className="project-case-study__outcome-copy">
            <p className="project-case-study__eyebrow">03 / FINAL SOLUTION & DELIVERABLES</p>
            <h2>{project.finalTitle}</h2>
            <p>{project.finalSummary}</p>
            <ul className="project-case-study__decision-list">
              {project.decisions.map((decision, index) => <li key={decision}><span>0{index + 1}</span>{decision}</li>)}
            </ul>
            {project.outcomeMetrics && (
              <div className="project-case-study__outcome-metrics" aria-label="项目最终量化成果">
                {project.outcomeMetrics.map((metric) => <p key={metric.label}><strong>{metric.value}</strong><span>{metric.label}</span></p>)}
              </div>
            )}
            <div className="project-case-study__deliverables">
              <span>DELIVERABLES</span>
              {project.deliverables.map((item) => <b key={item}>{item}</b>)}
            </div>
          </div>

          <figure className="project-case-study__final-visual">
            <img src={project.finalImage} alt={project.finalAlt} loading="lazy" width="1600" height="1100" />
            <figcaption>{project.finalAlt}</figcaption>
          </figure>
        </div>

        {nextProject ? (
          <a className="project-case-study__next" href={nextProject.href} onClick={openNext}>
            <span>NEXT PROJECT · {nextProject.index} / 05</span>
            <strong>{nextProject.titleZh}</strong>
            <em>{nextProject.titleEn} →</em>
          </a>
        ) : (
          <a className="project-case-study__next" href="/#work" onClick={(event) => handleBack(event, onClose)}>
            <span>ALL PROJECTS</span>
            <strong>返回项目列表</strong>
            <em>Back to My Projects →</em>
          </a>
        )}
      </section>
    </main>
  );
}
