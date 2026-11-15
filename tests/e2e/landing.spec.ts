import { expect, test } from "@playwright/test";

test("UI Michii mới nối với ứng dụng và giữ bản trải nghiệm mẫu", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Đi từng bước nhỏ.");
  await expect(page.locator(".topbar")).toHaveCount(0);
  await expect(page.locator(".header")).toBeVisible();
  await expect(page.getByRole("link", { name: "Theo dõi các đơn đã nộp" })).toHaveAttribute("href", "/applications");
  await page.getByRole("button", { name: "Xem bản mẫu nhanh" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Xem bản mẫu nhanh" })).toBeFocused();
  const tabs = page.getByRole("tablist", { name: "Các bước trải nghiệm" });
  await tabs.getByRole("tab").first().press("ArrowRight");
  await expect(tabs.getByRole("tab").nth(1)).toHaveAttribute("aria-selected", "true");
  await page.getByRole("link", { name: "Bắt đầu hành trình", exact: true }).click();
  await expect(page).toHaveURL(/\/journey$/);
  await expect(page.getByRole("heading", { name: "Hành trình tìm việc", exact: true })).toBeVisible();
  await page.getByRole("link", { name: /Michii HƯỚNG NGHIỆP/ }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Đi từng bước nhỏ.");
  expect(errors).toEqual([]);
});

test("menu di động và tài nguyên landing hoạt động ở 360px", async ({ page, request }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  await page.getByRole("button", { name: "Mở menu" }).click();
  const menu = page.getByRole("navigation", { name: "Điều hướng di động" });
  await expect(menu).toBeVisible();
  await menu.getByRole("link", { name: "Vì sao Michii?" }).click();
  await expect(menu).not.toBeVisible();
  expect(await page.locator("body").evaluate((body) => body.scrollWidth)).toBeLessThanOrEqual(360);
  for (const path of ["styles.css", "app.js", "assets/favicon.svg", "assets/noto-sans-vietnamese.woff"]) {
    expect((await request.get(`/landing/${path}`)).status()).toBe(200);
  }
});
