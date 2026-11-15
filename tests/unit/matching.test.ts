import { describe, expect, it } from "vitest";
import { assessmentSummary, Evidence, Item, MatchingService, Requirement, score, selfAssessmentExplanation } from "@/modules/matching/domain";

const profile: Evidence = {
  major: "Kỹ thuật", skills: [" HTML ", "Git"], months: 0,
  availability: [{ day: 2, start: "08:30", end: "10:00" }, { day: 2, start: "10:00", end: "12:30" }],
};
function requirement(kind: Requirement["kind"], value: string, type: Requirement["type"] = "REQUIRED"): Requirement {
  return { id: value, kind, value, type };
}
const assess = (data: Evidence | null, ...items: Requirement[]) => new MatchingService().assess(data, items).map(({ outcome }) => outcome);

describe("đối chiếu yêu cầu", () => {
  it("so khớp kỹ năng, chuyên ngành và kinh nghiệm bằng dữ liệu nhập", () => {
    expect(assess(profile, requirement("SKILL", "html"), requirement("SKILL", "React"), requirement("MAJOR", "KỸ THUẬT"), requirement("EXPERIENCE", "0"), requirement("EXPERIENCE", "3")))
      .toEqual(["MET", "GAP", "MET", "MET", "GAP"]);
  });
  it("xác định lịch được bao phủ hoàn toàn, kể cả khoảng liền kề", () => {
    expect(assess(profile, requirement("AVAILABILITY", "2 09:00-12:00"), requirement("AVAILABILITY", "2 09:00-13:00"), requirement("AVAILABILITY", "7 09:00-12:00"), requirement("AVAILABILITY", "linh hoạt")))
      .toEqual(["MET", "GAP", "GAP", "UNKNOWN"]);
  });
  it("giữ mức chưa xác định khi thiếu hồ sơ, dữ liệu từng phần hoặc tiêu chí chưa rõ", () => {
    expect(assess(null, requirement("SKILL", "HTML"))).toEqual(["UNKNOWN"]);
    expect(assess({ major: "", skills: [], months: null, availability: [] }, requirement("SKILL", "HTML"), requirement("EXPERIENCE", "0"))).toEqual(["UNKNOWN", "UNKNOWN"]);
    expect(assess(profile, requirement("SKILL", "HTML", "UNCLEAR"), requirement("OTHER", "Điều kiện riêng"))).toEqual(["UNKNOWN", "UNKNOWN"]);
  });
  it("tính theo trọng số 2 và 1, bỏ qua tiêu chí chưa rõ và chưa xác định", () => {
    const item = (type: Requirement["type"], outcome: Item["outcome"]): Item => ({ ...requirement("SKILL", type, type), outcome });
    expect(score([item("REQUIRED", "GAP"), item("PREFERRED", "MET"), item("UNCLEAR", "MET"), item("REQUIRED", "UNKNOWN")])).toBe(33);
    expect(score([item("REQUIRED", "GAP")])).toBe(0);
    expect(score([item("UNCLEAR", "GAP"), item("REQUIRED", "UNKNOWN")])).toBeNull();
    expect(score([])).toBeNull();
  });
  it("lưu bằng chứng và giải thích tại thời điểm đối chiếu, tách rõ phần chưa biết", () => {
    const items = new MatchingService().assess(profile, [
      { ...requirement("SKILL", "HTML"), sourceText: "Bắt buộc: HTML" },
      requirement("SKILL", "React"), requirement("OTHER", "Lịch linh hoạt", "UNCLEAR"),
    ]);
    expect(items[0]).toMatchObject({ outcome: "MET", method: "AUTOMATIC", sourceText: "Bắt buộc: HTML" });
    expect(items[0].evidence).toContain("Git");
    expect(items[1].explanation).toContain("Chưa tìm thấy tên kỹ năng");
    expect(items[2].explanation).toContain("chưa được tính điểm");
    expect(assessmentSummary(items)).toEqual({ assessed: 2, met: 1, unknown: 1, requiredGaps: 1 });
    expect(selfAssessmentExplanation("UNKNOWN")).toContain("Bạn đã đánh dấu");
    const missing = new MatchingService().assess(null, [requirement("SKILL", "HTML")]);
    expect(score(missing)).toBeNull();
    expect(assessmentSummary(missing).unknown).toBe(1);
  });
});
