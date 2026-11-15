import type { Item } from "@/modules/matching/domain";
import { milestoneTypes } from "./domain";

export type MilestoneSuggestion = {
  id: string;
  title: string;
  description: string;
  type: typeof milestoneTypes[number];
  jobId?: string;
};

export function suggestMilestones(hasCv: boolean, job?: { id: string; title: string }, items: Item[] = []) {
  const needsWork = [
    ...items.filter((item) => item.type === "REQUIRED" && item.outcome === "GAP"),
    ...items.filter((item) => item.outcome === "UNKNOWN"),
    ...items.filter((item) => item.type === "PREFERRED" && item.outcome === "GAP"),
  ].slice(0, 3);
  const contextual: MilestoneSuggestion[] = needsWork.map(({ id, kind, type, outcome, value }) => {
    const clarify = outcome === "UNKNOWN";
    const skill = kind === "SKILL";
    return {
      id: `criterion-${id}`,
      title: `${clarify ? "Làm rõ" : "Bổ sung"}: ${value}`.slice(0, 160),
      type: clarify ? "CLARIFY" : skill ? "SKILL" : "RESEARCH",
      jobId: job?.id,
      description: clarify
        ? type === "UNCLEAR"
          ? `Soạn một câu hỏi ngắn cho nhà tuyển dụng về yêu cầu “${value}”.`
          : `Kiểm tra hồ sơ và JD để xác định bạn có đáp ứng yêu cầu “${value}” hay cần bổ sung thông tin.`
        : skill
          ? `Dành 30 phút học ${value}, làm một bài thực hành nhỏ và ghi lại điều đã học.`
          : `Xem lại yêu cầu “${value}” và ghi một việc cụ thể bạn có thể làm để tiến gần hơn.`,
    };
  });
  const defaults: MilestoneSuggestion[] = [
    {
      id: "cv", type: "CV", title: hasCv ? "Cập nhật một dự án trong CV" : "Hoàn thiện CV đầu tiên",
      description: "Chọn một dự án và viết hai dòng về việc bạn đã làm và kết quả đạt được, rồi thêm vào CV.",
    },
    {
      id: "skill", type: "SKILL", title: "Thực hành một kỹ năng trong 30 phút",
      description: "Chọn một kỹ năng muốn học, làm một bài tập ngắn và ghi lại điều bạn đã làm được.",
    },
    {
      id: "research", type: "RESEARCH", title: job ? `Tìm hiểu vị trí ${job.title}`.slice(0, 160) : "Tìm hiểu một vị trí quan tâm",
      description: "Đọc một tin tuyển dụng và ghi lại ba việc thường làm ở vị trí này cùng một câu hỏi bạn muốn tìm hiểu thêm.",
      jobId: job?.id,
    },
  ];
  return { recommended: contextual[0], options: [...contextual, ...defaults] };
}
