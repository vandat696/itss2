import { expect, it } from "vitest";
import { completeMilestone } from "@/modules/milestones/domain";
import { progressMetrics } from "@/modules/journey/domain";

it("ghi nhận lần hoàn thành đầu và giữ ngày khi thực hiện lại", () => {
  const now = new Date("2026-11-10T12:00:00Z");
  const initial = completeMilestone(null, now);
  expect(initial).toEqual({ status: "COMPLETED", completedAt: now, recordCompletion: true });
  expect(completeMilestone(initial.completedAt, new Date("2026-11-11T12:00:00Z"))).toEqual({ ...initial, recordCompletion: false });
});
it("tính tiến độ theo cột mốc, kỹ năng và số lần thay CV", () => {
  expect(progressMetrics(["html", "React", "react"], ["HTML"], [{ status: "COMPLETED" }, { status: "OPEN" }], 2))
    .toEqual({ added: 1, completed: 1, progress: 50, cvUpdates: 1 });
  expect(progressMetrics([], [], [], 0)).toEqual({ added: 0, completed: 0, progress: 0, cvUpdates: 0 });
});
