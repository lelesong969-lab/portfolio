import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import type { Language } from "../language";
import ScrollVelocity from "./ScrollVelocity";

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const range = (value: number, start: number, end: number) => {
  const progress = clamp((value - start) / (end - start));
  return progress * progress * (3 - 2 * progress);
};

export default function AboutIntroSection({ language }: { language: Language }) {
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

    const render = (time: number) => {
      if (disposed) return;
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

    frameId = window.requestAnimationFrame(render);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      gsap.killTweensOf(blocks);
    };
  }, []);

  const copy = language === "en"
    ? {
        eyebrow: "A / ABOUT ME",
        summary: "An industrial design background, now focused on data-informed innovation, business analysis, and product collaboration.",
        velocityData: "DESIGN  TECHNOLOGY  DATA",
        portraitAlt: "Portrait of Leyang Song",
        researchEyebrow: "RESEARCH / ANALYSIS",
        researchTitle: <>Research &amp; Insight<br />Information Synthesis</>,
        researchCopy: "I identify patterns across user, context, and market evidence, then turn scattered inputs into comparable decisions.",
        statementEyebrow: "PERSONAL STATEMENT",
        statement: "Trained in industrial design, I am most interested in how data, technology, and business analysis can shape more grounded innovation.",
        productEyebrow: "PRODUCT / COMMUNICATION",
        productTitle: <>Product Thinking<br />Visual Communication</>,
        productCopy: "I translate analysis into product direction, cross-functional alignment, and clear visual narratives.",
        velocityProduct: "DATA-INFORMED INNOVATION",
      }
    : {
        eyebrow: "A / 关于我",
        summary: "工业设计背景，关注设计、科技与数据驱动创新。",
        velocityData: "设计  科技  数据",
        portraitAlt: "宋乐扬肖像",
        researchEyebrow: "研究 / 分析",
        researchTitle: <>研究与洞察<br />信息整合</>,
        researchCopy: "从用户、场景与市场资料中识别问题，把分散证据整理为可比较的判断。",
        statementEyebrow: "个人陈述",
        statement: "工业设计出身，但更关注数据、技术和商业分析如何让创新建立在更可靠的判断上。",
        productEyebrow: "产品 / 沟通",
        productTitle: <>产品思维<br />视觉沟通</>,
        productCopy: "把分析结论转译为产品方向、跨角色协作和清晰可信的视觉表达。",
        velocityProduct: "数据驱动创新",
      };

  return (
    <section id="about" ref={sectionRef} className="about-intro" aria-labelledby="about-title">
      <div className="about-intro__canvas">
        <div ref={identityRef} className="about-intro__block about-intro__block--identity" data-side="left">
          <p className="about-intro__eyebrow">{copy.eyebrow}</p>
          <h2 id="about-title">LEYANG SONG</h2>
          <p className="about-intro__support">{copy.summary}</p>
        </div>

        <div className="about-intro__velocity about-intro__velocity--data" aria-label="Data Business Analysis">
          <ScrollVelocity
            texts={[copy.velocityData]}
            velocity={20}
            damping={50}
            stiffness={400}
            numCopies={7}
            velocityMapping={{ input: [0, 1800], output: [0, 3] }}
            className="about-intro__velocity-copy"
          />
        </div>

        <figure ref={portraitRef} className="about-intro__portrait">
          <img src="/media/leyang-portrait.png" alt={copy.portraitAlt} loading="lazy" decoding="async" />
        </figure>

        <div ref={researchRef} className="about-intro__block about-intro__block--research" data-side="left">
          <p className="about-intro__eyebrow">{copy.researchEyebrow}</p>
          <h3>{copy.researchTitle}</h3>
          <p className="about-intro__support">{copy.researchCopy}</p>
        </div>

        <blockquote ref={statementRef} className="about-intro__block about-intro__block--statement" data-side="right">
          <p className="about-intro__eyebrow">{copy.statementEyebrow}</p>
          <p>{copy.statement}</p>
        </blockquote>

        <div ref={productRef} className="about-intro__block about-intro__block--product" data-side="right">
          <p className="about-intro__eyebrow">{copy.productEyebrow}</p>
          <h3>{copy.productTitle}</h3>
          <p className="about-intro__support">{copy.productCopy}</p>
        </div>

        <div className="about-intro__velocity about-intro__velocity--product" aria-label="Product">
          <ScrollVelocity
            texts={[copy.velocityProduct]}
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
