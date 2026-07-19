import { useId, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import BreathingWave from "./BreathingWave";
import TextPressure from "./TextPressure";
import {
  DARK_BACKGROUND,
  FULL_COVER_PROGRESS,
  INERTIA_DECAY_SECONDS,
  INERTIA_DELAY_MS,
  PORTAL_STABLE_SECONDS,
  SPRING_DAMPING,
  SPRING_MASS,
  SPRING_REST_DELTA,
  SPRING_REST_SPEED,
  SPRING_STIFFNESS,
  STAR_AXIS_LEAD,
  STAR_GROWTH_END,
  STAR_GROWTH_START,
  STAR_PATH,
  clamp,
  getCoveredScale,
  getPortalScrollProgress,
  getStarGrowth,
  lerp,
} from "./starMaskMotion";

const WELCOME_HOLD_END = 0.08;
const WELCOME_EXIT_END = 0.4997;
const SUPPORT_EXIT_START = 0.1;

const range = (value: number, start: number, end: number) =>
  clamp((value - start) / (end - start));

function cubicBezierEase(progress: number) {
  const x1 = 0.22;
  const y1 = 1;
  const x2 = 0.36;
  const y2 = 1;
  const sample = (t: number, a1: number, a2: number) =>
    ((1 - 3 * a2 + 3 * a1) * t + (3 * a2 - 6 * a1)) * t * t + 3 * a1 * t;
  const slope = (t: number, a1: number, a2: number) =>
    3 * (1 - 3 * a2 + 3 * a1) * t * t + 2 * (3 * a2 - 6 * a1) * t + 3 * a1;
  let t = clamp(progress);

  for (let index = 0; index < 5; index += 1) {
    const currentSlope = slope(t, x1, x2);
    if (Math.abs(currentSlope) < 0.0001) break;
    t -= (sample(t, x1, x2) - progress) / currentSlope;
  }

  return sample(clamp(t), y1, y2);
}

function StarRevealTransition({
  closingPortal,
}: {
  closingPortal: HTMLElement | null;
}) {
  const portalRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const welcomeRef = useRef<HTMLDivElement>(null);
  const shapeRef = useRef<SVGSVGElement>(null);
  const starTransformRef = useRef<SVGGElement>(null);
  const starRef = useRef<SVGPathElement>(null);
  const bridgeMainRef = useRef<HTMLDivElement>(null);
  const titleId = `intro-bridge-${useId().replace(/:/g, "")}`;

  useLayoutEffect(() => {
    const portal = portalRef.current;
    const stage = stageRef.current;
    const welcome = welcomeRef.current;
    const shape = shapeRef.current;
    const starTransform = starTransformRef.current;
    const star = starRef.current;
    const bridgeMain = bridgeMainRef.current;
    const closingStage = closingPortal?.querySelector<HTMLDivElement>(".star-closing__sticky");
    if (!portal || !stage || !welcome || !shape || !starTransform || !star || !bridgeMain || !closingPortal || !closingStage) return;

    const welcomeWordmark = welcome.querySelector<HTMLElement>(".hero-welcome__wordmark");
    const welcomeCopy = welcome.querySelector<HTMLElement>(".hero-welcome__copy");
    const welcomeCharacters = welcome.querySelectorAll<HTMLElement>(".hero-welcome__wordmark-char");
    const thanks = closingPortal.querySelector<HTMLElement>(".star-closing__thanks");
    const closingBlack = closingPortal.querySelector<HTMLElement>(".star-closing__black");
    if (!welcomeWordmark || !welcomeCopy || welcomeCharacters.length === 0 || !closingBlack) return;

    const helloCharacters = Array.from(bridgeMain.querySelectorAll<HTMLElement>(".text-pressure__title span"));
    const thanksCharacters = thanks
      ? Array.from(thanks.querySelectorAll<HTMLElement>(".text-pressure__title span"))
      : [];

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const setStarScale = (scale: number) => {
      starTransform.setAttribute("transform", `scale(${scale})`);
    };
    const hostStar = (host: HTMLElement) => {
      if (shape.parentElement !== host) host.appendChild(shape);
      shape.style.left = "50%";
      shape.style.top = "50%";
      shape.style.opacity = "1";
      shape.style.visibility = "visible";
      shape.dataset.host = host === closingStage ? "closing" : "opening";
    };

    let rawProgress = 0;
    let targetProgress = 0;
    let displayProgress = 0;
    let springVelocity = 0;
    let closingRawProgress = 0;
    let closingTargetProgress = 0;
    let closingDisplayProgress = 0;
    let closingVelocity = 0;
    let closingInitialized = false;
    let closingLastRaw = 0;
    let closingRecentVelocity = 0;
    let closingProjectedOffset = 0;
    let closingProjectionArmed = false;
    let closingLastSampleTime = performance.now();
    let closingLastInputTime = performance.now();
    let coveredScale = getCoveredScale(stage, shape, star);
    let closingCoverScale = 1;
    let projectedOffset = 0;
    let recentProgressVelocity = 0;
    let lastProgressSample = 0;
    let lastProgressSampleTime = performance.now();
    let lastInputTime = performance.now();
    let projectionArmed = false;
    let stableDuration = 0;
    let portalReady = false;
    let helloCharactersRevealed = false;
    let thanksCharactersRevealed = false;

    const revealCharacters = (characters: HTMLElement[], stagger: number) => {
      if (characters.length === 0) return;
      gsap.killTweensOf(characters);
      gsap.fromTo(characters,
        { autoAlpha: 0, y: 34 },
        {
          autoAlpha: 1,
          y: 0,
          duration: .62,
          ease: "power3.out",
          stagger,
          overwrite: true,
        },
      );
    };

    const resetCharacters = (characters: HTMLElement[]) => {
      if (characters.length === 0) return;
      gsap.killTweensOf(characters);
      gsap.set(characters, { autoAlpha: 0, y: 34 });
    };
    let lastTime = performance.now();
    let frameId = 0;
    let disposed = false;
    let initialized = false;
    let activePhase: "opening" | "idle" | "closing" = "opening";
    let isMotionActive = false;

    const measureClosingCoverScale = () => {
      const baseWidth = Math.max(1, shape.clientWidth);
      const baseHeight = Math.max(1, shape.clientHeight);
      const formulaScale = Math.max(window.innerWidth / baseWidth, window.innerHeight / baseHeight) * 1.15;
      closingCoverScale = Math.max(formulaScale, getCoveredScale(closingStage, shape, star));
      closingPortal.dataset.coverScale = closingCoverScale.toFixed(4);
      closingPortal.dataset.restWidth = baseWidth.toFixed(0);
      closingPortal.dataset.restHeight = baseHeight.toFixed(0);
    };

    const coversViewportCorners = () => {
      const matrix = star.getScreenCTM();
      if (!matrix || typeof star.isPointInFill !== "function") return false;
      const inverse = matrix.inverse();
      const stageRect = stage.getBoundingClientRect();
      const corners = [
        new DOMPoint(stageRect.left, stageRect.top),
        new DOMPoint(stageRect.right, stageRect.top),
        new DOMPoint(stageRect.right, stageRect.bottom),
        new DOMPoint(stageRect.left, stageRect.bottom),
      ];
      return corners.every((corner) => star.isPointInFill(corner.matrixTransform(inverse)));
    };

    const measureMotionState = () => {
      const closingRect = closingPortal.getBoundingClientRect();
      const closingTravel = Math.max(1, closingPortal.offsetHeight - closingStage.clientHeight);
      const closingNearViewport = closingRect.top < window.innerHeight && closingRect.bottom > 0;
      closingRawProgress = closingRect.bottom <= 0 ? 1 : clamp(-closingRect.top / closingTravel);

      if (closingNearViewport) {
        hostStar(closingStage);
        activePhase = "closing";
        rawProgress = 1;
        return;
      }

      if (closingRect.top >= window.innerHeight) hostStar(stage);
      const openingRect = portal.getBoundingClientRect();
      const openingProgress = getPortalScrollProgress(portal, stage);
      const openingComplete = openingRect.bottom <= .5;
      activePhase = openingComplete ? "idle" : "opening";
      rawProgress = openingComplete ? 1 : openingProgress;
      shape.dataset.phase = activePhase;
    };

    const renderThanks = (progress: number) => {
      if (!thanks) return;
      const entering = cubicBezierEase(range(progress, .18, .38));
      const leaving = cubicBezierEase(range(progress, .5, .6));
      if (entering > .015 && !thanksCharactersRevealed) {
        thanksCharactersRevealed = true;
        revealCharacters(thanksCharacters, .075);
      } else if (entering <= .001 && thanksCharactersRevealed) {
        thanksCharactersRevealed = false;
        resetCharacters(thanksCharacters);
      }
      const opacity = entering * (1 - leaving);
      gsap.set(thanks, {
        y: leaving > 0 ? -28 * leaving : 44 * (1 - entering),
        scale: lerp(.96, 1, entering),
        opacity,
        filter: `blur(${(leaving > 0 ? 8 * leaving : 12 * (1 - entering)).toFixed(2)}px)`,
        letterSpacing: `${lerp(.16, .08, entering).toFixed(3)}em`,
      });
      closingPortal.dataset.thanksProgress = opacity.toFixed(4);
    };

    const renderHello = (progress: number) => {
      const reveal = cubicBezierEase(range(progress, .98, 1));
      if (reveal > .015 && !helloCharactersRevealed) {
        helloCharactersRevealed = true;
        revealCharacters(helloCharacters, .085);
      } else if (reveal <= .001 && helloCharactersRevealed) {
        helloCharactersRevealed = false;
        resetCharacters(helloCharacters);
      }
      gsap.set(bridgeMain, {
        autoAlpha: reveal,
        y: 22 * (1 - reveal),
        scale: lerp(.985, 1, reveal),
        rotate: 0,
        filter: "blur(0px)",
      });
    };

    const updateVisual = () => {
      if (activePhase === "closing") {
        const shrink = cubicBezierEase(range(closingDisplayProgress, .66, .94));
        const inertia = clamp(closingVelocity * .012, -.06, .06);
        const starScale = Math.max(.94, lerp(closingCoverScale, 1, shrink) * (1 + inertia * (1 - shrink)));
        setStarScale(starScale);
        gsap.set(closingBlack, { autoAlpha: closingDisplayProgress < .66 ? 1 : 0 });
        renderThanks(closingDisplayProgress);
        closingPortal.dataset.progress = closingDisplayProgress.toFixed(4);
        closingPortal.dataset.currentScale = starScale.toFixed(4);
        closingPortal.dataset.stage = closingDisplayProgress < .18
          ? "covered"
          : closingDisplayProgress < .6
            ? "thanks"
            : closingDisplayProgress < .66
              ? "black-hold"
              : closingDisplayProgress < .94
                ? "shrinking"
                : "resting";
        return;
      }

      gsap.set(closingBlack, { autoAlpha: 1 });
      renderThanks(0);
      const verticalGrowth = getStarGrowth(displayProgress);
      const horizontalGrowth = displayProgress >= STAR_GROWTH_END
        ? 1
        : getStarGrowth(displayProgress, STAR_AXIS_LEAD);
      const baseScaleX = 1 + (coveredScale - 1) * horizontalGrowth;
      const baseScaleY = 1 + (coveredScale - 1) * verticalGrowth;
      const isExpanding = displayProgress >= STAR_GROWTH_START;
      const verticalDeformation = isExpanding ? clamp(springVelocity * .018, -.04, .04) : 0;
      const horizontalDeformation = isExpanding ? clamp(springVelocity * .011, -.025, .025) : 0;
      const scaleX = baseScaleX * (1 - horizontalDeformation);
      const scaleY = baseScaleY * (1 + verticalDeformation);
      starTransform.setAttribute("transform", `scale(${scaleX} ${scaleY})`);

      const welcomeExit = clamp((displayProgress - WELCOME_HOLD_END) / (WELCOME_EXIT_END - WELCOME_HOLD_END));
      const supportExit = clamp((displayProgress - SUPPORT_EXIT_START) / (WELCOME_EXIT_END - SUPPORT_EXIT_START));
      const wordmarkEase = cubicBezierEase(welcomeExit);
      const wordmarkLift = stage.clientWidth < 768 ? 180 : 270;
      welcomeWordmark.style.transform = `translate3d(0, ${(-wordmarkLift * wordmarkEase).toFixed(2)}px, 0)`;

      const characterDuration = 1 - (welcomeCharacters.length - 1) * .075;
      welcomeCharacters.forEach((character, index) => {
        const localProgress = clamp((welcomeExit - index * .075) / characterDuration);
        const eased = cubicBezierEase(localProgress);
        character.style.transform = `translate3d(0, ${(-.16 * eased).toFixed(3)}em, 0) scaleY(${(1 + .025 * eased).toFixed(4)})`;
        character.style.filter = "blur(0px)";
        character.style.opacity = "1";
      });

      const supportEase = cubicBezierEase(supportExit);
      const supportLift = stage.clientWidth < 768 ? 170 : 230;
      welcomeCopy.style.transform = `translate3d(0, ${(-supportLift * supportEase).toFixed(2)}px, 0)`;
      welcomeCopy.style.filter = "blur(0px)";
      renderHello(displayProgress);
      portal.dataset.rawProgress = rawProgress.toFixed(4);
      portal.dataset.targetProgress = targetProgress.toFixed(4);
      portal.dataset.displayProgress = displayProgress.toFixed(4);
      portal.dataset.scaleX = scaleX.toFixed(4);
      portal.dataset.scaleY = scaleY.toFixed(4);
      portal.dataset.starPhase = activePhase;
    };

    const resetEntrance = () => {
      gsap.set(bridgeMain, { autoAlpha: 0, y: 22, scale: .985, rotate: 0, filter: "blur(0px)" });
    };

    const renderFrame = (time: number) => {
      frameId = 0;
      if (disposed || !isMotionActive) return;
      const deltaSeconds = Math.min(.032, Math.max(.001, (time - lastTime) / 1000));
      lastTime = time;
      const previousRawProgress = rawProgress;
      measureMotionState();

      if (!initialized) {
        targetProgress = rawProgress;
        displayProgress = rawProgress;
        lastProgressSample = rawProgress;
        lastProgressSampleTime = time;
        initialized = true;
      } else if (Math.abs(rawProgress - previousRawProgress) > .00001) {
        const sampleDuration = Math.max(.008, (time - lastProgressSampleTime) / 1000);
        recentProgressVelocity = (rawProgress - lastProgressSample) / sampleDuration;
        lastProgressSample = rawProgress;
        lastProgressSampleTime = time;
        lastInputTime = time;
        projectionArmed = true;
        projectedOffset = 0;
      }

      if (projectionArmed && time - lastInputTime >= INERTIA_DELAY_MS) {
        projectedOffset = clamp(recentProgressVelocity * .055, -.03, .03);
        projectionArmed = false;
      }
      projectedOffset *= Math.exp(-deltaSeconds / INERTIA_DECAY_SECONDS);
      targetProgress = clamp(rawProgress + projectedOffset);

      if (!closingInitialized && activePhase === "closing") {
        closingDisplayProgress = closingRawProgress;
        closingLastRaw = closingRawProgress;
        closingInitialized = true;
      } else if (Math.abs(closingRawProgress - closingLastRaw) > .00001) {
        const sampleDuration = Math.max(.008, (time - closingLastSampleTime) / 1000);
        closingRecentVelocity = (closingRawProgress - closingLastRaw) / sampleDuration;
        closingLastRaw = closingRawProgress;
        closingLastSampleTime = time;
        closingLastInputTime = time;
        closingProjectionArmed = true;
        closingProjectedOffset = 0;
      }
      if (closingProjectionArmed && time - closingLastInputTime >= INERTIA_DELAY_MS) {
        closingProjectedOffset = clamp(closingRecentVelocity * .055, -.03, .03);
        closingProjectionArmed = false;
      }
      closingProjectedOffset *= Math.exp(-deltaSeconds / INERTIA_DECAY_SECONDS);
      closingTargetProgress = clamp(closingRawProgress + closingProjectedOffset);

      const openingAcceleration = (-SPRING_STIFFNESS * (displayProgress - targetProgress) - SPRING_DAMPING * springVelocity) / SPRING_MASS;
      springVelocity += openingAcceleration * deltaSeconds;
      displayProgress = clamp(displayProgress + springVelocity * deltaSeconds);
      const closingAcceleration = (-SPRING_STIFFNESS * (closingDisplayProgress - closingTargetProgress) - SPRING_DAMPING * closingVelocity) / SPRING_MASS;
      closingVelocity += closingAcceleration * deltaSeconds;
      closingDisplayProgress = clamp(closingDisplayProgress + closingVelocity * deltaSeconds);

      if (reducedMotion || (Math.abs(displayProgress - targetProgress) < SPRING_REST_DELTA && Math.abs(springVelocity) < SPRING_REST_SPEED)) {
        displayProgress = targetProgress;
        springVelocity = 0;
      }
      if (reducedMotion || (Math.abs(closingDisplayProgress - closingTargetProgress) < SPRING_REST_DELTA && Math.abs(closingVelocity) < SPRING_REST_SPEED)) {
        closingDisplayProgress = closingTargetProgress;
        closingVelocity = 0;
      }

      updateVisual();
      const fullyCovered = activePhase === "opening"
        && displayProgress >= FULL_COVER_PROGRESS
        && coversViewportCorners();
      stableDuration = fullyCovered ? stableDuration + deltaSeconds : 0;
      portalReady = stableDuration >= PORTAL_STABLE_SECONDS;
      portal.dataset.maskCovered = String(fullyCovered);
      portal.dataset.portalReady = String(portalReady);

      frameId = window.requestAnimationFrame(renderFrame);
    };

    const startRender = () => {
      if (disposed || !isMotionActive || frameId) return;
      lastTime = performance.now();
      frameId = window.requestAnimationFrame(renderFrame);
    };
    const stopRender = () => {
      if (!frameId) return;
      window.cancelAnimationFrame(frameId);
      frameId = 0;
    };

    hostStar(stage);
    resetEntrance();
    resetCharacters(helloCharacters);
    resetCharacters(thanksCharacters);
    measureClosingCoverScale();
    renderThanks(0);

    const noteWheelInput = () => {
      lastInputTime = performance.now();
      closingLastInputTime = lastInputTime;
      projectionArmed = true;
      closingProjectionArmed = true;
    };
    const refreshLayout = () => {
      coveredScale = getCoveredScale(stage, shape, star);
      measureClosingCoverScale();
      measureMotionState();
      updateVisual();
    };
    const resizeObserver = new ResizeObserver(refreshLayout);
    resizeObserver.observe(stage);
    resizeObserver.observe(closingStage);
    const visibility = new Map<Element, boolean>([
      [portal, false],
      [closingPortal, false],
    ]);
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => visibility.set(entry.target, entry.isIntersecting));
        isMotionActive = Array.from(visibility.values()).some(Boolean);
        if (isMotionActive) startRender();
        else stopRender();
      },
      { rootMargin: "100% 0px" },
    );
    intersectionObserver.observe(portal);
    intersectionObserver.observe(closingPortal);
    window.addEventListener("wheel", noteWheelInput, { passive: true });
    window.addEventListener("resize", refreshLayout, { passive: true });
    window.addEventListener("orientationchange", refreshLayout);

    return () => {
      disposed = true;
      stopRender();
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("wheel", noteWheelInput);
      window.removeEventListener("resize", refreshLayout);
      window.removeEventListener("orientationchange", refreshLayout);
      if (shape.parentElement !== stage) stage.appendChild(shape);
      welcome.removeAttribute("style");
      welcomeWordmark.removeAttribute("style");
      welcomeCopy.removeAttribute("style");
      welcomeCharacters.forEach((character) => character.removeAttribute("style"));
      thanks?.removeAttribute("style");
      closingBlack.removeAttribute("style");
      starTransform.removeAttribute("transform");
      gsap.killTweensOf(thanks ? [bridgeMain, thanks, ...helloCharacters, ...thanksCharacters] : [bridgeMain, ...helloCharacters]);
    };
  }, [closingPortal]);

  return (
    <section className="star-portal" ref={portalRef} aria-label="首页与关于我之间的星形过渡">
      <BreathingWave className="star-portal__boundary-wave" />
      <div className="star-portal__stage" ref={stageRef}>
        <svg
          ref={shapeRef}
          className="star-portal__shape star-portal__shape--shared"
          viewBox="6 10 88 180"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          focusable="false"
        >
          <g transform="translate(50 100)">
            <g ref={starTransformRef}>
              <path
                ref={starRef}
                className="star-portal__path"
                d={STAR_PATH}
                fill={DARK_BACKGROUND}
                transform="translate(-50 -100)"
              />
            </g>
          </g>
        </svg>
        <div className="hero-welcome section-shell" ref={welcomeRef} aria-labelledby="hero-welcome-title">
          <h2 id="hero-welcome-title" className="hero-welcome__wordmark" aria-label="WELCOME">
            {"WELCOME".split("").map((character, index) => (
              <span className="hero-welcome__wordmark-char" aria-hidden="true" key={`${character}-${index}`}>
                {character}
              </span>
            ))}
          </h2>
          <div className="hero-welcome__copy">
            <p className="hero-welcome__eyebrow">A SMALL INTRODUCTION</p>
            <p>欢迎来到我的作品集。这里记录我如何整理研究与项目资料，把线索变成清晰的产品和业务判断。</p>
          </div>
        </div>
        <div id={titleId} className="intro-bridge__statement intro-bridge__statement--portal" ref={bridgeMainRef}>
          <div className="intro-bridge__pressure">
            <TextPressure
              text="HELLO"
              flex
              alpha={false}
              stroke={false}
              width
              weight
              italic
              textColor="#fffaf1"
              strokeColor="#d5ad58"
              minFontSize={36}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default StarRevealTransition;
