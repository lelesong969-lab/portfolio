import type { Metadata } from "next";
import { Noto_Sans_SC } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

import { MotionProvider } from "@/components/motion/motion-provider";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { RouteFocus } from "@/components/site/route-focus";
import { SkipLink } from "@/components/site/skip-link";
import { siteConfig } from "@/lib/seo";

const notoSansSc = Noto_Sans_SC({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Leyang Song｜作品集",
    template: "%s｜Leyang Song",
  },
  description: "以工业设计训练为基础，呈现用户研究、信息整理与产品判断过程。",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-CN" className={notoSansSc.variable}>
      <body>
        <MotionProvider>
          <RouteFocus />
          <SkipLink />
          <SiteHeader />
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
          <SiteFooter />
        </MotionProvider>
      </body>
    </html>
  );
}
