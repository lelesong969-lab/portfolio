import { expect, type Page } from "@playwright/test";

export const projectRoutes = [
  {
    slug: "hotel-service-system",
    title: "酒店门把手与服务系统",
    nextSlug: "car-vacuum",
  },
  {
    slug: "car-vacuum",
    title: "车载吸尘器",
    nextSlug: "healing-glove",
  },
  {
    slug: "healing-glove",
    title: "老年疗愈智能手套",
    nextSlug: "biomaterial-experiments",
  },
  {
    slug: "biomaterial-experiments",
    title: "生物材料实验",
    nextSlug: "coffee-grinder",
  },
  {
    slug: "coffee-grinder",
    title: "手摇咖啡磨豆机",
    nextSlug: null,
  },
] as const;

export const publicRoutes = [
  "/",
  "/projects",
  ...projectRoutes.map(({ slug }) => `/projects/${slug}`),
  "/about",
  "/resume",
] as const;

export async function gotoStable(page: Page, path: string) {
  const response = await page.goto(path, { waitUntil: "domcontentloaded" });

  expect(response, `missing navigation response for ${path}`).not.toBeNull();
  expect(response?.status(), `${path} should return 200`).toBe(200);
  await page.waitForLoadState("networkidle");
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

export async function prepareVisualCapture(page: Page, path: string) {
  await gotoStable(page, path);

  await page.evaluate(async () => {
    const pause = (milliseconds: number) =>
      new Promise((resolve) => window.setTimeout(resolve, milliseconds));
    const step = Math.max(240, Math.floor(window.innerHeight * 0.72));

    for (let position = 0; position < document.documentElement.scrollHeight; position += step) {
      window.scrollTo(0, position);
      await pause(45);
    }
  });

  await page.waitForLoadState("networkidle");
  const brokenImages = await page.evaluate(async () => {
    const visibleImages = Array.from(document.images).filter(
      (image) => image.getClientRects().length > 0,
    );

    await Promise.all(
      visibleImages.map(async (image) => {
        if (!image.complete) {
          await new Promise<void>((resolve) => {
            image.addEventListener("load", () => resolve(), { once: true });
            image.addEventListener("error", () => resolve(), { once: true });
          });
        }

        try {
          await image.decode();
        } catch {
          // The natural-width assertion below reports any image that failed to decode.
        }
      }),
    );
    const broken = visibleImages
      .filter((image) => image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    window.scrollTo(0, 0);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    return broken;
  });

  expect(brokenImages, `${path} contains broken visible images`).toEqual([]);
}
