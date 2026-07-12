const forbiddenPatterns = [
  {
    label: "email link",
    pattern: /(?:href\s*[:=]\s*(?:["'`])?|["'`])mailto:/i,
  },
  {
    label: "telephone link",
    pattern: /(?:href\s*[:=]\s*(?:["'`])?|["'`])tel:/i,
  },
  {
    label: "generic email address",
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  },
  { label: "mainland mobile number", pattern: /\b(?:\+?86[-\s]?)?1[3-9]\d{9}\b/ },
  {
    label: "grouped mobile number",
    pattern: /\b(?:\+?86[-\s]?)?1[3-9]\d[-\s]\d{4}[-\s]\d{4}\b/,
  },
  {
    label: "grouped telephone number",
    pattern: /\b(?:\+?86[-\s]?)?0\d{2,3}[-\s]\d{7,8}\b/,
  },
  { label: "historical English alias", pattern: /Eric\s+Song/i },
  {
    label: "Windows absolute path",
    pattern: /\b[A-Z]:[\\/](?=[^\\/"'\s])/i,
  },
  {
    label: "user home path",
    pattern: /(?:[A-Z]:[\\/](?:Users|Documents and Settings)[\\/][^\\/\s"'<>]+[\\/]|\/(?:Users|home)\/[^/\s"'<>]+\/)/i,
  },
  {
    label: "sensitive browser directory name",
    pattern: /\b(?:chrome|browser)[_-]profile(?:[-_][a-z0-9]+)*\b/i,
  },
  { label: "unsupported vacuum RPM", pattern: /38[,\.\s]?000\s*RPM/i },
  { label: "unsupported vacuum pressure", pattern: /25\s*kPa/i },
  { label: "unsupported airflow efficiency", pattern: /气流效率.{0,24}40\s*%/i },
  {
    label: "unsupported dust separation",
    pattern: /尘气分离率.{0,24}99(?:\.97)?\s*%/i,
  },
  { label: "unsupported degradation rate", pattern: /自然降解率.{0,24}92\s*%/i },
  { label: "unsupported emissions reduction", pattern: /减排.{0,24}87\s*%/i },
  { label: "unsupported particle capture", pattern: /0\.6\s*(?:μm|µm|um)/i },
  { label: "unsupported uplift", pattern: /提升.{0,24}40\s*%/i },
  { label: "unsupported market price", pattern: /[¥￥]\s*(?:998|668)\b/i },
  { label: "unsupported launched outcome", pattern: /已经落地|投入运营/i },
  { label: "unsupported medical-device claim", pattern: /(?<!非)医疗器械/i },
];

module.exports = { forbiddenPatterns };
