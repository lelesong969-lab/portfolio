export const SPARKLE_PATH =
  "M0 -100 C8 -52 31 -30 54 -18 C30 -8 16 -3 12 0 C16 3 30 8 54 18 C31 30 8 52 0 100 C-8 52 -31 30 -54 18 C-30 8 -16 3 -12 0 C-16 -3 -30 -8 -54 -18 C-31 -30 -8 -52 0 -100 Z";

type SparkleMarkProps = {
  className?: string;
  title?: string;
};

function SparkleMark({ className = "", title }: SparkleMarkProps) {
  return (
    <svg
      className={`sparkle-mark ${className}`}
      viewBox="-100 -100 200 200"
      aria-hidden={title ? undefined : "true"}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      <path d={SPARKLE_PATH} />
    </svg>
  );
}

export default SparkleMark;
