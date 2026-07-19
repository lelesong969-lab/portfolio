import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import ScrollVelocity from "./ScrollVelocity";

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const range = (value: number, start: number, end: number) => {
  const progress = clamp((value - start) / (end - start));
  return progress * progress * (3 - 2 * progress);
};

export default function AboutIntroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const identityRef = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLQuoteElement>(null);
  const researchRef = useRef<HTMLDivElement>(null);
  const productRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const identity = identityRef.current;
    const statement = statementRef.current;
    const research = researchRef.current;
    const product = productRef.current;
    const portrait = portraitRef.current;
    if (!section || !identity || !statement || !research || !product || !portrait) return;

    const blocks = [identity, statement, research, product, portrait];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(blocks, { x: 0, y: 0, autoAlpha: 1, visibility: "visible", filter: "blur(0px)", clipPath: "inset(0% 0 0 0)" });
      return () => gsap.killTweensOf(blocks);
    }

    gsap.set(identity, { y: 128, scaleX: 1.34, scaleY: .58, opacity: 0, visibility: "visible", filter: "blur(14px)", clipPath: "inset(0 0 100% 0)" });
    gsap.set(research, { x: -128, scaleX: 1.14, scaleY: .78, opacity: 0, visibility: "visible", filter: "blur(12px)", clipPath: "inset(0 0 100% 0)" });
    gsap.set([statement, product], { x: 128, scaleX: 1.14, scaleY: .78, opacity: 0, visibility: "visible", filter: "blur(12px)", clipPath: "inset(0 0 100% 0)" });
    gsap.set(portrait, { y: 78, scale: 1.12, opacity: 0, visibility: "visible", filter: "blur(10px)", clipPath: "inset(100% 0 0 0)" });

    let targetProgress = 0;
    let displayProgress = 0;
    let velocity = 0;
    let frameId = 0;
    let lastTime = performance.now();
    let disposed = false;
    let isActive = false;

    const render = (time: number) => {
      frameId = 0;
      if (disposed || !isActive) return;
      const rect = section.getBoundingClientRect();
      const triggerLine = window.innerHeight * .68;
      targetProgress = clamp((triggerLine - rect.top) / Math.max(1, rect.height + triggerLine));
      const delta = Math.min(.032, Math.max(.001, (time - lastTime) / 1000));
      lastTime = time;
      const acceleration = (-90 * (displayProgress - targetProgress) - 24 * velocity) / .8;
      velocity += acceleration * delta;
      displayProgress += velocity * delta;
      if (Math.abs(displayProgress - targetProgress) < .001 && Math.abs(velocity) < .001) {
        displayProgress = targetProgress;
        velocity = 0;
      }
      displayProgress = clamp(displayProgress);

      const animationProgress = clamp(displayProgress / .58);
      const about = range(animationProgress, .04, .22);
      const left = range(animationProgress, .34, .54);
      const rightHeading = range(animationProgress, .44, .64);
      const rightCopy = range(animationProgress, .58, .78);
      const portraitProgress = range(animationProgress, .18, .4);

      gsap.set(identity, {
        y: 128 * (1 - about),
        scaleX: 1 + .34 * (1 - about),
        scaleY: 1 - .42 * (1 - about),
        opacity: about,
        filter: `blur(${(14 * (1 - about)).toFixed(2)}px)`,
        clipPath: `inset(0 0 ${(100 * (1 - about)).toFixed(2)}% 0)`,
      });
      gsap.set(research, { x: -128 * (1 - left), scaleX: 1 + .14 * (1 - left), scaleY: 1 - .22 * (1 - left), opacity: left, filter: `blur(${(12 * (1 - left)).toFixed(2)}px)`, clipPath: `inset(0 0 ${(100 * (1 - left)).toFixed(2)}% 0)` });
      gsap.set(statement, { x: 128 * (1 - rightHeading), scaleX: 1 + .14 * (1 - rightHeading), scaleY: 1 - .22 * (1 - rightHeading), opacity: rightHeading, filter: `blur(${(12 * (1 - rightHeading)).toFixed(2)}px)`, clipPath: `inset(0 0 ${(100 * (1 - rightHeading)).toFixed(2)}% 0)` });
      gsap.set(product, { x: 128 * (1 - rightCopy), scaleX: 1 + .14 * (1 - rightCopy), scaleY: 1 - .22 * (1 - rightCopy), opacity: rightCopy, filter: `blur(${(12 * (1 - rightCopy)).toFixed(2)}px)`, clipPath: `inset(0 0 ${(100 * (1 - rightCopy)).toFixed(2)}% 0)` });
      gsap.set(portrait, {
        y: 78 * (1 - portraitProgress),
        scale: 1.12 - .12 * portraitProgress,
        opacity: portraitProgress,
        filter: `blur(${(10 * (1 - portraitProgress)).toFixed(2)}px)`,
        clipPath: `inset(${(100 * (1 - portraitProgress)).toFixed(2)}% 0 0 0)`,
      });
      section.dataset.progress = displayProgress.toFixed(4);
      frameId = window.requestAnimationFrame(render);
    };

    const startRender = () => {
      if (disposed || !isActive || frameId) return;
      lastTime = performance.now();
      frameId = window.requestAnimationFrame(render);
    };
    const stopRender = () => {
      if (!frameId) return;
      window.cancelAnimationFrame(frameId);
      frameId = 0;
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        isActive = entry.isIntersecting;
        if (isActive) startRender();
        else stopRender();
      },
      { rootMargin: "50% 0px" },
    );
    observer.observe(section);

    return () => {
      disposed = true;
      stopRender();
      observer.disconnect();
      gsap.killTweensOf(blocks);
    };
  }, []);

  return (
    <section id="about" ref={sectionRef} className="about-intro" aria-labelledby="about-title">
      <div className="about-intro__canvas">
        <div ref={identityRef} className="about-intro__block about-intro__block--identity" data-side="left">
          <p className="about-intro__eyebrow">A / ABOUT ME</p>
          <h2 id="about-title">LEYANG SONG</h2>
          <p className="about-intro__support">工业设计背景，面向数据分析、商业分析与产品协作。</p>
        </div>

        <div className="about-intro__velocity about-intro__velocity--data" aria-label="Data Business Analysis">
          <ScrollVelocity
            texts={["DATA  BUSINESS ANALYSIS"]}
            velocity={20}
            damping={50}
            stiffness={400}
            numCopies={7}
            velocityMapping={{ input: [0, 1800], output: [0, 3] }}
            className="about-intro__velocity-copy"
          />
        </div>

        <figure ref={portraitRef} className="about-intro__portrait">
          <img src="/media/leyang-portrait.png" alt="宋乐扬" loading="lazy" decoding="async" />
        </figure>

        <div ref={researchRef} className="about-intro__block about-intro__block--research" data-side="left">
          <p className="about-intro__eyebrow">RESEARCH / ANALYSIS</p>
          <h3>Research &amp; Insight<br />Information Synthesis</h3>
          <p className="about-intro__support">从用户、场景和市场资料中识别问题，把分散证据整理成可比较的判断。</p>
        </div>

        <blockquote ref={statementRef} className="about-intro__block about-intro__block--statement" data-side="right">
          <p className="about-intro__eyebrow">PERSONAL STATEMENT</p>
          <p>工业设计背景，但对数据科学与商业分析更感兴趣，并在相关项目中承担调研与数据分析的责任。</p>
        </blockquote>

        <div ref={productRef} className="about-intro__block about-intro__block--product" data-side="right">
          <p className="about-intro__eyebrow">PRODUCT / COMMUNICATION</p>
          <h3>Product Thinking<br />Visual Communication</h3>
          <p className="about-intro__support">把分析结论转译为产品方向、业务协作和清晰、可信的视觉表达。</p>
        </div>

        <div className="about-intro__velocity about-intro__velocity--product" aria-label="Product">
          <ScrollVelocity
            texts={["PRODUCT"]}
            velocity={-22}
            damping={50}
            stiffness={400}
            numCopies={8}
            velocityMapping={{ input: [0, 1800], output: [0, 3.2] }}
            className="about-intro__velocity-copy about-intro__velocity-copy--product"
          />
        </div>
      </div>
    </section>
  );
}
