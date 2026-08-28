import { useLayoutEffect, useRef, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Project } from "../data/portfolio";
import type { Language } from "../language";
import AccordionGallery from "./AccordionGallery.jsx";
import BreathingWave from "./BreathingWave";

type ProjectGallerySectionProps = {
  projects: Project[];
  onOpenProject: (project: Project) => void;
  language: Language;
};

gsap.registerPlugin(ScrollTrigger);

export default function ProjectGallerySection({ projects, onOpenProject, language }: ProjectGallerySectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const pointerActivationRef = useRef<{ index: number; wasActive: boolean } | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const title = section.querySelector<HTMLElement>("#projects-title");
    const count = section.querySelector<HTMLElement>(".project-gallery-section__header p");
    const items = section.querySelectorAll<HTMLElement>(".ag-panel");
    const images = section.querySelectorAll<HTMLElement>(".ag-panel__media img");
    if (!title || !count || !items.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set([title, count, ...items, ...images], { clearProps: "all" });
      return () => undefined;
    }

    const context = gsap.context(() => {
      gsap.set(title, { yPercent: 116, scaleX: 1.22, scaleY: .68, autoAlpha: 0, clipPath: "inset(0 0 100% 0)" });
      gsap.set(count, { y: 20, autoAlpha: 0 });
      gsap.set(items, { y: 74, scaleY: .78, autoAlpha: 0, clipPath: "inset(100% 0 0 0)" });
      gsap.set(images, { scale: 1.18, xPercent: 6, yPercent: 4 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 74%",
          once: true,
          invalidateOnRefresh: true,
        },
      });

      timeline
        .to(title, { yPercent: 0, scaleX: 1, scaleY: 1, autoAlpha: 1, clipPath: "inset(0 0 0% 0)", duration: 1.18, ease: "expo.out" })
        .to(count, { y: 0, autoAlpha: 1, duration: .5, ease: "power3.out" }, .26)
        .to(items, { y: 0, scaleY: 1, autoAlpha: 1, clipPath: "inset(0 0 0% 0)", duration: .9, stagger: .12, ease: "power4.out" }, .34)
        .to(images, { scale: 1, xPercent: 0, yPercent: 0, duration: 1.25, stagger: .08, ease: "power3.out" }, .5);
    }, section);

    const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      window.cancelAnimationFrame(refreshFrame);
      context.revert();
    };
  }, []);

  const galleryItems = projects.map((project) => ({
    image: project.coverImage,
    label: language === "en" ? project.titleEn : project.titleZh,
    alt: language === "en" ? project.detailEn.alt : project.alt,
    link: project.href,
    itemId: project.slug,
  }));

  const getPanelIndex = (target: EventTarget | null, gallery: HTMLElement) => {
    const panel = target instanceof Element ? target.closest<HTMLElement>(".ag-panel") : null;
    if (!panel || !gallery.contains(panel)) return { index: -1, panel: null };
    return { index: Array.from(gallery.querySelectorAll<HTMLElement>(".ag-panel")).indexOf(panel), panel };
  };

  const handlePointerDownCapture = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      pointerActivationRef.current = null;
      return;
    }
    const { index, panel } = getPanelIndex(event.target, event.currentTarget);
    pointerActivationRef.current = panel ? { index, wasActive: panel.classList.contains("ag-panel--active") } : null;
  };

  const handleGalleryClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    const { index, panel } = getPanelIndex(event.target, event.currentTarget);
    if (!panel || index < 0 || !projects[index]) return;

    const isModifiedClick = event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    if (isModifiedClick) {
      pointerActivationRef.current = null;
      event.stopPropagation();
      return;
    }

    const pointerActivation = pointerActivationRef.current;
    const wasActive = pointerActivation?.index === index
      ? pointerActivation.wasActive
      : panel.classList.contains("ag-panel--active");
    pointerActivationRef.current = null;
    event.preventDefault();

    if (wasActive) onOpenProject(projects[index]);
  };

  return (
    <section id="work" ref={sectionRef} className="project-gallery-section" aria-labelledby="projects-title">
      <BreathingWave className="project-gallery-section__entry-wave" />
      <div className="project-gallery-section__inner">
        <header className="project-gallery-section__header">
          <h2 id="projects-title">{language === "en" ? "MY PROJECTS" : "项目一览"}</h2>
          <p>{language === "en" ? "05 PROJECTS" : "05 个项目"}</p>
        </header>
        <div
          className="project-gallery-section__accordion"
          onPointerDownCapture={handlePointerDownCapture}
          onClickCapture={handleGalleryClickCapture}
        >
          <AccordionGallery
            items={galleryItems}
            ariaLabel={language === "en" ? "Portfolio project gallery" : "作品集项目画廊"}
            defaultIndex={2}
            accentColor="#8fc79d"
            overlayColor="#11110f"
            textColor="#f1ede5"
            height={520}
            gap={10}
            radius={18}
            expandRatio={0.52}
            duration={0.6}
            ease="power3.out"
            parallax={0.5}
            tilt={6}
            stagger={0.06}
            trigger="hover"
            grayscale
            showLabels
          />
        </div>
      </div>
      <div className="project-gallery-section__boundary" aria-hidden="true">
        <BreathingWave className="project-gallery-section__exit-wave" />
      </div>
    </section>
  );
}
