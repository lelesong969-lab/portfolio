import type { Language } from "../language";

type PositioningMarkProps = {
  language: Language;
  english: string;
  chinese: string;
  className?: string;
};

function PositioningMark({
  language,
  english,
  chinese,
  className = "",
}: PositioningMarkProps) {
  return (
    <div className={`positioning-mark ${className}`} role="group" aria-label={language === "en" ? english : `${chinese} — ${english}`}>
      {language === "zh" && <p className="positioning-mark__cn" lang="zh-CN">{chinese}</p>}
      <p className="positioning-mark__en" lang="en">{english}</p>
    </div>
  );
}

export default PositioningMark;
