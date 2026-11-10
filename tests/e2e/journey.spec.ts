import { expect, test, type Page } from "@playwright/test";

function cv(name: string) {
  return { name, mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.7\n%%EOF\n") };
}
async function upload(page: Page, name: string) {
  await page.locator('input[name="cv"]').setInputFiles(cv(name));
}

test("hồ sơ, JD, đối chiếu, cột mốc và lịch sử sau khi tải lại", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/profile$/);
  await page.getByLabel("Chuyên ngành").fill("Công nghệ thông tin");
  await page.getByLabel("Kỹ năng").fill("HTML");
  await page.getByRole("button", { name: "Thêm khoảng giờ" }).click();
  await page.locator('input[name="cv"]').setInputFiles({ name: "bad.pdf", mimeType: "application/pdf", buffer: Buffer.from("invalid") });
  await page.getByRole("button", { name: "Lưu hồ sơ" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "CV cần là tệp PDF hợp lệ" })).toBeVisible();
  await expect(page.getByLabel("Chuyên ngành")).toHaveValue("Công nghệ thông tin");
  await page.getByRole("button", { name: "Bỏ tệp đã chọn" }).click();
  await page.getByRole("button", { name: "Lưu hồ sơ" }).click();
  await expect(page).toHaveURL(/\/journey$/);
  await expect(page.getByText("Tạo hồ sơ đầu tiên").first()).toBeVisible();

  await page.getByRole("link", { name: "Khám phá tuyển dụng" }).click();
  await page.getByRole("link", { name: /Thực tập sinh Frontend/ }).click();
  await page.getByRole("button", { name: "Xác nhận yêu cầu và xem mức độ phù hợp" }).click();
  await expect(page).toHaveURL(/\/jobs\/frontend-demo\/match$/);
  await expect(page.getByText("80%", { exact: true })).toBeVisible();
  await page.getByLabel("Mức đáp ứng cho HTML").selectOption("GAP");
  await page.getByRole("button", { name: "Lưu để xem sau" }).click();
  await expect(page.getByText("Yêu cầu bắt buộc cần bổ sung")).toBeVisible();
  await expect(page.getByText("40%", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Tạo cột mốc cải thiện" }).click();
  await expect(page.getByLabel("Tên cột mốc")).toHaveValue("Bổ sung: HTML");
  await page.getByRole("link", { name: "Hủy", exact: true }).click();
  await expect(page).toHaveURL(/\/jobs\/frontend-demo\/match$/);
  await page.getByRole("link", { name: "Tạo cột mốc cải thiện" }).click();
  await page.getByLabel("Tên cột mốc").fill("Ôn HTML");
  await page.getByRole("button", { name: "Lưu cột mốc" }).click();
  await page.getByRole("link", { name: /Ôn HTML/ }).click();
  await page.getByLabel("Điều đã học").fill("Đã luyện thẻ HTML ngữ nghĩa.");
  await page.getByRole("button", { name: "Hoàn thành và lưu ghi nhận" }).click();
  await expect(page.getByText("1 / 1 cột mốc đã hoàn thành")).toBeVisible();
  await expect(page.getByText("Đã luyện thẻ HTML ngữ nghĩa.")).toBeVisible();

  await page.getByRole("link", { name: "Cập nhật hồ sơ" }).click();
  await upload(page, "cv-dau.pdf");
  await page.getByRole("button", { name: "Lưu hồ sơ" }).click();
  await expect(page.getByText("Lưu CV đầu tiên")).toBeVisible();
  await page.getByRole("link", { name: "Cập nhật hồ sơ" }).click();
  await page.getByLabel("Kỹ năng").fill("HTML, React");
  await upload(page, "cv-moi.pdf");
  await page.getByRole("button", { name: "Lưu hồ sơ" }).click();
  await expect(page.getByText("CV: cv-moi.pdf")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Đã luyện thẻ HTML ngữ nghĩa.")).toBeVisible();
  await expect(page.getByText("CV: cv-moi.pdf")).toBeVisible();
  await page.getByRole("link", { name: /Phù hợp 40%/ }).click();
  await expect(page.getByText(/Đây là kết quả đã ghi nhận/)).toBeVisible();
  await page.getByRole("link", { name: "Mở kết quả hiện tại" }).click();
  await expect(page.getByText("100%", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Sửa yêu cầu tuyển dụng" }).click();
  await page.getByLabel("Nội dung yêu cầu").first().fill("TypeScript");
  await page.getByRole("button", { name: "Xác nhận yêu cầu và xem mức độ phù hợp" }).click();
  await expect(page.getByText("60%", { exact: true })).toBeVisible();
  await expect(page.getByText("Yêu cầu bắt buộc cần bổ sung")).toBeVisible();
  await page.getByRole("link", { name: "Xem hành trình" }).click();
  await page.getByRole("link", { name: /Ôn HTML/ }).click();
  await page.getByLabel("Tên cột mốc").fill("Ôn HTML ngữ nghĩa");
  await page.getByRole("button", { name: "Lưu cột mốc" }).click();
  await page.getByRole("link", { name: /Ôn HTML ngữ nghĩa/ }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Xóa cột mốc" }).click();
  await expect(page).toHaveURL(/\/journey$/);
  await expect(page.getByText("Đã luyện thẻ HTML ngữ nghĩa.")).toBeVisible();
  await expect(page.getByRole("link", { name: /Ôn HTML ngữ nghĩa/ })).toHaveCount(0);
});

test("lọc trống, JD thủ công thiếu dữ liệu và hiển thị trên điện thoại", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/jobs");
  await page.getByLabel("Tìm kiếm").fill("không có kết quả");
  await page.getByRole("button", { name: "Lọc tin" }).click();
  await expect(page.getByText("Không có tin phù hợp")).toBeVisible();
  await page.getByRole("link", { name: "Nhập JD", exact: true }).click();
  await page.getByLabel("Tên vị trí").fill("Thực tập kiểm thử");
  await page.getByLabel("Doanh nghiệp").fill("Ví dụ");
  await page.getByRole("button", { name: "Xác nhận yêu cầu và xem mức độ phù hợp" }).click();
  await expect(page.getByRole("heading", { name: "Chưa đủ thông tin để đánh giá" })).toBeVisible();
  expect(await page.locator("body").evaluate((body) => body.scrollWidth)).toBeLessThanOrEqual(390);
  await page.getByRole("link", { name: "Xem hành trình" }).click();
  await page.getByRole("link", { name: "Tạo cột mốc", exact: true }).click();
  await page.getByRole("link", { name: "Hủy", exact: true }).click();
  await expect(page).toHaveURL(/\/journey$/);
});
