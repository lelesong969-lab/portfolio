export const isDesktopWeChat = () => {
  if (typeof navigator === "undefined") return false;
  const userAgent = navigator.userAgent;
  return /MicroMessenger/i.test(userAgent) && !/(Android|iPhone|iPad|iPod)/i.test(userAgent);
};

export const supportsAdvancedVisualEffects = () => {
  if (typeof window === "undefined" || isDesktopWeChat()) return false;
  return (
    typeof window.requestAnimationFrame === "function" &&
    typeof window.matchMedia === "function" &&
    typeof window.IntersectionObserver === "function" &&
    typeof window.ResizeObserver === "function" &&
    typeof document.fonts?.ready?.then === "function"
  );
};
