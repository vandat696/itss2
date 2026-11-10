// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { Empty, Heading } from "@/shared/ui";

afterEach(cleanup);
it("hiển thị tiêu đề tiếng Việt và tên màn hình tiếng Nhật", () => {
  render(<Heading title="Hồ sơ năng lực" japanese="プロフィール・スキル">Thông tin của bạn</Heading>);
  expect(screen.getByRole("heading", { name: "Hồ sơ năng lực" })).toBeTruthy();
  expect(screen.getByText("プロフィール・スキル").lang).toBe("ja");
});
it("hiển thị hướng dẫn trong trạng thái trống", () => {
  render(<Empty title="Không có tin phù hợp">Thử đổi bộ lọc.</Empty>);
  expect(screen.getByText("Thử đổi bộ lọc.")).toBeTruthy();
});
