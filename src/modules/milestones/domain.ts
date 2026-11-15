export const milestoneTypes = ["CV", "SKILL", "PROJECT", "RESEARCH", "INTERVIEW", "CLARIFY"] as const;
export const milestoneLabels = {
  CV: "Cải thiện CV", SKILL: "Học thêm kỹ năng", PROJECT: "Hoàn thành dự án",
  RESEARCH: "Tìm hiểu công việc", INTERVIEW: "Chuẩn bị phỏng vấn", CLARIFY: "Làm rõ điều kiện tuyển dụng",
};
export function completeMilestone(previous: Date | null, now: Date) {
  return { status: "COMPLETED" as const, completedAt: previous ?? now, recordCompletion: previous === null };
}

// Calendar dates remain strings so deadlines do not shift with server timezones.
export function validDueDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < "1900-01-01" || value > "9999-12-31") return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function calendarToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Bangkok", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)!.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function deadlineState(item: { status: string; dueDate: string | null }, today: string) {
  if (item.status === "COMPLETED") return "completed";
  if (!item.dueDate) return "open";
  return item.dueDate < today ? "overdue" : item.dueDate === today ? "today" : "open";
}

export function dueDateLabel(value: string) {
  return value.split("-").reverse().join("/");
}
