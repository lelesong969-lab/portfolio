import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { gsap } from "gsap";

const ENTRANCE_TIMING = {
  firstBandStart: .12,
  secondBandStart: .34,
  bandDuration: .98,
  flightStart: 1.2,
  sliceDuration: .62,
  accentStart: 1.48,
  accentDuration: .44,
  stageExitStart: 2.72,
  stageExitDuration: .76,
  stageExitComplete: 3.49,
  finalTitleStart: 3.02,
  finalTitleDuration: .68,
  supportingStart: 3.28,
  supportingDuration: .58,
  cardsStart: 3.58,
  cardsDuration: .78,
} as const;

type OpeningAnimationProps = {
  headerRef: RefObject<HTMLElement | null>;
  heroRef: RefObject<HTMLElement | null>;
  titleRef: RefObject<HTMLHeadingElement | null>;
};

type OpeningAnimationSurfaceProps = {
  stageRef: RefObject<HTMLDivElement | null>;
  flightTitleRef: RefObject<HTMLDivElement | null>;
  className?: string;
};

function OpeningAnimationSurface({
  stageRef,
  flightTitleRef,
  className = "opening-animation",
}: OpeningAnimationSurfaceProps) {
  return (
    <div ref={stageRef} className={className} aria-hidden="true">
      <div className="opening-animation__band opening-animation__band--ink" data-opening-band />
      <div className="opening-animation__band opening-animation__band--green" data-opening-band />
      <div ref={flightTitleRef} className="opening-animation__title-flight">
        <span className="opening-animation__title-slice opening-animation__title-slice--1" data-opening-title-slice>LEYANG</span>
        <span className="opening-animation__title-slice opening-animation__title-slice--2" data-opening-title-slice>LEYANG</span>
        <span className="opening-animation__title-slice opening-animation__title-slice--3" data-opening-title-slice>LEYANG</span>
        <span className="opening-animation__title-slice opening-animation__title-slice--4" data-opening-title-slice>LEYANG</span>
        <span className="opening-animation__title-accent opening-animation__title-accent--left" data-opening-title-accent>✦</span>
        <span className="opening-animation__title-accent opening-animation__title-accent--right" data-opening-title-accent>✦</span>
      </div>
    </div>
  );
}

type LanguageEntranceTransitionProps = {
  onCovered: () => void;
  onFinish: () => void;
};

export function LanguageEntranceTransition({ onCovered, onFinish }: LanguageEntranceTransitionProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const flightTitleRef = useRef<HTMLDivElement>(null);
  const callbacksRef = useRef({ onCovered, onFinish });
  callbacksRef.current = { onCovered, onFinish };

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const flightTitle = flightTitleRef.current;
    if (!stage || !flightTitle) return;

    const bands = stage.querySelectorAll<HTMLElement>("[data-opening-band]");
    const titleSlices = stage.querySelectorAll<HTMLElement>("[data-opening-title-slice]");
    const titleAccents = stage.querySelectorAll<HTMLElement>("[data-opening-title-accent]");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let finished = false;
    let frameId: number | null = null;
    let context: gsap.Context | undefined;

    const finish = () => {
      if (finished) return;
      finished = true;
      gsap.set(stage, { display: "none", visibility: "hidden" });
      callbacksRef.current.onFinish();
    };

    if (reducedMotion) {
      frameId = window.requestAnimationFrame(() => {
        callbacksRef.current.onCovered();
        finish();
      });
      return () => {
        if (frameId !== null) window.cancelAnimationFrame(frameId);
      };
    }

    context = gsap.context(() => {
      gsap.set(stage, { yPercent: 0, display: "block", visibility: "visible" });
      gsap.set(flightTitle, { autoAlpha: 0, visibility: "hidden" });
      gsap.set(titleSlices, {
        autoAlpha: 0,
        xPercent: (index) => index % 2 === 0 ? -13 : 13,
        yPercent: (index) => index % 2 === 0 ? 8 : -8,
        filter: "blur(3px)",
        transformOrigin: "center center",
      });
      gsap.set(titleAccents, { autoAlpha: 0, scale: .45, y: 12, transformOrigin: "center center" });
      gsap.set(bands, { yPercent: 101, scaleY: 1, transformOrigin: "center" });

      const timeline = gsap.timeline({
        paused: true,
        defaults: { ease: "expo.inOut" },
        onComplete: finish,
      });

      timeline
        .to(bands[0], { yPercent: -101, duration: ENTRANCE_TIMING.bandDuration, ease: "power3.inOut" }, ENTRANCE_TIMING.firstBandStart)
        .to(bands[1], { yPercent: -101, duration: ENTRANCE_TIMING.bandDuration, ease: "power3.inOut" }, ENTRANCE_TIMING.secondBandStart)
        .set(flightTitle, { autoAlpha: 1, visibility: "visible" }, ENTRANCE_TIMING.flightStart)
        .to(titleSlices, {
          xPercent: 0,
          yPercent: 0,
          autoAlpha: 1,
          filter: "blur(0px)",
          duration: ENTRANCE_TIMING.sliceDuration,
          stagger: .055,
          ease: "expo.out",
        }, ENTRANCE_TIMING.flightStart)
        .to(titleAccents, {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          duration: ENTRANCE_TIMING.accentDuration,
          stagger: .09,
          ease: "power3.out",
        }, ENTRANCE_TIMING.accentStart)
        .to(stage, { yPercent: -104, duration: ENTRANCE_TIMING.stageExitDuration, ease: "expo.inOut" }, ENTRANCE_TIMING.stageExitStart)
        .set(stage, { display: "none", visibility: "hidden" }, ENTRANCE_TIMING.stageExitComplete);

      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        callbacksRef.current.onCovered();
        timeline.play(0);
      });
    }, stage);

    return () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      context?.revert();
    };
  }, []);

  return <OpeningAnimationSurface stageRef={stageRef} flightTitleRef={flightTitleRef} className="opening-animation opening-animation--language" />;
}

export default function OpeningAnimation({ headerRef, heroRef, titleRef }: OpeningAnimationProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const flightTitleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
          .to(bands[0], { yPercent: -101, duration: ENTRANCE_TIMING.bandDuration, ease: "power3.inOut" }, ENTRANCE_TIMING.firstBandStart)
          .to(bands[1], { yPercent: -101, duration: ENTRANCE_TIMING.bandDuration, ease: "power3.inOut" }, ENTRANCE_TIMING.secondBandStart)
          .set(flightTitle, { autoAlpha: 1, visibility: "visible" }, ENTRANCE_TIMING.flightStart)
          .to(titleSlices, {
            xPercent: 0,
            yPercent: 0,
            autoAlpha: 1,
            filter: "blur(0px)",
            duration: ENTRANCE_TIMING.sliceDuration,
            stagger: .055,
            ease: "expo.out",
          }, ENTRANCE_TIMING.flightStart)
          .to(titleAccents, {
            autoAlpha: 1,
            scale: 1,
            y: 0,
            duration: ENTRANCE_TIMING.accentDuration,
            stagger: .09,
            ease: "power3.out",
          }, ENTRANCE_TIMING.accentStart)
          .to(stage, { yPercent: -104, duration: ENTRANCE_TIMING.stageExitDuration, ease: "expo.inOut" }, ENTRANCE_TIMING.stageExitStart)
          .set(stage, { display: "none", visibility: "hidden" }, ENTRANCE_TIMING.stageExitComplete)
          .set(finalTitle, { autoAlpha: 1, visibility: "visible" }, ENTRANCE_TIMING.finalTitleStart)
          .to(finalTitle, {
            y: 0,
            scaleX: 1,
            scaleY: 1,
            filter: "blur(0px)",
            clipPath: "inset(0 0 0% 0)",
            duration: ENTRANCE_TIMING.finalTitleDuration,
            ease: "expo.out",
          }, ENTRANCE_TIMING.finalTitleStart)
          .to(supportingInfo, {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: ENTRANCE_TIMING.supportingDuration,
            ease: "power3.out",
            stagger: .08,
          }, ENTRANCE_TIMING.supportingStart)
          .to(cards, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            rotate: 0,
            filter: "blur(0px)",
            duration: ENTRANCE_TIMING.cardsDuration,
            ease: "power4.out",
            stagger: .14,
          }, ENTRANCE_TIMING.cardsStart);
      }, stage);
    };

    const fallbackFrame = window.requestAnimationFrame(start);
    void document.fonts.ready.then(start);
    return () => {
      disposed = true;
      window.cancelAnimationFrame(fallbackFrame);
      context?.revert();
      finish();
    };
  }, [headerRef, heroRef, titleRef]);

  return <OpeningAnimationSurface stageRef={stageRef} flightTitleRef={flightTitleRef} />;
}
