"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function RouteFocus() {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (previousPathname.current === pathname) return;

    previousPathname.current = pathname;
    const frame = requestAnimationFrame(() => {
      const main = document.querySelector<HTMLElement>("main#main-content");
      const heading = main?.querySelector<HTMLElement>("h1");
      const destination = heading ?? main;

      if (!destination) return;
      if (destination === heading && !destination.hasAttribute("tabindex")) {
        destination.setAttribute("tabindex", "-1");
      }
      destination.focus({ preventScroll: true });
    });

    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
