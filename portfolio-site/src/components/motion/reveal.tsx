"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

import { revealConfig } from "@/components/motion/motion-config";
import { useMotionPreference } from "@/components/motion/motion-provider";

type RevealVariant = "reveal" | "hero-text" | "hero-media";
type RevealElement = "div" | "figure";

interface RevealProps {
  as?: RevealElement;
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: RevealVariant;
}

interface RevealMotionConfig {
  duration: number;
  keyframes: {
    opacity: number[];
    y?: number[];
    scale?: number[];
  };
}

const revealMotion: Record<RevealVariant, RevealMotionConfig> = {
  reveal: {
    duration: revealConfig.revealDuration,
    keyframes: {
      opacity: [revealConfig.opacityFrom, 1],
      y: [revealConfig.revealDistance, 0],
    },
  },
  "hero-text": {
    duration: revealConfig.heroDuration,
    keyframes: {
      opacity: [revealConfig.opacityFrom, 1],
      y: [revealConfig.heroDistance, 0],
    },
  },
  "hero-media": {
    duration: revealConfig.heroDuration,
    keyframes: {
      opacity: [revealConfig.opacityFrom, 1],
      scale: [revealConfig.heroScaleFrom, 1],
    },
  },
};

export function Reveal({
  as = "div",
  children,
  className,
  delay = 0,
  variant = "reveal",
}: RevealProps) {
  const prefersReducedMotion = useMotionPreference();
  const MotionElement = as === "figure" ? motion.figure : motion.div;
  const config = revealMotion[variant];
  const initialState = config.keyframes;
  const finalState =
    variant === "hero-media"
      ? { opacity: 1, scale: 1 }
      : { opacity: 1, y: 0 };
  const runtimeDuration = prefersReducedMotion ? 0 : config.duration;
  const transition = {
    duration: runtimeDuration,
    delay: prefersReducedMotion ? 0 : delay,
    ease: [0.22, 1, 0.36, 1] as const,
  };
  const supportsViewportMotion =
    typeof window !== "undefined" && "IntersectionObserver" in window;

  if (variant === "reveal") {
    return (
      <MotionElement
        className={className}
        data-motion={variant}
        data-motion-delay={delay}
        data-motion-distance={revealConfig.revealDistance}
        data-motion-duration={config.duration}
        data-motion-once={String(revealConfig.viewportOnce)}
        data-motion-runtime={prefersReducedMotion ? "reduced" : "normal"}
        data-motion-runtime-duration={runtimeDuration}
        animate={prefersReducedMotion ? finalState : undefined}
        initial={prefersReducedMotion ? finalState : initialState}
        transition={transition}
        viewport={{
          once: revealConfig.viewportOnce,
          amount: revealConfig.viewportAmount,
        }}
        whileInView={
          !prefersReducedMotion && supportsViewportMotion
            ? finalState
            : undefined
        }
      >
        {children}
      </MotionElement>
    );
  }

  return (
    <MotionElement
      animate={finalState}
      className={className}
      data-motion={variant}
      data-motion-delay={delay}
      data-motion-distance={
        variant === "hero-text" ? revealConfig.heroDistance : undefined
      }
      data-motion-duration={config.duration}
      data-motion-runtime={prefersReducedMotion ? "reduced" : "normal"}
      data-motion-runtime-duration={runtimeDuration}
      initial={prefersReducedMotion ? finalState : initialState}
      transition={transition}
    >
      {children}
    </MotionElement>
  );
}
