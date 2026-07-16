import SparkleMark from "./SparkleMark";
import ScrollFloat from "./ScrollFloat";

type EditorialWordmarkProps = {
  text: string;
  className?: string;
  splitWords?: boolean;
  animated?: boolean;
  stagger?: number;
};

function EditorialWordmark({
  text,
  className = "",
  splitWords = false,
  animated = false,
  stagger = 0.03,
}: EditorialWordmarkProps) {
  const words = text.split(" ");

  return (
    <div className={`editorial-wordmark ${className}`}>
      {animated ? (
        <ScrollFloat
          containerClassName="editorial-wordmark__float"
          textClassName="editorial-wordmark__label"
          animationDuration={1}
          ease="back.inOut(2)"
          scrollStart="center bottom+=50%"
          scrollEnd="bottom bottom-=40%"
          stagger={stagger}
          scrub
        >
          {text}
        </ScrollFloat>
      ) : (
        <p className="editorial-wordmark__label" aria-label={text}>
          <span aria-hidden="true">
            {splitWords
              ? words.map((word, index) => (
                  <span data-scroll-reveal-word className="scroll-reveal__word" key={`${word}-${index}`}>
                    {index > 0 && "\u00a0"}{word}
                  </span>
                ))
              : text}
          </span>
        </p>
      )}
      <SparkleMark className="editorial-wordmark__star editorial-wordmark__star--one" />
      <SparkleMark className="editorial-wordmark__star editorial-wordmark__star--two" />
      <SparkleMark className="editorial-wordmark__star editorial-wordmark__star--three" />
    </div>
  );
}

export default EditorialWordmark;
