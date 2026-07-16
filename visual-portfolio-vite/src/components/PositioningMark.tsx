type PositioningMarkProps = {
  chinese?: string;
  english?: string;
  className?: string;
};

function PositioningMark({
  chinese = "数据分析 / 产品与业务 / 商业分析",
  english = "DATA ANALYSIS / PRODUCT & BUSINESS / BUSINESS ANALYSIS",
  className = "",
}: PositioningMarkProps) {
  return (
    <div className={`positioning-mark ${className}`} role="group" aria-label={`${chinese} — ${english}`}>
      <p className="positioning-mark__cn" lang="zh-CN">{chinese}</p>
      <p className="positioning-mark__en" lang="en">{english}</p>
    </div>
  );
}

export default PositioningMark;
