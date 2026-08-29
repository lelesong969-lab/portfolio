import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import { gsap } from "gsap";
import AboutIntroSection from "./components/AboutIntroSection";
import CircularGallery from "./components/CircularGallery";
import ClosingStarTransition from "./components/ClosingStarTransition";
import FinalContentSection from "./components/FinalContentSection";
import GlassSurface from "./components/GlassSurface.jsx";
import LanguageEntranceTransition from "./components/LanguageEntranceTransition";
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

function LanguageOption({
  label,
  hoverLabel,
  active,
  lang,
  onSelect,
}: {
  label: string;
  hoverLabel: string;
  active: boolean;
  lang: string;
  onSelect: () => void;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const circleRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const hoverLabelRef = useRef<HTMLSpanElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const activeTweenRef = useRef<gsap.core.Tween | null>(null);
  const reducedMotionRef = useRef(false);

  useLayoutEffect(() => {
    const button = buttonRef.current;
    const circle = circleRef.current;
    const primaryLabel = labelRef.current;
    const secondaryLabel = hoverLabelRef.current;
    if (!button || !circle || !primaryLabel || !secondaryLabel) return;

    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cancelled = false;

    const layout = () => {
      if (cancelled) return;
      const { width, height } = button.getBoundingClientRect();
      const radius = ((width * width) / 4 + height * height) / (2 * height);
      const diameter = Math.ceil(radius * 2) + 2;
      const delta = Math.ceil(radius - Math.sqrt(Math.max(0, radius * radius - (width * width) / 4))) + 1;
      const originY = diameter - delta;

      circle.style.width = `${diameter}px`;
      circle.style.height = `${diameter}px`;
      circle.style.bottom = `-${delta}px`;

      activeTweenRef.current?.kill();
      timelineRef.current?.kill();
      gsap.set(circle, { xPercent: -50, scale: 0, transformOrigin: `50% ${originY}px` });
      gsap.set(primaryLabel, { y: 0, opacity: 1 });
      gsap.set(secondaryLabel, { y: Math.ceil(height + 12), opacity: 0 });

      timelineRef.current = gsap.timeline({ paused: true })
        .to(circle, { scale: 1.2, xPercent: -50, duration: 1, ease: "power3.out", overwrite: "auto" }, 0)
        .to(primaryLabel, { y: -(height + 8), opacity: 0, duration: 1, ease: "power3.out", overwrite: "auto" }, 0)
        .to(secondaryLabel, { y: 0, opacity: 1, duration: 1, ease: "power3.out", overwrite: "auto" }, 0);
    };

    layout();
    window.addEventListener("resize", layout);
    void document.fonts?.ready.then(layout).catch(() => undefined);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", layout);
      activeTweenRef.current?.kill();
      timelineRef.current?.kill();
    };
  }, [hoverLabel, label]);

  const animateTo = (progress: 0 | 1) => {
    const timeline = timelineRef.current;
    if (!timeline) return;
    activeTweenRef.current?.kill();
    if (reducedMotionRef.current) {
      timeline.progress(progress);
      return;
    }
    activeTweenRef.current = timeline.tweenTo(progress === 1 ? timeline.duration() : 0, {
      duration: progress === 1 ? .3 : .2,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  return (
    <button
      ref={buttonRef}
      className={active ? "language-switch__option is-active" : "language-switch__option"}
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      onMouseEnter={() => animateTo(1)}
      onMouseLeave={() => animateTo(0)}
      onFocus={() => animateTo(1)}
      onBlur={() => animateTo(0)}
      lang={lang}
    >
      <span ref={circleRef} className="language-switch__hover-circle" aria-hidden="true" />
      <span className="language-switch__label-stack">
        <span ref={labelRef} className="language-switch__label">{label}</span>
        <span ref={hoverLabelRef} className="language-switch__label language-switch__label--hover" aria-hidden="true">{hoverLabel}</span>
      </span>
    </button>
  );
}

function LanguageSwitch({ language, onChange }: { language: Language; onChange: (language: Language) => void }) {
  return (
    <div className="language-switch" role="group" aria-label={language === "en" ? "Choose English or bilingual Chinese" : "选择纯英文或中英双语版本"}>
      <LanguageOption label="EN" hoverLabel="ENGLISH" active={language === "en"} lang="en" onSelect={() => onChange("en")} />
      <span className="language-switch__divider" aria-hidden="true">/</span>
      <LanguageOption label="中文" hoverLabel="中英双语" active={language === "zh"} lang="zh-CN" onSelect={() => onChange("zh")} />
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
  const positioningEnglish = "DESIGN / TECHNOLOGY / DATA-INFORMED INNOVATION";
  const positioningChinese = "设计 / 科技 / 数据驱动创新";

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

          <div className="poster-hero__positioning">
            <PositioningMark language={language} english={positioningEnglish} chinese={positioningChinese} />
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
  const lastProjectSlug = useRef<string | null>(null);
  const galleryScrollFrameRef = useRef<number | null>(null);
  const galleryScrollTimeoutRef = useRef<number | null>(null);
  const galleryFocusFrameRef = useRef<number | null>(null);
  const pendingLanguageRef = useRef<Language | null>(null);
  const committedLanguageRef = useRef<Language | null>(null);
  const languageHashRef = useRef<{ hash: string; top: number } | null>(null);
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

  useLayoutEffect(() => {
    if (!languageHashRef.current) return;

    const { hash, top } = languageHashRef.current;
    if (!hash.startsWith("#")) {
      languageHashRef.current = null;
      return;
    }

    languageHashRef.current = null;
    const anchor = document.getElementById(hash.slice(1));
    if (anchor) window.scrollTo({ top: anchor.offsetTop - top, behavior: "instant" as ScrollBehavior });
  }, [language]);

  const requestLanguageChange = useCallback((nextLanguage: Language) => {
    if (nextLanguage === language || pendingLanguageRef.current !== null) return;

    pendingLanguageRef.current = nextLanguage;
    committedLanguageRef.current = null;
    const currentHash = window.location.hash;
    const currentAnchor = currentHash ? document.getElementById(currentHash.slice(1)) : null;
    languageHashRef.current = currentAnchor ? { hash: currentHash, top: currentAnchor.getBoundingClientRect().top } : null;
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

  const cancelGalleryRestore = useCallback(() => {
    if (galleryScrollFrameRef.current !== null) window.cancelAnimationFrame(galleryScrollFrameRef.current);
    if (galleryScrollTimeoutRef.current !== null) window.clearTimeout(galleryScrollTimeoutRef.current);
    if (galleryFocusFrameRef.current !== null) window.cancelAnimationFrame(galleryFocusFrameRef.current);
    galleryScrollFrameRef.current = null;
    galleryScrollTimeoutRef.current = null;
    galleryFocusFrameRef.current = null;
  }, []);

  const restoreGalleryPosition = useCallback(() => {
    cancelGalleryRestore();
    const slug = lastProjectSlug.current;
    if (!slug) return;

    galleryScrollFrameRef.current = window.requestAnimationFrame(() => {
      galleryScrollFrameRef.current = null;
      const scrollToGallery = () => {
        const gallery = document.getElementById("work");
        if (gallery) window.scrollTo({ top: gallery.offsetTop, behavior: "instant" as ScrollBehavior });
      };
      scrollToGallery();
      galleryScrollTimeoutRef.current = window.setTimeout(() => {
        galleryScrollTimeoutRef.current = null;
        if (lastProjectSlug.current !== slug) return;
        scrollToGallery();
        galleryFocusFrameRef.current = window.requestAnimationFrame(() => {
          galleryFocusFrameRef.current = null;
          if (lastProjectSlug.current !== slug) return;
          Array.from(document.querySelectorAll<HTMLElement>("#work .ag-panel"))
            .find((panel) => panel.dataset.galleryItemId === slug)
            ?.focus({ preventScroll: true });
          if (lastProjectSlug.current === slug) lastProjectSlug.current = null;
        });
      }, 96);
    });
  }, [cancelGalleryRestore]);

  useEffect(() => () => cancelGalleryRestore(), [cancelGalleryRestore]);

  useEffect(() => {
    if (selectedProject || !lastProjectSlug.current) return;
    restoreGalleryPosition();
  }, [selectedProject, restoreGalleryPosition]);

  useEffect(() => {
    const handlePopState = () => {
      const nextProject = projectFromPath(window.location.pathname);
      document.documentElement.classList.toggle(projectRouteClass, Boolean(nextProject));
      document.body.classList.toggle(projectRouteClass, Boolean(nextProject));
      if (nextProject) {
        cancelGalleryRestore();
        lastProjectSlug.current = nextProject.slug;
        document.documentElement.style.backgroundColor = projectTheme.entryBackground;
        document.body.style.backgroundColor = projectTheme.entryBackground;
      } else {
        document.documentElement.style.removeProperty("background-color");
        document.body.style.removeProperty("background-color");
      }
      setSelectedProject(nextProject);
      if (nextProject) window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }));
      else if (lastProjectSlug.current) {
        window.history.replaceState({}, "", "/#work");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [cancelGalleryRestore]);

  const openProject: OpenProject = useCallback((project) => {
    cancelGalleryRestore();
    lastProjectSlug.current = project.slug;
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
  }, [cancelGalleryRestore]);

  const closeProject = useCallback(() => {
    if (selectedProject) lastProjectSlug.current = selectedProject.slug;
    window.history.replaceState({}, "", "/#work");
    document.documentElement.classList.remove(projectRouteClass);
    document.body.classList.remove(projectRouteClass);
    document.documentElement.style.removeProperty("background-color");
    document.body.style.removeProperty("background-color");
    setSelectedProject(null);
  }, [selectedProject]);

  const languageTransition = (
    <LanguageEntranceTransition
      targetLanguage={pendingLanguage}
      onCovered={commitLanguageChange}
      onFinish={finishLanguageChange}
    />
  );

  if (selectedProject) {
    const projectIndex = projects.findIndex((project) => project.slug === selectedProject.slug);
    const nextProject = projects[(projectIndex + 1) % projects.length];
    return (
      <>
        <SiteHeader headerRef={projectHeaderRef} language={language} onLanguageChange={requestLanguageChange} variant="project" />
        <Suspense fallback={null}>
          <ProjectCaseStudy project={selectedProject} nextProject={nextProject} projects={projects} onClose={closeProject} onOpenProject={openProject} language={language} />
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
            <p className="eyebrow final-content__content-left">{language === "en" ? "C / START A CONVERSATION" : "C / Start a conversation"}</p>
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
            <p>© {new Date().getFullYear()} Leyang Song. Interdisciplinary portfolio.</p>
            <p>Design / Technology / Data-Informed Innovation</p>
          </footer>
        </FinalContentSection>
      </main>
      {languageTransition}
    </div>
  );
}

export default App;
