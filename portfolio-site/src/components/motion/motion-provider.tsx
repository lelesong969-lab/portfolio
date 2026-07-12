"use client";

import { MotionConfig } from "motion/react";
import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

interface MotionProviderProps {
  children: ReactNode;
}

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const MotionPreferenceContext = createContext(false);

function getReducedMotionSnapshot() {
  return typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia(reducedMotionQuery).matches
    : false;
}

function subscribeToReducedMotion(onChange: () => void) {
  if (typeof window.matchMedia !== "function") {
    return () => {};
  }

  const mediaQuery = window.matchMedia(reducedMotionQuery);
  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }

  mediaQuery.addListener(onChange);
  return () => mediaQuery.removeListener(onChange);
}

export function useMotionPreference() {
  return useContext(MotionPreferenceContext);
}

export function MotionProvider({ children }: MotionProviderProps) {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    () => false,
  );

  return (
    <MotionPreferenceContext value={prefersReducedMotion}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </MotionPreferenceContext>
  );
}
