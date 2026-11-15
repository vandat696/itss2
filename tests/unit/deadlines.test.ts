import { expect, it } from "vitest";
import { calendarToday, deadlineState, validDueDate } from "@/modules/milestones/domain";

it("kiểm tra ngày lịch thực và năm nhuận", () => {
  expect(validDueDate("2028-02-29")).toBe(true);
  for (const value of ["2026-02-29", "2026-04-31", "2026-13-01", "15/11/2026", "0000-01-01", "2026-1-1", "invalid"]) {
    expect(validDueDate(value)).toBe(false);
  }
});

it("phân biệt ngày đến hạn với quá hạn và giữ trạng thái đã hoàn thành", () => {
  const today = "2026-11-15";
  expect(deadlineState({ status: "OPEN", dueDate: "2026-11-14" }, today)).toBe("overdue");
  expect(deadlineState({ status: "OPEN", dueDate: today }, today)).toBe("today");
  expect(deadlineState({ status: "OPEN", dueDate: "2026-11-16" }, today)).toBe("open");
  expect(deadlineState({ status: "OPEN", dueDate: null }, today)).toBe("open");
  expect(deadlineState({ status: "COMPLETED", dueDate: "2026-11-14" }, today)).toBe("completed");
});

it("xác định hôm nay theo múi giờ Việt Nam khi UTC chưa qua ngày", () => {
  expect(calendarToday(new Date("2026-11-14T18:00:00Z"))).toBe("2026-11-15");
  expect(calendarToday(new Date("2026-11-14T16:59:00Z"))).toBe("2026-11-14");
});
