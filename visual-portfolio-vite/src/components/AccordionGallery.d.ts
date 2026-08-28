import type { ReactNode } from "react";
export type AccordionGalleryItem = { image: string; label?: string; link?: string; alt?: string; itemId?: string };
export interface AccordionGalleryProps {
  items?: AccordionGalleryItem[]; defaultIndex?: number; accentColor?: string; overlayColor?: string; textColor?: string;
  height?: number; gap?: number; radius?: number; expandRatio?: number; orientation?: "horizontal" | "vertical";
  duration?: number; ease?: string; parallax?: number; tilt?: number; stagger?: number; trigger?: "hover" | "click";
  showLabels?: boolean; grayscale?: boolean; className?: string; ariaLabel?: string;
}
export default function AccordionGallery(props: AccordionGalleryProps): ReactNode;
