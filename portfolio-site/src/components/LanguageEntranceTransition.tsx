import { useCallback, useEffect, useRef } from "react";
import type { Language } from "../language";
import { LanguageEntranceTransition as EntranceOverlay } from "./OpeningAnimation";

type LanguageEntranceTransitionProps = {
  targetLanguage: Language | null;
  onCovered: (language: Language) => void;
  onFinish: () => void;
};

export default function LanguageEntranceTransition({
  targetLanguage,
  onCovered,
  onFinish,
}: LanguageEntranceTransitionProps) {
  const inertRootRef = useRef<{ element: HTMLElement; owned: boolean; hadAttribute: boolean } | null>(null);
  const targetRef = useRef<Language | null>(null);

  const unlockUnderlyingApp = useCallback(() => {
    const lock = inertRootRef.current;
    inertRootRef.current = null;
    if (!lock?.owned) return;
    lock.element.inert = false;
    if (!lock.hadAttribute) lock.element.removeAttribute("inert");
  }, []);

  useEffect(() => () => unlockUnderlyingApp(), [unlockUnderlyingApp]);

  useEffect(() => {
    if (targetLanguage === null) return;

    targetRef.current = targetLanguage;
    const root = document.getElementById("root");
    if (!root || inertRootRef.current) return;

    const hadAttribute = root.hasAttribute("inert");
    const alreadyInert = root.inert || hadAttribute;
    if (!alreadyInert) root.inert = true;
    if (!hadAttribute) root.setAttribute("inert", "");
    inertRootRef.current = { element: root, owned: !alreadyInert, hadAttribute };
  }, [targetLanguage]);

  const handleCovered = useCallback(() => {
    if (targetRef.current !== null) onCovered(targetRef.current);
  }, [onCovered]);

  const handleFinish = useCallback(() => {
    targetRef.current = null;
    unlockUnderlyingApp();
    onFinish();
  }, [onFinish, unlockUnderlyingApp]);

  if (targetLanguage === null) return null;

  return <EntranceOverlay onCovered={handleCovered} onFinish={handleFinish} />;
}
