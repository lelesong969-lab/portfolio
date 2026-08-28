import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import AboutIntroSection from "./components/AboutIntroSection";
import CircularGallery from "./components/CircularGallery";
import ClosingStarTransition from "./components/ClosingStarTransition";
import FinalContentSection from "./components/FinalContentSection";
import GlassSurface from "./components/GlassSurface.jsx";
import LanguagePixelTransition from "./components/LanguagePixelTransition";
import OpeningAnimation from "./components/OpeningAnimation";
import PositioningMark from "./components/PositioningMark";
import ProjectGallerySection from "./components/ProjectGallerySection";
import StarRevealTransition from "./components/StarRevealTransition";
import ScrollFloat from "./components/ScrollFloat";
import { projects, type Project } from "./data/portfolio";
import { projectRouteClass, projectTheme } from "./data/projectTheme";
import type { Language } from "./language";

const ProjectCaseStudy = lazy(() => import("./components/ProjectCaseStudy"));

type OpenProject = (project: Project) => void;

const DEFAULT_LANGUAGE = "en" satisfies Language;
const LANGUAGE_SESSION_KEY = "leyang-portfolio-language";

const readSessionLanguage = (): Language => {
  try {
    return window.sessionStorage.getItem(LANGUAGE_SESSION_KEY) === "zh" ? "zh" : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
};

const projectFromPath = (path: string) => {
  const match = path.match(/^\/projects\/([^/]+)\/?$/);
  return match ? projects.find((project) => project.slug === match[1]) ?? null : null;
};

function LanguageSwitch({ language, onChange }: { language: Language; onChange: (language: Language) => void }) {
  return (
    <div className="language-switch" role="group" aria-label={language === "en" ? "Choose language" : "选择语言"}>
      <button
        className={language === "en" ? "language-switch__option is-active" : "language-switch__option"}
        type="button"
        aria-pressed={language === "en"}
        onClick={() => onChange("en")}
        lang="en"
      >
        EN
      </button>
      <span className="language-switch__divider" aria-hidden="true">/</span>
      <button
        className={language === "zh" ? "language-switch__option is-active" : "language-switch__option"}
        type="button"
        aria-pressed={language === "zh"}
        onClick={() => onChange("zh")}
        lang="zh-CN"
      >
        中文
      </button>
    </div>
  );
}

function SiteHeader({
  headerRef,
  language,
  onLanguageChange,
  variant = "home",
}: {
  headerRef: RefObject<HTMLElement | null>;
  language: Language;
  onLanguageChange: (language: Language) => void;
  variant?: "home" | "project";
}) {
  const navigation = language === "en"
    ? [
        { label: "HOME", href: "/#top" },
        { label: "PROJECTS", href: "/#work" },
        { label: "CONTACT", href: "/#contact" },
      ]
    : [
        { label: "首页", href: "/#top" },
        { label: "项目信息", href: "/#work" },
        { label: "联系方式", href: "/#contact" },
      ];

  return (
    <header ref={headerRef} className={`site-header site-header--${variant}`}>
      <a className="brand-mark" href="/#top" aria-label={language === "en" ? "Return to the page top" : "返回页面顶部"}>LS<span>.</span></a>
      <nav className="site-nav" aria-label={language === "en" ? "Primary navigation" : "主导航"}>
        <GlassSurface
          width="var(--nav-glass-width)"
          height="var(--header-glass-height)"
          borderRadius={28}
          brightness={60}
          opacity={.8}
          blur={11}
          displace={15}
          backgroundOpacity={0}
          saturation={1}
          distortionScale={-150}
          redOffset={5}
          greenOffset={15}
          blueOffset={25}
          mixBlendMode="screen"
          className="site-nav__glass site-nav__glass--links"
        >
          <div className="site-nav__links">
            {navigation.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}
          </div>
        </GlassSurface>
        <GlassSurface
          width="var(--language-glass-width)"
          height="var(--header-glass-height)"
          borderRadius={28}
          brightness={60}
          opacity={.8}
          blur={11}
          displace={15}
          backgroundOpacity={0}
          saturation={1}
          distortionScale={-150}
          redOffset={5}
          greenOffset={15}
          blueOffset={25}
          mixBlendMode="screen"
          className="site-nav__glass site-nav__glass--language"
        >
          <LanguageSwitch language={language} onChange={onLanguageChange} />
        </GlassSurface>
      </nav>
    </header>
  );
}

function PosterHero({ language, onLanguageChange }: { language: Language; onLanguageChange: (language: Language) => void }) {
  const headerRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const finalTitleRef = useRef<HTMLHeadingElement>(null);
  const heroGalleryItems = useMemo(() => projects.map((project) => ({
    image: project.coverImage,
    text: language === "en" ? project.titleEn : project.titleZh,
    previewLabel: language === "en" ? project.categoryEn : project.previewLabel,
  })), [language]);
  const positioning = language === "en"
    ? "DESIGN / TECHNOLOGY / DATA-INFORMED INNOVATION"
    : "设计 / 科技 / 数据驱动创新";

  return (
    <>
      <SiteHeader headerRef={headerRef} language={language} onLanguageChange={onLanguageChange} />
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

          <div className="poster-hero__positioning" aria-label={positioning}>
            <PositioningMark language={language} text={positioning} />
          </div>

          <div className="poster-hero__gallery">
            <CircularGallery items={heroGalleryItems} language={language} />
          </div>

          <div className="poster-hero__footer">
            <p>{language === "en"
              ? "INDUSTRIAL DESIGN BACKGROUND / RESEARCH-LED INTERDISCIPLINARY PRACTICE"
              : "工业设计背景 / 研究驱动的跨学科实践"}</p>
          </div>
        </div>
      </section>
    </>
  );
}

function App() {
  const [language, setLanguage] = useState<Language>(readSessionLanguage);
  const [pendingLanguage, setPendingLanguage] = useState<Language | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(() => projectFromPath(window.location.pathname));
  const [closingPortal, setClosingPortal] = useState<HTMLElement | null>(null);
  const projectHeaderRef = useRef<HTMLElement>(null);
  const lastProjectIndex = useRef<string | null>(null);
  const pendingLanguageRef = useRef<Language | null>(null);
  const committedLanguageRef = useRef<Language | null>(null);
  const captureClosingPortal = useCallback((node: HTMLElement | null) => setClosingPortal(node), []);

  useEffect(() => {
    document.documentElement.classList.remove("project-route-pending");
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === "en" ? "en" : "zh-CN";
    try {
      window.sessionStorage.setItem(LANGUAGE_SESSION_KEY, language);
    } catch {
      // The language still works in memory when session storage is unavailable.
    }

    const title = selectedProject
      ? `${language === "en" ? selectedProject.titleEn : selectedProject.titleZh} — Leyang Song`
      : language === "en"
        ? "Leyang Song — Design, Technology & Data-Informed Innovation"
        : "宋乐扬 — 设计、科技与数据驱动创新";
    const description = language === "en"
      ? "Leyang Song's portfolio across design, technology, and data-informed innovation."
      : "宋乐扬关于设计、科技与数据驱动创新的跨学科作品集。";
    document.title = title;
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute("content", description);
  }, [language, selectedProject]);

  useEffect(() => {
    if (pendingLanguage === null) return;

    const previousBusyState = document.body.getAttribute("aria-busy");
    document.body.setAttribute("aria-busy", "true");

    return () => {
      if (previousBusyState === null) document.body.removeAttribute("aria-busy");
      else document.body.setAttribute("aria-busy", previousBusyState);
    };
  }, [pendingLanguage]);

  const requestLanguageChange = useCallback((nextLanguage: Language) => {
    if (nextLanguage === language || pendingLanguageRef.current !== null) return;

    pendingLanguageRef.current = nextLanguage;
    committedLanguageRef.current = null;
    setPendingLanguage(nextLanguage);
  }, [language]);

  const commitLanguageChange = useCallback((nextLanguage: Language) => {
    if (
      pendingLanguageRef.current !== nextLanguage
      || committedLanguageRef.current === nextLanguage
    ) return;

    committedLanguageRef.current = nextLanguage;
    setLanguage(nextLanguage);
  }, []);

  const finishLanguageChange = useCallback(() => {
    pendingLanguageRef.current = null;
    committedLanguageRef.current = null;
    setPendingLanguage(null);
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

  const languageTransition = (
    <LanguagePixelTransition
      targetLanguage={pendingLanguage}
      onCovered={commitLanguageChange}
      onFinish={finishLanguageChange}
    />
  );

  if (selectedProject) {
    const projectIndex = projects.findIndex((project) => project.slug === selectedProject.slug);
    const nextProject = projects[projectIndex + 1];
    return (
      <>
        <SiteHeader headerRef={projectHeaderRef} language={language} onLanguageChange={requestLanguageChange} variant="project" />
        <Suspense fallback={null}>
          <ProjectCaseStudy project={selectedProject} nextProject={nextProject} onClose={closeProject} onOpenProject={openProject} language={language} />
        </Suspense>
        {languageTransition}
      </>
    );
  }

  return (
    <div className="site-shell" data-language={language}>
      <a className="skip-link" href="#main-content">{language === "en" ? "Skip to main content" : "跳到主要内容"}</a>

      <main id="main-content">
        <PosterHero language={language} onLanguageChange={requestLanguageChange} />
        <StarRevealTransition closingPortal={closingPortal} language={language} />
        <AboutIntroSection language={language} />
        <ProjectGallerySection projects={projects} onOpenProject={openProject} language={language} />

        <ClosingStarTransition portalRef={captureClosingPortal} />
        <FinalContentSection>
          <div className="contact section-shell">
            <p className="eyebrow final-content__content-left">{language === "en" ? "C / START A CONVERSATION" : "C / 开始交流"}</p>
            <div className="contact__topbar">
              <a className="button button--dark contact__top-link" href="#top">↑ {language === "en" ? "BACK TO TOP" : "回到顶部"}</a>
            </div>
            <div className="contact-layout">
              <h2 id="contact-title" className="final-content__content-left contact-title">
                {(language === "en"
                  ? ["LET'S TURN", "EVIDENCE INTO", "GROUNDED", "INNOVATION."]
                  : ["期待参与更多", "由数据与证据", "驱动的创新与", "落地。"]
                ).map((line, index) => (
                  <ScrollFloat
                    as="span"
                    containerClassName={index === 0 ? "contact-title__line" : "contact-title__line contact-title__line--accent"}
                    key={line}
                  >
                    {line}
                  </ScrollFloat>
                ))}
              </h2>
              <div className="contact-layout__copy final-content__content-right">
                <ScrollFloat as="span" containerClassName="contact-copy-float">{language === "en"
                  ? "I welcome conversations about interdisciplinary study, research-led design, data-informed innovation, and collaborative projects."
                  : "欢迎围绕跨学科学习、研究驱动设计、数据驱动创新与合作项目展开交流。"}</ScrollFloat>
                <div className="contact-email-list" aria-label={language === "en" ? "Contact email addresses" : "联系邮箱"}>
                  <span>QQ：3242588106@qq.com</span>
                  <span>Gmail：lelesong969@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
          <footer className="site-footer section-shell final-content__content-right">
            <a className="brand-mark" href="#top" aria-label={language === "en" ? "Return to the page top" : "返回页面顶部"}>LS<span>.</span></a>
            <p>© {new Date().getFullYear()} Leyang Song. {language === "en" ? "Interdisciplinary portfolio." : "跨学科作品集。"}</p>
            <p>{language === "en" ? "Design / Technology / Data-Informed Innovation" : "设计 / 科技 / 数据驱动创新"}</p>
          </footer>
        </FinalContentSection>
      </main>
      {languageTransition}
    </div>
  );
}

export default App;
