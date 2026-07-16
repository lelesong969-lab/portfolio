import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";

const LiquidEther = lazy(() => import("./LiquidEther/LiquidEther"));

const FINAL_ETHER_COLORS = ["#d9c8b5", "#bd7045", "#f0e5d7"];

type FinalContentSectionProps = {
  children: ReactNode;
};

export default function FinalContentSection({ children }: FinalContentSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [shouldLoadEther, setShouldLoadEther] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !("IntersectionObserver" in window)) {
      setShouldLoadEther(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldLoadEther(true);
        observer.disconnect();
      },
      { rootMargin: "800px 0px" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="contact" className="final-content" aria-labelledby="contact-title">
      <div className="final-content__ether" aria-hidden="true">
        {shouldLoadEther ? (
          <Suspense fallback={null}>
            <LiquidEther
              colors={FINAL_ETHER_COLORS}
              mouseForce={18}
              cursorSize={120}
              isViscous={false}
              iterationsViscous={20}
              iterationsPoisson={20}
              resolution={.32}
              autoDemo
              autoSpeed={.34}
              autoIntensity={1.55}
              takeoverDuration={.28}
              autoResumeDelay={2200}
              autoRampDuration={.8}
            />
          </Suspense>
        ) : null}
      </div>
      <div className="final-content__glass" aria-hidden="true" />
      <div className="final-content__motion">{children}</div>
    </section>
  );
}
