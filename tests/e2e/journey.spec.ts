import { expect, test, type Page } from "@playwright/test";

function cv(name: string) {
  return { name, mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.7\n%%EOF\n") };
}
async function upload(page: Page, name: string) {
  await page.locator('input[name="cv"]').setInputFiles(cv(name));
}

test("hồ sơ, JD, đối chiếu, cột mốc và lịch sử sau khi tải lại", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Michii/);
  await page.getByRole("link", { name: "Bắt đầu hành trình", exact: true }).click();
  await expect(page).toHaveURL(/\/journey$/);
  await page.getByRole("link", { name: "Tạo hồ sơ năng lực", exact: true }).click();
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
  const baseline = page.getByRole("region", { name: "Điểm xuất phát" });
  await expect(baseline.getByRole("link", { name: "Đính kèm CV đầu tiên" })).toBeVisible();

  await page.getByRole("link", { name: "Khám phá tuyển dụng" }).click();
  await page.getByRole("link", { name: /Thực tập sinh Frontend/ }).click();
  await page.getByRole("button", { name: "Xác nhận yêu cầu và xem mức độ phù hợp" }).click();
  await expect(page).toHaveURL(/\/jobs\/frontend-demo\/match$/);
  await expect(page.getByText("80%", { exact: true })).toBeVisible();
  await expect(page.getByText("3/4 tiêu chí đủ thông tin")).toBeVisible();
  await expect(page.getByText("4/5 điểm theo trọng số")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Điểm mạnh 2" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Chưa đáp ứng 1" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Cần xác nhận 1" })).toBeVisible();
  await expect(page.getByText("Hồ sơ của bạn có kỹ năng HTML.", { exact: true })).toBeVisible();
  await expect(page.getByText("Lịch rảnh của bạn bao phủ ca Thứ 2, 09:00–12:00.", { exact: true })).toBeVisible();
  await expect(page.getByText("Hỏi lại nhà tuyển dụng về điều kiện này.")).toBeVisible();
  await page.getByLabel("Mức đáp ứng cho HTML").selectOption("GAP");
  await page.getByRole("button", { name: "Lưu để xem sau" }).click();
  await expect(page.getByText("Yêu cầu bắt buộc cần bổ sung")).toBeVisible();
  await expect(page.getByText("40%", { exact: true })).toBeVisible();
  await expect(page.getByText("2/5 điểm theo trọng số")).toBeVisible();
  await expect(page.getByText("Hồ sơ của bạn có kỹ năng HTML.", { exact: true })).toHaveCount(0);

  await page.getByRole("link", { name: "Tạo cột mốc cải thiện" }).click();
  await expect(page.getByLabel("Tên cột mốc")).toHaveValue("Bổ sung: HTML");
  await expect(page.getByRole("textbox", { name: "Mô tả", exact: true })).toHaveValue(/Dành 30 phút học HTML/);
  await page.getByRole("button", { name: /Tìm hiểu vị trí Thực tập sinh Frontend/ }).click();
  await expect(page.getByLabel("Tên cột mốc")).toHaveValue("Tìm hiểu vị trí Thực tập sinh Frontend");
  await expect(page.locator('select[name="job"]')).toHaveValue("frontend-demo");
  await page.getByRole("link", { name: "Hủy", exact: true }).click();
  await expect(page).toHaveURL(/\/jobs\/frontend-demo\/match$/);
  await page.getByRole("link", { name: "Tạo cột mốc cải thiện" }).click();
  await page.getByLabel("Tên cột mốc").fill("Ôn HTML");
  await page.getByRole("button", { name: "Lưu cột mốc" }).click();
  await page.getByRole("link", { name: /Ôn HTML/ }).click();
  await page.locator('textarea[name="learned"]').fill("Đã luyện thẻ HTML ngữ nghĩa.");
  await page.getByRole("button", { name: "Hoàn thành và lưu ghi nhận" }).click();
  await expect(page.getByText("1 / 1 cột mốc đã hoàn thành")).toBeVisible();
  await expect(page.getByText("Đã luyện thẻ HTML ngữ nghĩa.")).toBeVisible();

  await page.getByRole("link", { name: "Cập nhật hồ sơ" }).click();
  await page.getByLabel("Kỹ năng").fill("HTML, Git");
  await upload(page, "cv-dau.pdf");
  await page.getByRole("button", { name: "Lưu hồ sơ" }).click();
  await expect(page.getByText("Lưu CV đầu tiên")).toBeVisible();
  await expect(baseline.getByText(/cv-dau\.pdf/)).toBeVisible();
  await expect(baseline.getByText("Git", { exact: true })).toBeVisible();
  await expect(baseline.getByText("Chưa có kỹ năng mới trong hồ sơ.")).toBeVisible();
  const firstCvUrl = await baseline.getByRole("link", { name: "Tải CV đầu tiên" }).getAttribute("href");
  await page.getByRole("link", { name: "Cập nhật hồ sơ" }).click();
  await page.getByLabel("Kỹ năng").fill("HTML, Git, React");
  await upload(page, "cv-moi.pdf");
  await page.getByRole("button", { name: "Lưu hồ sơ" }).click();
  await expect(page.getByText("CV: cv-moi.pdf")).toBeVisible();
  await page.reload();
  await expect(baseline.getByText(/cv-dau\.pdf/)).toBeVisible();
  await expect(baseline.getByText(/cv-moi\.pdf/)).toBeVisible();
  await expect(baseline.getByText("React", { exact: true })).toHaveClass(/green/);
  await expect(baseline.getByRole("link", { name: "Tải CV đầu tiên" })).toHaveAttribute("href", firstCvUrl!);
  await expect(baseline.getByRole("link", { name: "Tải CV gần nhất" })).toBeVisible();
  await expect(page.getByText("Đã luyện thẻ HTML ngữ nghĩa.")).toBeVisible();
  await expect(page.getByText("CV: cv-moi.pdf")).toBeVisible();
  const progress = baseline.locator("dl");
  await expect(progress.locator("dd")).toHaveText(["1", "1", "0"]);
  await page.getByRole("link", { name: "Xem nhật ký từ điểm xuất phát" }).click();
  const log = page.getByRole("region", { name: "Nhật ký tiến bộ" });
  await expect(log.getByRole("link", { name: "Từ điểm xuất phát", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(log.getByText("CV: cv-moi.pdf")).toBeVisible();
  await expect(log.getByText("Lưu CV đầu tiên")).toBeVisible();
  await expect(log.getByText("Đã luyện thẻ HTML ngữ nghĩa.")).toHaveCount(0);
  await log.getByRole("link", { name: "Toàn bộ hoạt động" }).click();
  await expect(log.getByText("Đã luyện thẻ HTML ngữ nghĩa.")).toBeVisible();
  await page.getByRole("link", { name: /Phù hợp 40%/ }).click();
  await expect(page.getByText(/Đây là kết quả đã ghi nhận/)).toBeVisible();
  await expect(page.getByText("Lịch rảnh của bạn bao phủ ca Thứ 2, 09:00–12:00.", { exact: true })).toBeVisible();
  const historicalUrl = page.url();
  await page.getByRole("link", { name: "Tạo cột mốc cải thiện" }).click();
  await page.getByRole("link", { name: "Hủy", exact: true }).click();
  await expect(page).toHaveURL(historicalUrl);
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
  await expect(page.getByText("0/0 tiêu chí đủ thông tin")).toBeVisible();
  await expect(page.getByText("0%", { exact: true })).toHaveCount(0);
  expect(await page.locator("body").evaluate((body) => body.scrollWidth)).toBeLessThanOrEqual(390);
  await page.getByRole("link", { name: "Xem hành trình" }).click();
  await page.getByRole("link", { name: "Tạo cột mốc", exact: true }).click();
  await page.getByRole("link", { name: "Hủy", exact: true }).click();
  await expect(page).toHaveURL(/\/journey$/);
});

test("lưu JD nháp và xác nhận ba nhóm yêu cầu", async ({ page }) => {
  await page.goto("/jobs");
  await page.getByRole("link", { name: "Nhập JD thủ công" }).click();
  await page.getByLabel("Tên vị trí").fill("Thực tập thiết kế web");
  await page.getByLabel("Doanh nghiệp").fill("Studio kiểm thử");
  for (const [group, value] of [
    ["bắt buộc", "HTML"], ["ưu tiên", "Figma"], ["chưa rõ", "Có thể làm từ xa không?"],
  ] as const) {
    await page.getByRole("button", { name: `Thêm ${group}` }).click();
    await page.getByLabel("Nội dung yêu cầu").last().fill(value);
  }
  await expect(page.getByText("Bắt buộc · 1", { exact: true })).toBeVisible();
  await expect(page.getByText("Ưu tiên · 1", { exact: true })).toBeVisible();
  await expect(page.getByText("Chưa rõ · 1", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Lưu bản nháp" }).click();
  await expect(page).toHaveURL(/\/jobs\?job=(?!new)/);
  await page.reload();
  await expect(page.getByText("Yêu cầu cần được xác nhận trước khi đối chiếu.")).toBeVisible();
  await expect(page.getByLabel("Nội dung yêu cầu").last()).toHaveValue("Có thể làm từ xa không?");
  await page.getByRole("button", { name: "Xác nhận yêu cầu và xem mức độ phù hợp" }).click();
  await expect(page).toHaveURL(/\/jobs\/[^/]+\/match$/);
  const unclear = page.getByText("Có thể làm từ xa không?", { exact: true }).locator("..");
  await expect(unclear).toContainText("Chưa rõ");
  await expect(page.getByLabel("Mức đáp ứng cho Có thể làm từ xa không?", { exact: true })).toHaveCount(0);
  await expect(page.getByLabel("Mức đáp ứng cho HTML", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Mức đáp ứng cho Figma", { exact: true })).toBeVisible();
  await page.getByLabel("Mức đáp ứng cho Figma", { exact: true }).selectOption("MET");
  await page.getByRole("button", { name: "Cập nhật đối chiếu" }).click();
  await expect(page.getByText("Bạn đã tự xác nhận đáp ứng yêu cầu này.", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Về yêu cầu tuyển dụng" }).click();
  await expect(page.getByText("Yêu cầu đã lưu được xác nhận.")).toBeVisible();
});

test("trích xuất yêu cầu từ JD, rà soát và xác nhận", async ({ page }) => {
  await page.goto("/jobs?job=new");
  await page.getByLabel("Tên vị trí").fill("Thực tập phát triển ứng dụng");
  await page.getByLabel("Doanh nghiệp").fill("Studio kiểm thử");
  await page.getByRole("textbox", { name: /^Mô tả công việc/ }).fill([
    "Bắt buộc:", "Chuyên ngành: Công nghệ thông tin", "Kỹ năng: HTML", "Kinh nghiệm: 1 năm",
    "Lịch làm việc: Thứ 2 09:00–12:00", "Ưu tiên: Kỹ năng: React", "Chưa rõ: Lịch làm việc: linh hoạt",
  ].join("\n"));
  const extract = page.getByRole("button", { name: "Trích xuất yêu cầu từ JD" });
  await extract.click();
  await expect(page.getByRole("status").filter({ hasText: "Đã thêm 6 yêu cầu" })).toBeVisible();
  await expect(page.getByText("Bắt buộc · 4", { exact: true })).toBeVisible();
  await expect(page.getByText("Ưu tiên · 1", { exact: true })).toBeVisible();
  await expect(page.getByText("Chưa rõ · 1", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Nội dung yêu cầu").nth(2)).toHaveValue("12");
  await expect(page.getByLabel("Nội dung yêu cầu").nth(3)).toHaveValue("2 09:00-12:00");
  await extract.click();
  await expect(page.getByLabel("Nội dung yêu cầu")).toHaveCount(6);
  await page.getByLabel("Nội dung yêu cầu").nth(4).fill("Git");
  await page.getByRole("button", { name: "Xác nhận yêu cầu và xem mức độ phù hợp" }).click();
  await expect(page).toHaveURL(/\/jobs\/[^/]+\/match$/);
  await expect(page.getByLabel("Mức đáp ứng cho Git", { exact: true })).toBeVisible();
  await expect(page.getByText("linh hoạt", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Mức đáp ứng cho linh hoạt")).toHaveCount(0);
});

test("hạn cột mốc được lưu, lọc quá hạn và hoàn thành", async ({ page }) => {
  await page.goto("/milestones/new");
  await expect(page.getByRole("button", { name: /Hoàn thiện CV đầu tiên|Cập nhật một dự án trong CV/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Tìm hiểu một vị trí quan tâm/ })).toBeVisible();
  await page.getByRole("button", { name: /Thực hành một kỹ năng trong 30 phút/ }).click();
  await expect(page.getByLabel("Tên cột mốc")).toHaveValue("Thực hành một kỹ năng trong 30 phút");
  await expect(page.locator('select[name="type"]')).toHaveValue("SKILL");
  await page.getByLabel("Tên cột mốc").fill("Luyện phỏng vấn có thời hạn");
  await page.getByRole("textbox", { name: "Mô tả", exact: true }).fill("Soạn câu trả lời và tập nói trong 2 phút.");
  await page.getByLabel("Hạn hoàn thành").fill("2020-01-02");
  await page.getByRole("button", { name: "Lưu cột mốc", exact: true }).click();
  const milestone = page.getByRole("link", { name: /Luyện phỏng vấn có thời hạn/ });
  await expect(milestone).toContainText("Quá hạn");
  await expect(milestone).toContainText("02/01/2020");
  await page.getByRole("navigation", { name: "Lọc cột mốc" }).getByRole("link", { name: /Quá hạn/ }).click();
  await expect(milestone).toBeVisible();
  await milestone.click();
  await expect(page.getByLabel("Hạn hoàn thành")).toHaveValue("2020-01-02");
  await expect(page.getByRole("textbox", { name: "Mô tả", exact: true })).toHaveValue("Soạn câu trả lời và tập nói trong 2 phút.");
  await page.locator('textarea[name="learned"]').fill("Đã luyện trình bày dự án trong 2 phút.");
  await page.locator('textarea[name="improvedSkills"]').fill("Trình bày dự án súc tích hơn.");
  await page.locator('textarea[name="experienceGained"]').fill("Đã trả lời câu hỏi phỏng vấn thử.");
  await page.getByRole("button", { name: "Hoàn thành và lưu ghi nhận" }).click();
  await expect(milestone).toContainText("Hoàn thành");
  const log = page.getByRole("region", { name: "Nhật ký tiến bộ" });
  const completion = log.getByRole("listitem").filter({ hasText: "Cột mốc hoàn thành" }).filter({ hasText: "Luyện phỏng vấn có thời hạn" });
  await expect(completion).toContainText("Trình bày dự án súc tích hơn.");
  await expect(completion).toContainText("Đã trả lời câu hỏi phỏng vấn thử.");
  await milestone.click();
  await expect(page.locator('textarea[name="learned"]')).toHaveValue("Đã luyện trình bày dự án trong 2 phút.");
  await expect(page.locator('textarea[name="improvedSkills"]')).toHaveValue("Trình bày dự án súc tích hơn.");
  await expect(page.locator('textarea[name="experienceGained"]')).toHaveValue("Đã trả lời câu hỏi phỏng vấn thử.");
  await page.locator('textarea[name="experienceGained"]').fill("Nhận phản hồi về cách kết thúc câu trả lời.");
  await page.getByRole("button", { name: "Lưu cột mốc", exact: true }).click();
  await expect(page).toHaveURL(/\/journey$/);
  await page.reload();
  const update = log.getByRole("listitem").filter({ hasText: "Cập nhật ghi nhận" }).filter({ hasText: "Luyện phỏng vấn có thời hạn" });
  await expect(update).toContainText("Nhận phản hồi về cách kết thúc câu trả lời.");
  await expect(completion).toHaveCount(1);
  await page.getByRole("navigation", { name: "Lọc cột mốc" }).getByRole("link", { name: /Quá hạn/ }).click();
  await expect(page.getByText("Không có cột mốc trong nhóm này")).toBeVisible();
  await page.setViewportSize({ width: 360, height: 800 });
  expect(await page.locator("body").evaluate((body) => body.scrollWidth)).toBeLessThanOrEqual(360);
});

test("lưu hồ sơ, đối chiếu dữ liệu và tải lại CV gốc", async ({ page }) => {
  await page.goto("/profile");
  await page.getByLabel("Chuyên ngành").fill("Tự động hóa");
  await page.getByLabel("Kỹ năng").fill("PLC, HTML");
  await page.getByRole("textbox", { name: /^Kinh nghiệm/ }).fill("Lập trình bộ điều khiển PLC trong đồ án.");
  await page.getByLabel("Số tháng kinh nghiệm").fill("4");
  const day = page.locator('select[name="day"]').first();
  const start = page.locator('input[name="start"]').first();
  const end = page.locator('input[name="end"]').first();
  if (!(await day.count())) {
    await page.getByRole("button", { name: "Thêm khoảng giờ" }).click();
  }
  await day.selectOption("2");
  await start.fill("08:30");
  await end.fill("12:30");
  await upload(page, "CV tiếng Việt.pdf");
  await page.getByRole("button", { name: "Lưu và xem tin tuyển dụng", exact: true }).click();
  await expect(page).toHaveURL(/\/jobs$/);
  await page.getByRole("link", { name: /Thực tập sinh Tự động hóa/ }).click();
  await page.getByRole("button", { name: "Xác nhận yêu cầu và xem mức độ phù hợp" }).click();
  await expect(page.getByText("100%", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Mức đáp ứng cho Tự động hóa", { exact: true })).toHaveValue("MET");
  await expect(page.getByLabel("Mức đáp ứng cho 3", { exact: true })).toHaveValue("MET");
  await expect(page.getByLabel("Mức đáp ứng cho PLC", { exact: true })).toHaveValue("MET");
  await page.getByRole("link", { name: "Về yêu cầu tuyển dụng" }).click();
  await page.getByRole("link", { name: /Thực tập sinh Frontend/ }).click();
  await page.getByRole("button", { name: "Xác nhận yêu cầu và xem mức độ phù hợp" }).click();
  await expect(page.getByLabel("Mức đáp ứng cho 2 09:00-12:00", { exact: true })).toHaveValue("MET");
  await page.goto("/profile");
  await expect(page.getByLabel("Chuyên ngành")).toHaveValue("Tự động hóa");
  await expect(page.getByLabel("Kỹ năng")).toHaveValue("PLC, HTML");
  await expect(page.getByRole("textbox", { name: /^Kinh nghiệm/ })).toHaveValue("Lập trình bộ điều khiển PLC trong đồ án.");
  await expect(page.getByLabel("Số tháng kinh nghiệm")).toHaveValue("4");
  await expect(day).toHaveValue("2");
  await expect(start).toHaveValue("08:30");
  await expect(end).toHaveValue("12:30");
  const link = page.getByRole("link", { name: "Tải CV: CV tiếng Việt.pdf", exact: true });
  await expect(link).toBeVisible();
  const response = await page.request.get((await link.getAttribute("href"))!);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toBe("application/pdf");
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(response.headers()["content-disposition"]).toContain(encodeURIComponent("CV tiếng Việt.pdf"));
  expect(await response.body()).toEqual(cv("unused.pdf").buffer);
  const download = page.waitForEvent("download");
  await link.click();
  expect((await download).suggestedFilename()).toBe("CV tiếng Việt.pdf");
  expect((await page.request.get("/api/cv/nonexistent")).status()).toBe(404);
});
