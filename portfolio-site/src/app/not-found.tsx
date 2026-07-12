import Link from "next/link";

export default function NotFoundPage() {
  return (
    <section className="page-shell section-space min-h-[65vh]" aria-labelledby="not-found-heading">
      <p className="mb-4 text-xs font-bold tracking-[0.2em] text-[var(--color-muted)]">404</p>
      <h1 id="not-found-heading">页面未找到</h1>
      <p className="type-lead mb-10 text-[var(--color-muted)]">
        这个地址不存在，或对应页面尚未开放。你可以返回首页，或继续浏览五个项目。
      </p>
      <div className="flex flex-wrap gap-6">
        <Link className="inline-flex min-h-11 items-center border-b border-current font-medium" href="/">
          返回首页
        </Link>
        <Link
          className="inline-flex min-h-11 items-center border-b border-current font-medium"
          href="/projects"
        >
          查看项目总览
        </Link>
      </div>
    </section>
  );
}
