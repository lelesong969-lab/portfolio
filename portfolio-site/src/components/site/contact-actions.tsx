import { closeSync, existsSync, openSync, readSync } from "node:fs";
import { resolve } from "node:path";

import {
  isValidPublicationApproval,
  type PublicContact,
} from "@/content/resume";
import { ContactPrivacyNotice } from "@/components/site/contact-privacy-notice";

interface ContactActionsProps {
  contact: PublicContact;
  variant?: "page" | "footer";
  ariaLabel?: string;
}

function getSafeHttpsLinks(links: PublicContact["links"]) {
  return links.flatMap((link) => {
    const label = link.label.trim();
    const href = link.href.trim();

    if (!label || !/^https:\/\//i.test(href)) {
      return [];
    }

    try {
      const url = new URL(href);

      if (url.protocol !== "https:" || url.username || url.password) {
        return [];
      }

      return [{ label, href: url.href }];
    } catch {
      return [];
    }
  });
}

function requireApprovedResumePdf(resumePdf: string): string {
  if (!/^\/resume\/[A-Za-z0-9][A-Za-z0-9_-]*\.pdf$/.test(resumePdf)) {
    throw new Error(`Approved resume PDF path is invalid: ${resumePdf}`);
  }

  const publicPath = `public${resumePdf}`;
  const absolutePath = resolve(process.cwd(), "public", resumePdf.slice(1));

  if (!existsSync(absolutePath)) {
    throw new Error(`Approved resume PDF is missing: ${publicPath}`);
  }

  const header = Buffer.alloc(5);
  const descriptor = openSync(absolutePath, "r");
  let bytesRead = 0;

  try {
    bytesRead = readSync(descriptor, header, 0, header.length, 0);
  } finally {
    closeSync(descriptor);
  }

  if (bytesRead !== 5 || header.toString("ascii") !== "%PDF-") {
    throw new Error(
      `Approved resume PDF has an invalid header: ${publicPath}; expected %PDF-`,
    );
  }

  return resumePdf;
}

export function ContactActions({
  contact,
  variant = "page",
  ariaLabel = "已批准的联系入口",
}: ContactActionsProps) {
  const privacyMessage = <ContactPrivacyNotice variant={variant} />;

  if (!isValidPublicationApproval(contact.publicationApproval)) {
    return privacyMessage;
  }

  const approvedFields = new Set(contact.publicationApproval.approvedFields);
  const wrapperClassName =
    variant === "footer"
      ? "site-footer__contact"
      : "flex flex-wrap gap-3 text-sm";
  const linkClassName =
    variant === "footer"
      ? "touch-target"
      : "touch-target border border-[var(--color-interactive-border)] px-4 font-medium no-underline";
  const email = approvedFields.has("email") ? contact.email?.trim() : null;
  const phone = approvedFields.has("phone") ? contact.phone?.trim() : null;
  const safeLinks = approvedFields.has("links")
    ? getSafeHttpsLinks(contact.links)
    : [];
  const resumePdf = approvedFields.has("resumePdf") && contact.resumePdf
    ? requireApprovedResumePdf(contact.resumePdf)
    : null;

  if (!email && !phone && safeLinks.length === 0 && !resumePdf) {
    return privacyMessage;
  }

  return (
    <div className={wrapperClassName} aria-label={ariaLabel}>
      {email ? (
        <a className={linkClassName} href={`mailto:${email}`}>
          邮件
        </a>
      ) : null}
      {phone ? (
        <a className={linkClassName} href={`tel:${phone}`}>
          电话
        </a>
      ) : null}
      {safeLinks.map((link) => (
          <a className={linkClassName} key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      {resumePdf ? (
        <a className={linkClassName} href={resumePdf} download>
          下载 PDF 简历
        </a>
      ) : null}
    </div>
  );
}
