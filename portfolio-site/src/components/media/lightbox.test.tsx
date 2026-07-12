import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  expectTypeOf,
  it,
  vi,
} from "vitest";

import { Lightbox } from "@/components/media/lightbox";
import type { BoundedProjectMedia } from "@/content/types";

const media = {
  src: "/projects/hotel/system-map.webp" as const,
  width: 1920,
  height: 1080,
  alt: "酒店服务系统关系图",
  caption: "实体触点与服务响应的概念系统图",
  purpose: "lightbox" as const,
  maxCssWidth: 777,
  maxCssHeight: 444,
  htmlSummary:
    "图中把实体触点与服务响应连接起来；这是概念系统，尚未完成真实服务验证。",
};

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function close(this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  });
});

afterEach(() => {
  cleanup();
  document.body.style.overflow = "";
});

describe("Lightbox", () => {
  it("accepts only lightbox media and gets its HTML summary from that record", () => {
    type LightboxMedia = Extract<BoundedProjectMedia, { purpose: "lightbox" }>;

    expectTypeOf<ComponentProps<typeof Lightbox>>().toEqualTypeOf<{
      media: LightboxMedia;
    }>();
    expect(media.htmlSummary).not.toBe(media.alt);
  });

  it("applies the same content-defined bounds to the trigger and dialog images", () => {
    render(<Lightbox media={media} />);

    const opener = screen.getByRole("button", { name: `放大查看：${media.alt}` });
    const triggerImage = opener.querySelector("img");
    const dialogImage = screen.getByRole("img", { name: media.alt, hidden: true });
    const figure = opener.closest("figure");

    expect(figure).toHaveStyle({ maxWidth: `${media.maxCssWidth}px` });
    expect(figure).toHaveClass("min-w-0", "max-w-full");
    expect(triggerImage).toHaveStyle({
      maxWidth: "100%",
      maxHeight: `${media.maxCssHeight}px`,
      width: "auto",
      height: "auto",
    });
    expect(dialogImage).toHaveStyle({
      maxWidth: `${media.maxCssWidth}px`,
      maxHeight: `${media.maxCssHeight}px`,
      width: "auto",
      height: "auto",
    });
    for (const image of [triggerImage, dialogImage]) {
      expect(image).toHaveClass("object-contain");
      expect(image).not.toHaveClass("w-full");
    }
  });

  it("opens a native dialog with alt, caption and an always-available HTML summary", () => {
    render(<Lightbox media={media} />);

    const summary = screen.getByText(media.htmlSummary);
    expect(summary).toBeVisible();
    expect(summary.closest("dialog")).toBeNull();

    const opener = screen.getByRole("button", { name: "放大查看：酒店服务系统关系图" });
    expect(opener).toHaveClass("min-h-11", "min-w-11");
    expect(opener).toHaveAttribute("aria-describedby", summary.id);
    fireEvent.click(opener);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("open");
    expect(dialog).toHaveAttribute("aria-describedby", summary.id);
    expect(screen.getByRole("img", { name: media.alt })).toBeInTheDocument();
    expect(screen.getAllByText(media.caption)).toHaveLength(2);
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("closes on Escape, restores focus and releases the body scroll lock", () => {
    render(<Lightbox media={media} />);
    const opener = screen.getByRole("button", { name: /放大查看/ });

    opener.focus();
    fireEvent.click(opener);
    const dialog = screen.getByRole("dialog");
    fireEvent.keyDown(dialog, { key: "Escape" });

    expect(dialog).not.toHaveAttribute("open");
    expect(opener).toHaveFocus();
    expect(document.body.style.overflow).toBe("");
  });

  it("wraps focus from the first and last controls and closes by button", () => {
    render(<Lightbox media={media} />);
    const opener = screen.getByRole("button", { name: /放大查看/ });
    fireEvent.click(opener);

    const dialog = screen.getByRole("dialog");
    const originalLink = screen.getByRole("link", { name: "在新标签查看原图" });
    const closeButton = screen.getByRole("button", { name: "关闭大图" });

    expect(originalLink).toHaveAttribute("href", media.src);
    expect(originalLink).toHaveAttribute("target", "_blank");
    expect(originalLink).toHaveAttribute("rel", "noreferrer");
    expect(originalLink).toHaveClass("min-h-11", "min-w-11");

    originalLink.focus();
    const backwardResult = fireEvent.keyDown(dialog, {
      key: "Tab",
      shiftKey: true,
    });
    expect(backwardResult).toBe(false);
    expect(closeButton).toHaveFocus();

    closeButton.focus();
    const forwardResult = fireEvent.keyDown(dialog, { key: "Tab" });
    expect(forwardResult).toBe(false);
    expect(originalLink).toHaveFocus();

    fireEvent.click(closeButton);
    expect(dialog).not.toHaveAttribute("open");
    expect(opener).toHaveFocus();
  });
});
