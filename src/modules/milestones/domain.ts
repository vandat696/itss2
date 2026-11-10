export const milestoneTypes = ["CV", "SKILL", "PROJECT", "RESEARCH", "INTERVIEW", "CLARIFY"] as const;
export const milestoneLabels = {
  CV: "Cải thiện CV", SKILL: "Học thêm kỹ năng", PROJECT: "Hoàn thành dự án",
  RESEARCH: "Tìm hiểu công việc", INTERVIEW: "Chuẩn bị phỏng vấn", CLARIFY: "Làm rõ điều kiện tuyển dụng",
};
export function completeMilestone(previous: Date | null, now: Date) {
  return { status: "COMPLETED" as const, completedAt: previous ?? now, recordCompletion: previous === null };
}
