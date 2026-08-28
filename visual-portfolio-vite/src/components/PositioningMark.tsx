import type { Language } from "../language";

type PositioningMarkProps = {
  language: Language;
  text: string;
  className?: string;
};

function PositioningMark({
  language,
  text,
  className = "",
}: PositioningMarkProps) {
  return (
    <div className={`positioning-mark ${className}`} role="group" aria-label={text}>
      <p
        className={language === "en" ? "positioning-mark__en" : "positioning-mark__cn"}
        lang={language === "en" ? "en" : "zh-CN"}
      >
        {text}
      </p>
    </div>
  );
}

export default PositioningMark;
