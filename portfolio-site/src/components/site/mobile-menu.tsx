"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { siteContent } from "@/content/site";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleMenuKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !panelRef.current?.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !panelRef.current?.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleMenuKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleMenuKeyDown);
    };
  }, [isOpen]);

  const closeMenu = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div className="mobile-menu">
      <button
        ref={triggerRef}
        className="mobile-menu__trigger"
        type="button"
        aria-controls="mobile-navigation"
        aria-expanded={isOpen}
        aria-label={isOpen ? "关闭导航菜单" : "打开导航菜单"}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span aria-hidden="true">{isOpen ? "关闭" : "菜单"}</span>
      </button>

      {isOpen ? (
        <div
          ref={panelRef}
          id="mobile-navigation"
          className="mobile-menu__panel"
          role="dialog"
          aria-modal="true"
          aria-label="移动导航"
        >
          <div className="mobile-menu__topline">
            <span>Leyang Song</span>
            <button
              ref={closeRef}
              className="mobile-menu__close"
              type="button"
              aria-label="关闭导航菜单"
              onClick={closeMenu}
            >
              <span aria-hidden="true">关闭</span>
            </button>
          </div>
          <nav aria-label="移动端主导航">
            <ul className="mobile-menu__list">
              {siteContent.navigation.map((item, index) => (
                <li key={item.href}>
                  <Link href={item.href} prefetch={false} onClick={closeMenu}>
                    <span aria-hidden="true">0{index + 1}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
