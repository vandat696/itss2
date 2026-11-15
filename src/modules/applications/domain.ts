import { z } from "zod";
import { long, required, short } from "@/shared/forms";
import { calendarToday, validDueDate } from "@/modules/milestones/domain";

export const applicationStatuses = ["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "REJECTED", "WITHDRAWN"] as const;
export type ApplicationStatus = typeof applicationStatuses[number];
export const statusLabels: Record<ApplicationStatus, string> = {
  APPLIED: "Đã nộp", SCREENING: "Đang xét", INTERVIEW: "Phỏng vấn",
  OFFER: "Nhận đề nghị", REJECTED: "Chưa phù hợp", WITHDRAWN: "Đã rút",
};
export const statusTones: Record<ApplicationStatus, string> = {
  APPLIED: "lavender", SCREENING: "peach", INTERVIEW: "blue", OFFER: "green", REJECTED: "neutral", WITHDRAWN: "neutral",
};
export const isActiveApplication = (status: ApplicationStatus) => ["APPLIED", "SCREENING", "INTERVIEW"].includes(status);
export const needsFollowUp = (item: { status: ApplicationStatus; followUpOn: string | null }, today: string) =>
  isActiveApplication(item.status) && Boolean(item.followUpOn && item.followUpOn <= today);

export function validInterviewTime(value: string) {
  return /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d$/.test(value) && validDueDate(value.slice(0, 10));
}
export const interviewDate = (value: string) => new Date(`${value}:00+07:00`);
export function interviewInput(date: Date | null) {
  if (!date) return "";
  const time = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Bangkok", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(date);
  return `${calendarToday(date)}T${time}`;
}
export const interviewLabel = (date: Date) => new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Bangkok", dateStyle: "medium", timeStyle: "short",
}).format(date);

const optionalDate = z.string().trim().refine((value) => !value || validDueDate(value), "Ngày theo dõi không hợp lệ.");
export const applicationSchema = z.object({
  title: required("Hãy nhập vị trí ứng tuyển."), company: required("Hãy nhập tên doanh nghiệp."),
  status: z.enum(applicationStatuses),
  appliedOn: z.string().refine(validDueDate, "Ngày nộp không hợp lệ.").refine((value) => value <= calendarToday(), "Ngày nộp không thể ở tương lai."),
  interviewAt: z.string().trim().refine((value) => !value || validInterviewTime(value), "Lịch phỏng vấn không hợp lệ."),
  followUpOn: optionalDate, contact: short, notes: long,
  applyUrl: z.union([z.url({ protocol: /^https?$/ }).max(2048), z.literal("")]),
  jobId: z.string().max(120),
}).superRefine((data, context) => {
  if (data.interviewAt && data.interviewAt.slice(0, 10) < data.appliedOn) context.addIssue({ code: "custom", path: ["interviewAt"], message: "Lịch phỏng vấn cần từ ngày nộp trở đi." });
  if (data.followUpOn && data.followUpOn < data.appliedOn) context.addIssue({ code: "custom", path: ["followUpOn"], message: "Ngày theo dõi cần từ ngày nộp trở đi." });
});
