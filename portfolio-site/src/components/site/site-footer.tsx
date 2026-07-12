import Link from "next/link";

import { ContactPrivacyNotice } from "@/components/site/contact-privacy-notice";
import { siteContent } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner page-shell">
        <div>
          <p className="site-footer__name">{siteContent.name}</p>
          <p className="site-footer__positioning">研究、整理与产品判断</p>
        </div>

        <ContactPrivacyNotice variant="footer" />

        <nav className="site-footer__nav" aria-label="页脚导航">
          {siteContent.navigation.map((item) => (
            <Link
              className="touch-target"
              key={item.href}
              href={item.href}
              prefetch={false}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
