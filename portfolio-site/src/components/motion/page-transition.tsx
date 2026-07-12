"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

import { pageTransitionConfig } from "@/components/motion/motion-config";
import { useMotionPreference } from "@/components/motion/motion-provider";

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const prefersReducedMotion = useMotionPreference();
  const runtimeDuration = prefersReducedMotion
    ? 0
    : pageTransitionConfig.duration;
  const initialState = {
    opacity: pageTransitionConfig.opacityFrom,
    y: pageTransitionConfig.distance,
  };
  const finalState = { opacity: 1, y: 0 };

  return (
    <motion.div
      animate={finalState}
      data-page-transition
      data-page-transition-distance={pageTransitionConfig.distance}
      data-page-transition-duration={pageTransitionConfig.duration}
      data-page-transition-runtime={prefersReducedMotion ? "reduced" : "normal"}
      data-page-transition-runtime-duration={runtimeDuration}
      initial={prefersReducedMotion ? finalState : initialState}
      transition={{
        duration: runtimeDuration,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
