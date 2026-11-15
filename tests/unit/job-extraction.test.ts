import { expect, it } from "vitest";
import { extractRequirements } from "@/modules/jobs/extract-requirements";

it("nhận diện bốn loại yêu cầu từ JD tiếng Việt", () => {
  expect(extractRequirements(`
    Vị trí: Thực tập sinh web
    Yêu cầu bắt buộc:
    - Chuyên ngành: Công nghệ thông tin
    - Thành thạo React, TypeScript và Git
    - Có ít nhất 1 năm kinh nghiệm
    - Lịch làm việc: Thứ 2, 9h–12h30
    Ưu tiên: Kỹ năng: Figma
    Chưa rõ:
    - Lịch làm việc: theo thỏa thuận
  `)).toEqual([
    { type: "REQUIRED", kind: "MAJOR", value: "Công nghệ thông tin" },
    { type: "REQUIRED", kind: "SKILL", value: "React" },
    { type: "REQUIRED", kind: "SKILL", value: "TypeScript" },
    { type: "REQUIRED", kind: "SKILL", value: "Git" },
    { type: "REQUIRED", kind: "EXPERIENCE", value: "12" },
    { type: "REQUIRED", kind: "AVAILABILITY", value: "2 09:00-12:30" },
    { type: "PREFERRED", kind: "SKILL", value: "Figma" },
    { type: "UNCLEAR", kind: "AVAILABILITY", value: "theo thỏa thuận" },
  ]);
});

it("giữ điều kiện mơ hồ và các phân loại mâu thuẫn ở nhóm chưa rõ", () => {
  expect(extractRequirements(`
    Chuyên ngành: ICT
    Bắt buộc:
    Kỹ năng: HTML, Git
    Chuyên ngành: ICT hoặc Kỹ thuật
    Kinh nghiệm: 1–2 năm
    Thời gian làm việc: Thứ 2 13:00-09:00
    Ưu tiên: Kỹ năng: git
  `)).toEqual([
    { type: "UNCLEAR", kind: "MAJOR", value: "ICT" },
    { type: "REQUIRED", kind: "SKILL", value: "HTML" },
    { type: "UNCLEAR", kind: "SKILL", value: "Git" },
    { type: "UNCLEAR", kind: "MAJOR", value: "ICT hoặc Kỹ thuật" },
    { type: "UNCLEAR", kind: "EXPERIENCE", value: "1–2 năm" },
    { type: "UNCLEAR", kind: "AVAILABILITY", value: "Thứ 2 13:00-09:00" },
  ]);
  expect(extractRequirements("Cùng nhóm xây dựng sản phẩm mới.")).toEqual([]);
});

it("đọc ưu tiên ở cấp kỹ năng và các ca lặp lại trong tuần", () => {
  expect(extractRequirements(`
    Yêu cầu bắt buộc:
    Kỹ năng: HTML, React (ưu tiên), React/Vue, CI/CD
    Làm việc từ thứ 2 đến thứ 6, 18:00–22:00
    Chưa rõ:
    Kỹ năng: Git (ưu tiên)
  `)).toEqual([
    { type: "REQUIRED", kind: "SKILL", value: "HTML" },
    { type: "PREFERRED", kind: "SKILL", value: "React" },
    { type: "UNCLEAR", kind: "SKILL", value: "React/Vue" },
    { type: "REQUIRED", kind: "SKILL", value: "CI/CD" },
    ...[2, 3, 4, 5, 6].map((day) => ({ type: "REQUIRED", kind: "AVAILABILITY", value: `${day} 18:00-22:00` })),
    { type: "UNCLEAR", kind: "SKILL", value: "Git" },
  ]);
});
