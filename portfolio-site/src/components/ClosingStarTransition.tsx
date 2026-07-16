import type { Ref } from "react";
import TextPressure from "./TextPressure";

type ClosingStarTransitionProps = {
  portalRef: Ref<HTMLElement>;
};

export default function ClosingStarTransition({ portalRef }: ClosingStarTransitionProps) {
  return (
    <section
      className="star-closing"
      ref={portalRef}
      aria-label="THANKS 结尾过渡"
    >
      <div className="star-closing__sticky">
        <div className="star-closing__black" aria-hidden="true" />
        <div className="star-closing__thanks" aria-label="THANKS">
          <div className="star-closing__pressure">
            <TextPressure
              text="THANKS"
              flex
              alpha={false}
              stroke={false}
              width
              weight
              italic
              textColor="#fffaf1"
              strokeColor="#d5ad58"
              minFontSize={36}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
