import { fireEvent, render, screen, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";

import { MotionProvider } from "@/components/motion/motion-provider";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SkipLink } from "@/components/site/skip-link";

describe("site shell", () => {
  it("提供主导航、跳过导航和正文目标", () => {
    render(
      <MotionProvider>
        <SkipLink />
        <SiteHeader />
        <main id="main-content" tabIndex={-1}>
          页面内容
        </main>
      </MotionProvider>,
    );

    expect(screen.getByRole("link", { name: "跳到主要内容" })).toHaveAttribute(
      "href",
      "#main-content",
    );
    expect(document.querySelector("main#main-content")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "项目" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "关于" }).length).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: "简历与联系" }).length,
    ).toBeGreaterThan(0);
  });

  it("移动菜单按钮有可访问名称且不依赖动画切换", () => {
    const { container, unmount } = render(<SiteHeader />);
    const shell = within(container);

    const trigger = shell.getByRole("button", { name: "打开导航菜单" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(trigger);

    expect(
      shell.getAllByRole("button", { name: "关闭导航菜单" })[0],
    ).toHaveAttribute("aria-expanded", "true");
    const panel = shell.getByRole("dialog", { name: "移动导航" });
    expect(panel).toBeVisible();
    fireEvent.click(within(panel).getByRole("button", { name: "关闭导航菜单" }));
    unmount();
  });

  it("桌面头部与页脚导航链接使用真实的 44px 触控目标", () => {
    const header = render(<SiteHeader />);
    const footer = render(<SiteFooter />);
    const links = [
      ...within(header.container).getByRole("navigation", { name: "主导航" }).querySelectorAll("a"),
      ...within(footer.container).getByRole("navigation", { name: "页脚导航" }).querySelectorAll("a"),
    ];
    const css = readFileSync(
      resolve(process.cwd(), "src/app/globals.css"),
      "utf8",
    );

    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => expect(link).toHaveClass("touch-target"));
    expect(css).toMatch(
      /\.touch-target\s*\{[^}]*min-width:\s*44px;[^}]*min-height:\s*44px;[^}]*padding-inline:/,
    );
  });

  it("移动菜单锁定页面滚动，并在首尾焦点间循环", () => {
    const previousOverflow = document.body.style.overflow;
    const { container, unmount } = render(<SiteHeader />);
    const shell = within(container);
    fireEvent.click(shell.getByRole("button", { name: "打开导航菜单" }));

    const panel = shell.getByRole("dialog", { name: "移动导航" });
    const panelScope = within(panel);
    const first = panelScope.getByRole("button", { name: "关闭导航菜单" });
    const links = panelScope.getAllByRole("link");
    const last = links.at(-1);

    expect(document.body.style.overflow).toBe("hidden");
    expect(first).toHaveFocus();
    expect(last).toBeDefined();

    last?.focus();
    fireEvent.keyDown(window, { key: "Tab" });
    expect(first).toHaveFocus();

    first.focus();
    fireEvent.keyDown(window, { key: "Tab", shiftKey: true });
    expect(last).toHaveFocus();

    unmount();
    expect(document.body.style.overflow).toBe(previousOverflow);
  });

  it("移动菜单支持 Esc 与选择导航后关闭，并恢复触发按钮焦点", () => {
    const previousOverflow = document.body.style.overflow;
    const { container } = render(<SiteHeader />);
    const shell = within(container);
    const trigger = shell.getByRole("button", { name: "打开导航菜单" });

    fireEvent.click(trigger);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(shell.queryByRole("dialog", { name: "移动导航" })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe(previousOverflow);

    fireEvent.click(trigger);
    const panel = shell.getByRole("dialog", { name: "移动导航" });
    const projectLink = within(panel).getByRole("link", { name: /项目/ });
    projectLink.addEventListener("click", (event) => event.preventDefault(), {
      once: true,
    });
    fireEvent.click(projectLink);
    expect(shell.queryByRole("dialog", { name: "移动导航" })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe(previousOverflow);
  });

  it("首帧同步当前滚动位置，并在卸载时移除滚动监听", () => {
    const originalScrollY = window.scrollY;
    Object.defineProperty(window, "scrollY", { configurable: true, value: 80 });
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const { container, unmount } = render(<SiteHeader />);
    const header = container.querySelector("header");
    const scrollRegistration = addSpy.mock.calls.find(([event]) => event === "scroll");
    const source = readFileSync(
      resolve(process.cwd(), "src/components/site/site-header.tsx"),
      "utf8",
    );

    expect(header).toHaveAttribute("data-transparent", "false");
    expect(scrollRegistration).toBeDefined();
    expect(source).toMatch(/useState\(false\)/);
    expect(source).not.toMatch(/useState\(\s*\(\)\s*=>[^)]*window\.scrollY/);
    unmount();
    expect(removeSpy).toHaveBeenCalledWith("scroll", scrollRegistration?.[1]);

    addSpy.mockRestore();
    removeSpy.mockRestore();
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: originalScrollY,
    });
  });

  it("页脚在未获公开批准时不渲染联系链接或虚构信息", () => {
    const { container } = render(<SiteFooter />);

    expect(container.querySelector('a[href^="mailto:"]')).not.toBeInTheDocument();
    expect(container.querySelector('a[href^="tel:"]')).not.toBeInTheDocument();
    expect(within(container).getByText(/公开版未展示联系方式/)).toBeInTheDocument();
  });
});
