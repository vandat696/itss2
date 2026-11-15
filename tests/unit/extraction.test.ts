import { describe, expect, it } from "vitest";
import { extractRequirements } from "@/modules/jobs/extraction";

describe("gợi ý yêu cầu JD tại máy", () => {
  it("giữ trích nguồn, phân loại theo đề mục và phân biệt các tên kỹ năng chồng nhau", () => {
    const source = "- Biết JavaScript, Java, Node.js, React Native và GitHub";
    const result = extractRequirements(`Yêu cầu bắt buộc:\n${source}\nƯu tiên:\n- Biết React\nQuyền lợi:\n- Được học Docker`);
    expect(result.suggestions.map((item) => [item.value, item.type])).toEqual([
      ["React Native", "REQUIRED"], ["JavaScript", "REQUIRED"], ["Node.js", "REQUIRED"], ["Java", "REQUIRED"], ["GitHub", "REQUIRED"], ["React", "PREFERRED"],
    ]);
    expect(result.suggestions[0].sourceText).toBe(source);
    expect(result.unparsed).toContain("- Được học Docker");
  });
  it("chuẩn hóa ngành, đổi năm sang tháng và tách ca làm có ngày giờ rõ", () => {
    const result = extractRequirements("Yêu cầu:\nSinh viên ngành CNTT\nÍt nhất 1.5 năm kinh nghiệm\nThứ 2 đến thứ 4 9h-12h");
    expect(result.suggestions.map((item) => [item.kind, item.value])).toEqual([
      ["MAJOR", "Công nghệ thông tin"], ["EXPERIENCE", "18"],
      ["AVAILABILITY", "2 09:00-12:00"], ["AVAILABILITY", "3 09:00-12:00"], ["AVAILABILITY", "4 09:00-12:00"],
    ]);
  });
  it("không biến lựa chọn, phủ định hoặc câu có mức độ hỗn hợp thành yêu cầu bắt buộc", () => {
    for (const source of ["Java hoặc Python", "Không yêu cầu React", "Chưa biết SQL vẫn có thể ứng tuyển", "Bắt buộc HTML, ưu tiên React", "Java or Python", "Java/Python", "Biết một trong React, Vue"]) {
      const items = extractRequirements(`Yêu cầu:\n${source}`).suggestions;
      expect(items).toHaveLength(1);
      expect(items[0]).toMatchObject({ kind: "OTHER", type: "UNCLEAR", sourceText: source });
    }
  });
  it("giữ lịch mơ hồ và kinh nghiệm theo khoảng để người dùng hỏi thêm", () => {
    for (const source of ["Lịch làm linh hoạt", "Thứ 2, 4, 6 09:00-12:00", "Thứ 6-thứ 2 09:00-12:00", "Thứ 2 09:00-12:00, thứ 3 13:00-17:00", "Lịch Monday-Friday 09:00-12:00", "Thứ 2 25:00-27:00", "Thứ 2 09:00-12:00 JST", "Kinh nghiệm 1-2 năm", "Kinh nghiệm tối đa 2 năm", "Sinh viên ngành CNTT, kinh tế"]) {
      const items = extractRequirements(`Yêu cầu:\n${source}`).suggestions;
      expect(items).toHaveLength(1);
      expect(items[0]).toMatchObject({ type: "UNCLEAR", sourceText: source });
    }
  });
  it("loại trùng, giới hạn kết quả và giữ nội dung chưa nhận diện", () => {
    expect(extractRequirements("Biết HTML\nBiết HTML").suggestions).toHaveLength(1);
    const result = extractRequirements(Array.from({ length: 35 }, (_, index) => `Java hoặc Python, điều kiện ${index}`).join("\n"));
    expect(result.suggestions).toHaveLength(30);
    expect(result.limited).toBe(true);
    expect(result.unparsed).toHaveLength(5);
    expect(extractRequirements("Lương sẽ trao đổi").unparsed).toEqual(["Lương sẽ trao đổi"]);
  });
});
