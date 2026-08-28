import { useEffect, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import "./PillNav.css";

export type PillNavItem = {
  label: string;
  href: string;
  ariaLabel?: string;
};

type PillNavProps = {
  items: readonly PillNavItem[];
  activeHref?: string;
  className?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  onItemClick?: (href: string) => void;
  initialLoadAnimation?: boolean;
};

function PillNav({
  items,
  activeHref,
  className = "",
  ease = "power3.easeOut",
  baseColor = "#181817",
  pillColor = "#f7f1e9",
  hoveredPillTextColor = "#f7f1e9",
  pillTextColor = "#181817",
  onItemClick,
  initialLoadAnimation = true,
}: PillNavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const circleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const timelineRefs = useRef<gsap.core.Timeline[]>([]);
  const activeTweenRefs = useRef<(gsap.core.Tween | undefined)[]>([]);
  const navItemsRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const { width, height } = pill.getBoundingClientRect();
        const radius = ((width * width) / 4 + height * height) / (2 * height);
        const diameter = Math.ceil(2 * radius) + 2;
        const delta = Math.ceil(radius - Math.sqrt(Math.max(0, radius * radius - (width * width) / 4))) + 1;
        const originY = diameter - delta;

        circle.style.width = `${diameter}px`;
        circle.style.height = `${diameter}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, { xPercent: -50, scale: 0, transformOrigin: `50% ${originY}px` });

        const label = pill.querySelector<HTMLElement>(".pill-nav__label");
        const hoverLabel = pill.querySelector<HTMLElement>(".pill-nav__label--hover");
        if (label) gsap.set(label, { y: 0 });
        if (hoverLabel) gsap.set(hoverLabel, { y: height + 12, opacity: 0 });

        timelineRefs.current[index]?.kill();
        const timeline = gsap.timeline({ paused: true });
        timeline.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: "auto" }, 0);
        if (label) timeline.to(label, { y: -(height + 8), duration: 2, ease, overwrite: "auto" }, 0);
        if (hoverLabel) {
          gsap.set(hoverLabel, { y: Math.ceil(height + 100), opacity: 0 });
          timeline.to(hoverLabel, { y: 0, opacity: 1, duration: 2, ease, overwrite: "auto" }, 0);
        }
        timelineRefs.current[index] = timeline;
      });
    };

    layout();
    window.addEventListener("resize", layout);
    document.fonts?.ready.then(layout).catch(() => {});

    if (initialLoadAnimation && navItemsRef.current) {
      gsap.fromTo(navItemsRef.current, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.5, ease });
    }

    return () => window.removeEventListener("resize", layout);
  }, [ease, initialLoadAnimation, items]);

  useEffect(() => {
    const menu = mobileMenuRef.current;
    if (!menu) return;

    gsap.killTweensOf(menu);
    if (isMobileMenuOpen) {
      gsap.set(menu, { visibility: "visible" });
      gsap.fromTo(menu, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.28, ease });
    } else {
      gsap.to(menu, {
        opacity: 0,
        y: 10,
        duration: 0.18,
        ease,
        onComplete: () => gsap.set(menu, { visibility: "hidden" }),
      });
    }
  }, [ease, isMobileMenuOpen]);

  const play = (index: number, toEnd: boolean) => {
    const timeline = timelineRefs.current[index];
    if (!timeline) return;
    activeTweenRefs.current[index]?.kill();
    activeTweenRefs.current[index] = timeline.tweenTo(toEnd ? timeline.duration() : 0, {
      duration: toEnd ? 0.3 : 0.2,
      ease,
      overwrite: "auto",
    });
  };

  const handleItemClick = (href: string) => {
    setIsMobileMenuOpen(false);
    onItemClick?.(href);
  };

  const cssVars = {
    "--pill-nav-base": baseColor,
    "--pill-nav-pill": pillColor,
    "--pill-nav-hover-text": hoveredPillTextColor,
    "--pill-nav-text": pillTextColor,
  } as CSSProperties;

  return (
    <div className={`pill-nav-container ${className}`} style={cssVars}>
      <nav className="pill-nav" aria-label="页面导航">
        <div className="pill-nav__items pill-nav__items--desktop" ref={navItemsRef}>
          <ul className="pill-nav__list" role="menubar">
            {items.map((item, index) => (
              <li key={item.href} role="none">
                <a
                  className={activeHref === item.href ? "pill-nav__pill is-active" : "pill-nav__pill"}
                  href={item.href}
                  role="menuitem"
                  aria-label={item.ariaLabel ?? item.label}
                  onMouseEnter={() => play(index, true)}
                  onMouseLeave={() => play(index, false)}
                  onFocus={() => play(index, true)}
                  onBlur={() => play(index, false)}
                  onClick={() => handleItemClick(item.href)}
                >
                  <span
                    className="pill-nav__hover-circle"
                    aria-hidden="true"
                    ref={(element) => { circleRefs.current[index] = element; }}
                  />
                  <span className="pill-nav__label-stack">
                    <span className="pill-nav__label">{item.label}</span>
                    <span className="pill-nav__label pill-nav__label--hover" aria-hidden="true">{item.label}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <button
          className={isMobileMenuOpen ? "pill-nav__mobile-button is-open" : "pill-nav__mobile-button"}
          type="button"
          aria-label={isMobileMenuOpen ? "关闭导航" : "打开导航"}
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
      </nav>

      <div className="pill-nav__mobile-menu" ref={mobileMenuRef}>
        <ul>
          {items.map((item) => (
            <li key={item.href}>
              <a
                className={activeHref === item.href ? "is-active" : undefined}
                href={item.href}
                onClick={() => handleItemClick(item.href)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default PillNav;
