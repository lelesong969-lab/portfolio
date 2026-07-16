import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Project } from "../data/portfolio";
import BreathingWave from "./BreathingWave";
import FlowingMenu from "./FlowingMenu/FlowingMenu";

type ProjectGallerySectionProps = {
  projects: Project[];
  onOpenProject: (project: Project) => void;
};

gsap.registerPlugin(ScrollTrigger);

export default function ProjectGallerySection({ projects, onOpenProject }: ProjectGallerySectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const title = section.querySelector<HTMLElement>("#projects-title");
    const count = section.querySelector<HTMLElement>(".project-gallery-section__header p");
    const items = section.querySelectorAll<HTMLElement>(".flowing-menu__item");
    const images = section.querySelectorAll<HTMLElement>(".flowing-menu__mobile-image img, .flowing-menu__marquee-image img");
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

  return (
    <section id="work" ref={sectionRef} className="project-gallery-section" aria-labelledby="projects-title">
      <BreathingWave className="project-gallery-section__entry-wave" />
      <div className="project-gallery-section__inner">
        <header className="project-gallery-section__header">
          <h2 id="projects-title">MY PROJECTS</h2>
          <p>05 PROJECTS</p>
        </header>
        <FlowingMenu projects={projects} onOpenProject={onOpenProject} />
      </div>
      <div className="project-gallery-section__boundary" aria-hidden="true">
        <BreathingWave className="project-gallery-section__exit-wave" />
      </div>
    </section>
  );
}
