import Image from "next/image";

import type { BoundedProjectMedia } from "@/content/types";

interface BoundedProjectImageProps {
  media: BoundedProjectMedia;
  figureClass?: string;
  imageClass?: string;
  caption?: boolean;
  sizes?: string;
}

export function BoundedProjectImage({
  media,
  figureClass = "",
  imageClass = "",
  caption = true,
  sizes = "(min-width: 1024px) 64vw, 100vw",
}: BoundedProjectImageProps) {
  return (
    <figure
      className={`mx-auto m-0 w-full min-w-0 max-w-full ${figureClass}`.trim()}
      style={{ maxWidth: `${media.maxCssWidth}px` }}
    >
      <Image
        className={`mx-auto h-auto max-w-full object-contain ${imageClass}`.trim()}
        src={media.src}
        width={media.width}
        height={media.height}
        sizes={sizes}
        alt={media.alt}
        style={{
          width: "auto",
          height: "auto",
          maxWidth: "100%",
          maxHeight: `${media.maxCssHeight}px`,
        }}
      />
      {caption ? <figcaption className="mt-3">{media.caption}</figcaption> : null}
    </figure>
  );
}
