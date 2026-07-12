import type { MetadataRoute } from "next";

import { absoluteUrl, getPublicRoutes } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return getPublicRoutes().map((route) => ({ url: absoluteUrl(route) }));
}
