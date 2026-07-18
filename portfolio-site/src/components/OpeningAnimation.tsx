import { useEffect, useRef, type RefObject } from "react";
import { gsap } from "gsap";
import { supportsAdvancedVisualEffects } from "../utils/platform";

type OpeningAnimationProps = {
  headerRef: RefObject<HTMLElement | null>;
  heroRef: RefObject<HTMLElement | null>;
  titleRef: RefObject<HTMLHeadingElement | null>;
};

export default function OpeningAnimation({ headerRef, heroRef, titleRef }: OpeningAnimationProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const flightTitleRef = useRef<HTMLDivElement>(null);
  const canAnimate = supportsAdvancedVisualEffects();

  useEffect(() => {
    if (!canAnimate) return;
    const finalTitle = titleRef.current;
    const header = headerRef.current;
    const hero = heroRef.current;
    const stage = stageRef.current;
    const flightTitle = flightTitleRef.current;
    if (!finalTitle || !header || !hero || !stage || !flightTitle) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const bands = stage.querySelectorAll<HTMLElement>("[data-opening-band]");
    const titleSlices = stage.querySelectorAll<HTMLElement>("[data-opening-title-slice]");
    const titleAccents = stage.querySelectorAll<HTMLElement>("[data-opening-title-accent]");
    const positioning = hero.querySelector<HTMLElement>(".poster-hero__positioning");
    const footer = hero.querySelector<HTMLElement>(".poster-hero__footer");
    const gallery = hero.querySelector<HTMLElement>(".poster-hero__gallery");
    const cards = gallery?.querySelectorAll<HTMLElement>(".floating-gallery__card") ?? [];
    if (!positioning || !footer || !gallery || cards.length === 0) return;
    const supportingInfo = [header, positioning, footer];
    let disposed = false;
    let started = false;
    let context: gsap.Context | undefined;

    const finish = () => {
      gsap.set(finalTitle, { autoAlpha: 1, visibility: "visible", y: 0, scaleX: 1, scaleY: 1, filter: "blur(0px)", clipPath: "inset(0 0 0% 0)" });
      gsap.set(supportingInfo, { clearProps: "transform,opacity,visibility,filter" });
      gsap.set(gallery, { clearProps: "opacity,visibility" });
      gsap.set(cards, { clearProps: "transform,opacity,visibility,filter" });
      gsap.set(flightTitle, { autoAlpha: 0, visibility: "hidden" });
      gsap.set(stage, { display: "none", visibility: "hidden" });
    };

    if (reducedMotion) {
      finish();
      return () => undefined;
    }

    const start = () => {
      if (disposed || started) return;
      started = true;

      context = gsap.context(() => {
        gsap.set(finalTitle, {
          autoAlpha: 0,
          visibility: "hidden",
          y: 72,
          scaleX: 1.16,
          scaleY: .72,
          filter: "blur(9px)",
          clipPath: "inset(0 0 100% 0)",
          transformOrigin: "center bottom",
        });
        gsap.set(flightTitle, {
          autoAlpha: 0,
          visibility: "hidden",
        });
        gsap.set(titleSlices, {
          autoAlpha: 0,
          xPercent: (index) => index % 2 === 0 ? -13 : 13,
          yPercent: (index) => index % 2 === 0 ? 8 : -8,
          filter: "blur(3px)",
          transformOrigin: "center center",
        });
        gsap.set(titleAccents, { autoAlpha: 0, scale: .45, y: 12, transformOrigin: "center center" });
        gsap.set(supportingInfo, { autoAlpha: 0, y: 28, filter: "blur(6px)" });
        gsap.set(gallery, { autoAlpha: 1 });
        gsap.set(cards, { autoAlpha: 0, y: 68, scale: .78, rotate: -2.5, filter: "blur(9px)", transformOrigin: "center center" });
        gsap.set(stage, { yPercent: 0, display: "block", visibility: "visible" });
        gsap.set(bands, { yPercent: 101, scaleY: 1, transformOrigin: "center" });

        const timeline = gsap.timeline({
          defaults: { ease: "expo.inOut" },
          onComplete: finish,
        });

        timeline
          .to(bands[0], { yPercent: -101, duration: .98, ease: "power3.inOut" }, .12)
          .to(bands[1], { yPercent: -101, duration: .98, ease: "power3.inOut" }, .34)
          .set(flightTitle, { autoAlpha: 1, visibility: "visible" }, 1.2)
          .to(titleSlices, {
            xPercent: 0,
            yPercent: 0,
            autoAlpha: 1,
            filter: "blur(0px)",
            duration: .62,
            stagger: .055,
            ease: "expo.out",
          }, 1.2)
          .to(titleAccents, {
            autoAlpha: 1,
            scale: 1,
            y: 0,
            duration: .44,
            stagger: .09,
            ease: "power3.out",
          }, 1.48)
          .to(stage, { yPercent: -104, duration: .76, ease: "expo.inOut" }, 2.72)
          .set(stage, { display: "none", visibility: "hidden" }, 3.49)
          .set(finalTitle, { autoAlpha: 1, visibility: "visible" }, 3.02)
          .to(finalTitle, {
            y: 0,
            scaleX: 1,
            scaleY: 1,
            filter: "blur(0px)",
            clipPath: "inset(0 0 0% 0)",
            duration: .68,
            ease: "expo.out",
          }, 3.02)
          .to(supportingInfo, {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: .58,
            ease: "power3.out",
            stagger: .08,
          }, 3.28)
          .to(cards, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            rotate: 0,
            filter: "blur(0px)",
            duration: .78,
            ease: "power4.out",
            stagger: .14,
          }, 3.58);
      }, stage);
    };

    const startSafely = () => {
      try {
        start();
      } catch {
        finish();
      }
    };

    const fallbackFrame = window.requestAnimationFrame(startSafely);
    void document.fonts.ready.then(startSafely).catch(finish);
    return () => {
      disposed = true;
      window.cancelAnimationFrame(fallbackFrame);
      context?.revert();
      finish();
    };
  }, [canAnimate, headerRef, heroRef, titleRef]);

  if (!canAnimate) return null;

  return (
    <>
      <div ref={stageRef} className="opening-animation" aria-hidden="true">
        <div className="opening-animation__band opening-animation__band--gold" data-opening-band />
        <div className="opening-animation__band opening-animation__band--ink" data-opening-band />
        <div ref={flightTitleRef} className="opening-animation__title-flight">
          <span className="opening-animation__title-slice opening-animation__title-slice--1" data-opening-title-slice>LEYANG</span>
          <span className="opening-animation__title-slice opening-animation__title-slice--2" data-opening-title-slice>LEYANG</span>
          <span className="opening-animation__title-slice opening-animation__title-slice--3" data-opening-title-slice>LEYANG</span>
          <span className="opening-animation__title-slice opening-animation__title-slice--4" data-opening-title-slice>LEYANG</span>
          <span className="opening-animation__title-accent opening-animation__title-accent--left" data-opening-title-accent>✦</span>
          <span className="opening-animation__title-accent opening-animation__title-accent--right" data-opening-title-accent>✦</span>
        </div>
      </div>
    </>
  );
}
