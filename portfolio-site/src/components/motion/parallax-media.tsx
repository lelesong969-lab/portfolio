"use client";

import {
  motion,
  useScroll,
  useTransform,
} from "motion/react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import { parallaxMediaConfig } from "@/components/motion/motion-config";
import { useMotionPreference } from "@/components/motion/motion-provider";

interface ParallaxMediaProps {
  children: ReactNode;
  className?: string;
  overscan?: boolean;
}

const desktopMediaQuery = `(min-width: ${parallaxMediaConfig.breakpoint}px)`;

export function ParallaxMedia({
  children,
  className,
  overscan = false,
}: ParallaxMediaProps) {
  const target = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useMotionPreference();
  const [isDesktop, setIsDesktop] = useState(false);
  const { scrollYProgress } = useScroll({
    target,
    offset: ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [parallaxMediaConfig.range[0], parallaxMediaConfig.range[1]],
  );
  const isActive = isDesktop && !prefersReducedMotion;

  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia(desktopMediaQuery);
    const updateDesktopState = () => setIsDesktop(mediaQuery.matches);

    updateDesktopState();
    mediaQuery.addEventListener("change", updateDesktopState);
    return () => mediaQuery.removeEventListener("change", updateDesktopState);
  }, []);

  return (
    <motion.div
      className={className}
      data-parallax
      data-parallax-active={String(isActive)}
      data-parallax-breakpoint={parallaxMediaConfig.breakpoint}
      data-parallax-range={parallaxMediaConfig.range.join(",")}
      data-parallax-runtime={prefersReducedMotion ? "reduced" : "normal"}
      ref={target}
      style={
        isActive
          ? {
              y,
              ...(overscan
                ? { height: "103%", top: parallaxMediaConfig.range[0] }
                : {}),
            }
          : undefined
      }
    >
      {children}
    </motion.div>
  );
}
