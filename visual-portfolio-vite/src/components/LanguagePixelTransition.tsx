import { useCallback, useEffect, useRef, useState } from "react";
import type { Language } from "../language";
import PixelSwap from "./PixelSwap.jsx";
import "./LanguagePixelTransition.css";

type LanguagePixelTransitionProps = {
  targetLanguage: Language | null;
  onCovered: (language: Language) => void;
  onFinish: () => void;
};

type TransitionCycle = {
  id: number;
  target: Language;
  covered: boolean;
  finished: boolean;
};

export default function LanguagePixelTransition({
  targetLanguage,
  onCovered,
  onFinish,
}: LanguagePixelTransitionProps) {
  const [isCovered, setIsCovered] = useState(false);
  const mountedRef = useRef(false);
  const cycleIdRef = useRef(0);
  const cycleRef = useRef<TransitionCycle | null>(null);
  const uncoverFrameRef = useRef<number | null>(null);
  const onCoveredRef = useRef(onCovered);
  const onFinishRef = useRef(onFinish);

  onCoveredRef.current = onCovered;
  onFinishRef.current = onFinish;

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      cycleRef.current = null;

      if (uncoverFrameRef.current !== null) {
        window.cancelAnimationFrame(uncoverFrameRef.current);
        uncoverFrameRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (targetLanguage === null) return;

    const currentCycle = cycleRef.current;
    if (currentCycle) {
      // Before the page language has changed, a rapid replacement request may
      // safely become the target of the same cover animation. Once committed,
      // the current cycle always finishes before another one can begin.
      if (!currentCycle.covered) currentCycle.target = targetLanguage;
      return;
    }

    cycleIdRef.current += 1;
    cycleRef.current = {
      id: cycleIdRef.current,
      target: targetLanguage,
      covered: false,
      finished: false,
    };
    setIsCovered(true);
  }, [targetLanguage]);

  const handleComplete = useCallback((active: boolean) => {
    const cycle = cycleRef.current;
    if (!mountedRef.current || !cycle) return;

    if (active) {
      if (cycle.covered) return;

      cycle.covered = true;
      onCoveredRef.current(cycle.target);

      if (!mountedRef.current || cycleRef.current?.id !== cycle.id) return;
      if (uncoverFrameRef.current !== null) {
        window.cancelAnimationFrame(uncoverFrameRef.current);
      }

      uncoverFrameRef.current = window.requestAnimationFrame(() => {
        uncoverFrameRef.current = null;
        if (!mountedRef.current || cycleRef.current?.id !== cycle.id) return;
        setIsCovered(false);
      });
      return;
    }

    if (!cycle.covered || cycle.finished) return;

    cycle.finished = true;
    cycleRef.current = null;
    onFinishRef.current();
  }, []);

  return (
    <div className="language-pixel-transition" aria-hidden="true">
      <PixelSwap
        firstContent={<div className="language-pixel-transition__clear" />}
        secondContent={<div className="language-pixel-transition__plate" />}
        pixelSize={56}
        gap={0}
        pixelRadius={3}
        pixelSpin={0}
        pixelScale={0.28}
        duration={650}
        pixelDuration={280}
        pattern="diagonal"
        randomness={0.16}
        fade
        trigger="manual"
        curtain
        aspectRatio="auto"
        active={isCovered}
        onComplete={handleComplete}
        className="language-pixel-transition__swap"
        style={{ width: "100%", height: "100%", pointerEvents: "none" }}
      />
    </div>
  );
}
