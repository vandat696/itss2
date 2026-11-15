import { expect, it } from "vitest";
import { applicationSchema, interviewDate, interviewInput, isActiveApplication, needsFollowUp } from "@/modules/applications/domain";

const draft = {
  title: "Frontend Intern", company: "Michii", status: "APPLIED", appliedOn: "2020-01-01",
  interviewAt: "", followUpOn: "", contact: "", notes: "", applyUrl: "", jobId: "",
};

it("giữ đúng giờ Việt Nam khi lưu và mở lại lịch phỏng vấn", () => {
  const value = "2026-11-16T09:30";
  expect(interviewDate(value).toISOString()).toBe("2026-11-16T02:30:00.000Z");
  expect(interviewInput(interviewDate(value))).toBe(value);
  expect(interviewInput(new Date("2026-11-15T17:00:00Z"))).toBe("2026-11-16T00:00");
  expect(interviewInput(null)).toBe("");
});

it("kiểm tra ngày thực, thứ tự lịch, trạng thái và URL từ phía server", () => {
  expect(applicationSchema.safeParse(draft).success).toBe(true);
  for (const change of [
    { appliedOn: "2099-01-01" }, { appliedOn: "2026-02-30" },
    { interviewAt: "2026-02-30T09:00" }, { interviewAt: "2026-11-16T24:30" },
    { interviewAt: "2019-12-31T09:00" }, { followUpOn: "2019-12-31" },
    { followUpOn: "2026-04-31" }, { status: "INVALID" }, { title: "  " },
    { applyUrl: "javascript:alert(1)" }, { notes: "a".repeat(4001) },
  ]) expect(applicationSchema.safeParse({ ...draft, ...change }).success).toBe(false);
});

it("chỉ nhắc những đơn đang theo đuổi đã đến ngày liên hệ lại", () => {
  const today = "2026-11-15";
  expect(needsFollowUp({ status: "APPLIED", followUpOn: today }, today)).toBe(true);
  expect(needsFollowUp({ status: "INTERVIEW", followUpOn: "2026-11-14" }, today)).toBe(true);
  expect(needsFollowUp({ status: "SCREENING", followUpOn: "2026-11-16" }, today)).toBe(false);
  expect(needsFollowUp({ status: "APPLIED", followUpOn: null }, today)).toBe(false);
  for (const status of ["OFFER", "REJECTED", "WITHDRAWN"] as const) {
    expect(isActiveApplication(status)).toBe(false);
    expect(needsFollowUp({ status, followUpOn: today }, today)).toBe(false);
  }
});
