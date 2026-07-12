"use client";

import Image from "next/image";
import { useEffect, useId, useRef } from "react";

import type { BoundedProjectMedia } from "@/content/types";

interface LightboxProps {
  media: Extract<BoundedProjectMedia, { purpose: "lightbox" }>;
}

export function Lightbox({ media }: LightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousOverflow = useRef("");
  const captionId = useId();
  const summaryId = useId();

  function releaseDialog() {
    document.body.style.overflow = previousOverflow.current;
    openerRef.current?.focus();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  function openDialog() {
    const dialog = dialogRef.current;
    if (!dialog) return;

    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    closeRef.current?.focus();
  }

  useEffect(
    () => () => {
      document.body.style.overflow = previousOverflow.current;
    },
    [],
  );

  return (
    <figure
      className="mx-auto m-0 w-full min-w-0 max-w-full"
      style={{ maxWidth: `${media.maxCssWidth}px` }}
    >
      <button
        ref={openerRef}
        type="button"
        className="relative inline-flex min-h-11 min-w-11 max-w-full cursor-zoom-in justify-center border-0 bg-transparent p-0"
        aria-label={`放大查看：${media.alt}`}
        aria-describedby={summaryId}
        onClick={openDialog}
      >
        <Image
          className="h-auto max-w-full object-contain"
          src={media.src}
          width={media.width}
          height={media.height}
          sizes="(min-width: 1024px) 64vw, 100vw"
          alt=""
          style={{
            width: "auto",
            height: "auto",
            maxWidth: "100%",
            maxHeight: `${media.maxCssHeight}px`,
          }}
        />
      </button>
      <figcaption className="mt-3">{media.caption}</figcaption>
      <p
        id={summaryId}
        className="mt-2 max-w-[48rem] text-sm text-[var(--color-muted)]"
      >
        {media.htmlSummary}
      </p>

      <dialog
        ref={dialogRef}
        aria-labelledby={captionId}
        aria-describedby={summaryId}
        className="m-auto max-h-[92vh] w-[min(92vw,1200px)] border border-[var(--color-divider)] bg-[var(--color-surface)] p-4 backdrop:bg-black/70"
        onClose={releaseDialog}
        onCancel={(event) => {
          event.preventDefault();
          closeDialog();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDialog();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            closeDialog();
            return;
          }

          if (event.key === "Tab") {
            const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            );
            if (!focusable?.length) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first.focus();
            }
          }
        }}
      >
        <div className="mb-3 flex items-center justify-between gap-4">
          <a
            className="inline-flex min-h-11 min-w-11 items-center px-2 text-sm font-medium"
            href={media.src}
            target="_blank"
            rel="noreferrer"
          >
            在新标签查看原图
          </a>
          <button
            ref={closeRef}
            type="button"
            className="min-h-11 min-w-11 border border-[var(--color-interactive-border)] bg-transparent px-3"
            aria-label="关闭大图"
            onClick={closeDialog}
          >
            关闭
          </button>
        </div>
        <Image
          className="mx-auto h-auto max-w-full object-contain"
          src={media.src}
          width={media.width}
          height={media.height}
          sizes="92vw"
          alt={media.alt}
          style={{
            width: "auto",
            height: "auto",
            maxWidth: `${media.maxCssWidth}px`,
            maxHeight: `${media.maxCssHeight}px`,
          }}
        />
        <p id={captionId} className="mb-0 mt-3 text-sm text-[var(--color-muted)]">
          {media.caption}
        </p>
      </dialog>
    </figure>
  );
}
