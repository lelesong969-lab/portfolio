import { ImageResponse } from "next/og";

import { openGraphImageConfig } from "@/lib/seo-config";

export const alt = openGraphImageConfig.alt;
export const size = openGraphImageConfig.size;
export const contentType = openGraphImageConfig.contentType;

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: "#f5f3ee",
        color: "#151817",
      }}
    >
      <div style={{ display: "flex", fontSize: 26, letterSpacing: "0.08em" }}>
        LEYANG SONG / PORTFOLIO
      </div>
      <div style={{ display: "flex", maxWidth: 900, fontSize: 66, lineHeight: 1.2 }}>
        从研究与信息整理中，找到可执行的方向
      </div>
      <div style={{ display: "flex", fontSize: 28, color: "#1f5b8a" }}>
        RESEARCH · SYNTHESIS · PRODUCT JUDGMENT
      </div>
    </div>,
    size,
  );
}
