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

const cancelFrame = (frameRef: { current: number | null }) => {
  if (frameRef.current === null) return;
  window.cancelAnimationFrame(frameRef.current);
  frameRef.current = null;
};

export default function LanguagePixelTransition({
  targetLanguage,
  onCovered,
  onFinish,
}: LanguagePixelTransitionProps) {
  const [isCovered, setIsCovered] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [coverRequestId, setCoverRequestId] = useState(0);
  const mountedRef = useRef(false);
  const cycleIdRef = useRef(0);
  const cycleRef = useRef<TransitionCycle | null>(null);
  const queuedTargetRef = useRef<Language | null>(null);
  const coverFrameRef = useRef<number | null>(null);
  const uncoverFrameRef = useRef<number | null>(null);
  const inertRootRef = useRef<{ element: HTMLElement; owned: boolean } | null>(null);
  const onCoveredRef = useRef(onCovered);
  const onFinishRef = useRef(onFinish);

  onCoveredRef.current = onCovered;
  onFinishRef.current = onFinish;

  const lockUnderlyingApp = useCallback(() => {
    if (inertRootRef.current) return;

    const root = document.getElementById("root");
    if (!root) return;

    const alreadyInert = root.inert;
    if (!alreadyInert) root.inert = true;
    inertRootRef.current = { element: root, owned: !alreadyInert };
  }, []);

  const unlockUnderlyingApp = useCallback(() => {
    const lock = inertRootRef.current;
    inertRootRef.current = null;
    if (lock?.owned) lock.element.inert = false;
  }, []);

  const beginCycle = useCallback(
    (target: Language) => {
      cycleIdRef.current += 1;
      const id = cycleIdRef.current;
      cycleRef.current = {
        id,
        target,
        covered: false,
        finished: false,
      };

      lockUnderlyingApp();
      setIsCovered(false);
      setIsMounted(true);
      setCoverRequestId(id);
    },
    [lockUnderlyingApp],
  );

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      cycleRef.current = null;
      queuedTargetRef.current = null;
      cancelFrame(coverFrameRef);
      cancelFrame(uncoverFrameRef);
      unlockUnderlyingApp();
    };
  }, [unlockUnderlyingApp]);

  useEffect(() => {
    if (!isMounted || coverRequestId === 0) return;

    const id = coverRequestId;
    cancelFrame(coverFrameRef);
    coverFrameRef.current = window.requestAnimationFrame(() => {
      coverFrameRef.current = null;
      if (!mountedRef.current || cycleRef.current?.id !== id) return;
      setIsCovered(true);
    });

    return () => cancelFrame(coverFrameRef);
  }, [coverRequestId, isMounted]);

  useEffect(() => {
    if (targetLanguage === null) {
      queuedTargetRef.current = null;
      return;
    }

    const currentCycle = cycleRef.current;
    if (currentCycle) {
      // Before the page language has changed, a rapid replacement request may
      // safely become the target of the same cover animation. Once committed,
      // the current cycle always finishes before another one can begin.
      if (!currentCycle.covered) {
        currentCycle.target = targetLanguage;
      } else {
        queuedTargetRef.current = targetLanguage === currentCycle.target ? null : targetLanguage;
      }
      return;
    }

    beginCycle(targetLanguage);
  }, [beginCycle, targetLanguage]);

  const handleComplete = useCallback((active: boolean) => {
    const cycle = cycleRef.current;
    if (!mountedRef.current || !cycle) return;

    if (active) {
      if (cycle.covered) return;

      cycle.covered = true;
      onCoveredRef.current(cycle.target);

      if (!mountedRef.current || cycleRef.current?.id !== cycle.id) return;
      cancelFrame(uncoverFrameRef);

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
    const queuedTarget = queuedTargetRef.current;
    queuedTargetRef.current = null;
    onFinishRef.current();

    if (!mountedRef.current) return;
    if (queuedTarget !== null) {
      beginCycle(queuedTarget);
      return;
    }

    unlockUnderlyingApp();
    setIsMounted(false);
  }, [beginCycle, unlockUnderlyingApp]);

  if (!isMounted) return null;

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
