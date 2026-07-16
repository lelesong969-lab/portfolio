import { lazy, Suspense, useCallback, useEffect, useRef, useState, type RefObject } from "react";
import AboutIntroSection from "./components/AboutIntroSection";
import CircularGallery from "./components/CircularGallery";
import ClosingStarTransition from "./components/ClosingStarTransition";
import FinalContentSection from "./components/FinalContentSection";
import OpeningAnimation from "./components/OpeningAnimation";
import PositioningMark from "./components/PositioningMark";
import ProjectGallerySection from "./components/ProjectGallerySection";
import StarRevealTransition from "./components/StarRevealTransition";
import ScrollFloat from "./components/ScrollFloat";
import { projects, type Project } from "./data/portfolio";
import { projectRouteClass, projectTheme } from "./data/projectTheme";

const ProjectCaseStudy = lazy(() => import("./components/ProjectCaseStudy"));

type OpenProject = (project: Project) => void;

const heroGalleryItems = projects.map((project) => ({
  image: project.coverImage,
  text: project.titleZh,
  previewLabel: project.previewLabel,
}));

const projectFromPath = (path: string) => {
  const match = path.match(/^\/projects\/([^/]+)\/?$/);
  return match ? projects.find((project) => project.slug === match[1]) ?? null : null;
};

function SiteHeader({ headerRef }: { headerRef: RefObject<HTMLElement | null> }) {
  return (
    <header ref={headerRef} className="site-header">
      <a className="brand-mark" href="#top" aria-label="Return to the page top">LS<span>.</span></a>
    </header>
  );
}

function PosterHero() {
  const headerRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const finalTitleRef = useRef<HTMLHeadingElement>(null);

  return (
    <>
      <SiteHeader headerRef={headerRef} />
      <section id="top" ref={heroRef} className="poster-hero" aria-labelledby="poster-title">
        <video className="poster-hero__video" autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
          <source src="/media/hero-background.mp4" type="video/mp4" />
        </video>
        <div className="poster-hero__video-wash" aria-hidden="true" />
        <img className="poster-hero__texture" src="/media/paper-grain.webp" alt="" aria-hidden="true" />
        <OpeningAnimation headerRef={headerRef} heroRef={heroRef} titleRef={finalTitleRef} />
        <div className="poster-hero__frame section-shell">
          <div className="poster-hero__space">
            <h1 ref={finalTitleRef} id="poster-title" className="poster-hero__nameplate poster-hero__nameplate--final">LEYANG</h1>
          </div>

          <div className="poster-hero__positioning" aria-label="求职方向：数据分析、产品与业务、商业分析">
            <PositioningMark />
          </div>

          <div className="poster-hero__gallery">
            <CircularGallery items={heroGalleryItems} />
          </div>

          <div className="poster-hero__footer">
            <p>INDUSTRIAL DESIGN BACKGROUND / EVIDENCE-LED DECISION SUPPORT</p>
          </div>
        </div>
      </section>
    </>
  );
}

function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(() => projectFromPath(window.location.pathname));
  const [closingPortal, setClosingPortal] = useState<HTMLElement | null>(null);
  const lastProjectIndex = useRef<string | null>(null);
  const captureClosingPortal = useCallback((node: HTMLElement | null) => setClosingPortal(node), []);

  useEffect(() => {
    document.documentElement.classList.remove("project-route-pending");
  }, []);

  const restoreGalleryPosition = useCallback(() => {
    window.requestAnimationFrame(() => {
      const gallery = document.getElementById("work");
      if (gallery) window.scrollTo({ top: gallery.offsetTop, behavior: "instant" as ScrollBehavior });
      const index = lastProjectIndex.current;
      if (!index) return;
      window.requestAnimationFrame(() => {
        document.querySelector<HTMLElement>(`[data-project-index="${index}"] .flowing-menu__link`)?.focus({ preventScroll: true });
        lastProjectIndex.current = null;
      });
    });
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const nextProject = projectFromPath(window.location.pathname);
      document.documentElement.classList.toggle(projectRouteClass, Boolean(nextProject));
      document.body.classList.toggle(projectRouteClass, Boolean(nextProject));
      if (nextProject) {
        document.documentElement.style.backgroundColor = projectTheme.entryBackground;
        document.body.style.backgroundColor = projectTheme.entryBackground;
      } else {
        document.documentElement.style.removeProperty("background-color");
        document.body.style.removeProperty("background-color");
      }
      setSelectedProject(nextProject);
      if (nextProject) window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }));
      else if (lastProjectIndex.current) {
        window.history.replaceState({}, "", "/#work");
        restoreGalleryPosition();
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [restoreGalleryPosition]);

  const openProject: OpenProject = useCallback((project) => {
    lastProjectIndex.current = project.index;
    document.documentElement.classList.add(projectRouteClass);
    document.body.classList.add(projectRouteClass);
    document.documentElement.style.backgroundColor = projectTheme.entryBackground;
    document.body.style.backgroundColor = projectTheme.entryBackground;
    const hero = new Image();
    hero.src = project.coverImage;
    void hero.decode?.().catch(() => undefined);
    window.history.pushState({ portfolioProject: true }, "", project.href);
    setSelectedProject(project);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }));
  }, []);

  const closeProject = useCallback(() => {
    window.history.replaceState({}, "", "/#work");
    document.documentElement.classList.remove(projectRouteClass);
    document.body.classList.remove(projectRouteClass);
    document.documentElement.style.removeProperty("background-color");
    document.body.style.removeProperty("background-color");
    setSelectedProject(null);
    restoreGalleryPosition();
  }, [restoreGalleryPosition]);

  if (selectedProject) {
    const projectIndex = projects.findIndex((project) => project.slug === selectedProject.slug);
    const nextProject = projects[projectIndex + 1];
    return (
      <Suspense fallback={null}>
        <ProjectCaseStudy project={selectedProject} nextProject={nextProject} onClose={closeProject} onOpenProject={openProject} />
      </Suspense>
    );
  }

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">跳到主要内容</a>

      <main id="main-content">
        <PosterHero />
        <StarRevealTransition closingPortal={closingPortal} />
        <AboutIntroSection />
        <ProjectGallerySection projects={projects} onOpenProject={openProject} />

        <ClosingStarTransition portalRef={captureClosingPortal} />
        <FinalContentSection>
          <div className="contact section-shell">
            <p className="eyebrow final-content__content-left">C / Start a conversation</p>
            <div className="contact__topbar">
              <a className="button button--dark contact__top-link" href="#top">↑ 回到顶部</a>
            </div>
            <div className="contact-layout">
              <h2 id="contact-title" className="final-content__content-left contact-title">
                <ScrollFloat as="span" containerClassName="contact-title__line">期待未来有机会能参与更多</ScrollFloat>
                <ScrollFloat as="span" containerClassName="contact-title__line contact-title__line--accent">由数据和证据</ScrollFloat>
                <ScrollFloat as="span" containerClassName="contact-title__line contact-title__line--accent">驱动的落地和</ScrollFloat>
                <ScrollFloat as="span" containerClassName="contact-title__line contact-title__line--accent">决策。</ScrollFloat>
              </h2>
              <div className="contact-layout__copy final-content__content-right">
                <ScrollFloat as="span" containerClassName="contact-copy-float">如果你正在寻找能够支持调研、数据整理、问题分析与产品／业务协作的候选人，欢迎联系我。</ScrollFloat>
                <div className="contact-email-list" aria-label="联系邮箱">
                  <span>QQ：3242588106@qq.com</span>
                  <span>Gmail：lelesong969@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
          <footer className="site-footer section-shell final-content__content-right">
            <a className="brand-mark" href="#top" aria-label="返回页面顶部">LS<span>.</span></a>
            <p>© {new Date().getFullYear()} Leyang Song. Job-search portfolio draft.</p>
            <p>Data / Business / Product Support</p>
          </footer>
        </FinalContentSection>
      </main>
    </div>
  );
}

export default App;
