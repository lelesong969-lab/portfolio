import { publicContactPrivacyMessage } from "@/content/resume";

interface ContactPrivacyNoticeProps {
  variant?: "page" | "footer";
}

export function ContactPrivacyNotice({
  variant = "page",
}: ContactPrivacyNoticeProps) {
  return (
    <p
      className={
        variant === "footer"
          ? "site-footer__privacy"
          : "m-0 max-w-[42rem] text-sm leading-7 text-[var(--color-muted)]"
      }
    >
      {publicContactPrivacyMessage}
    </p>
  );
}
