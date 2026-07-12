import type { Metadata } from "next";

import { EvidenceStrip } from "@/components/home/evidence-strip";
import { FeaturedProjects } from "@/components/home/featured-projects";
import { HomeHero } from "@/components/home/home-hero";
import { MoreProjects } from "@/components/home/more-projects";
import { projects } from "@/content/projects";
import { siteContent } from "@/content/site";
import { getFeaturedProjects } from "@/lib/projects";
import {
  createPersonJsonLd,
  createStaticMetadata,
  StructuredData,
} from "@/lib/seo";

export const metadata: Metadata = createStaticMetadata("home");

export default function HomePage() {
  const featuredProjects = getFeaturedProjects();
  const heroProject = featuredProjects[0];
  const moreProjects = projects.filter((project) => !project.featured);

  return (
    <>
      <StructuredData data={createPersonJsonLd()} />
      <HomeHero project={heroProject} />
      <EvidenceStrip groups={siteContent.capabilityGroups} />
      <FeaturedProjects projects={featuredProjects} />
      <MoreProjects projects={moreProjects} />
    </>
  );
}
