"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { MobileMenu } from "@/components/site/mobile-menu";
import { siteContent } from "@/content/site";

export function SiteHeader() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateScrolledState = () => setIsScrolled(window.scrollY > 24);
    updateScrolledState();
    window.addEventListener("scroll", updateScrolledState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolledState);
  }, []);

  const transparent = pathname === "/" && !isScrolled;

  return (
    <header
      className="site-header"
      data-transparent={transparent ? "true" : "false"}
    >
      <div className="site-header__inner page-shell">
        <Link className="site-header__brand" href="/" aria-label="Leyang Song 首页">
          Leyang Song
        </Link>
        <nav className="site-header__nav" aria-label="主导航">
          <ul>
            {siteContent.navigation.map((item) => (
              <li key={item.href}>
                <Link className="touch-target" href={item.href} prefetch={false}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <MobileMenu />
      </div>
    </header>
  );
}
