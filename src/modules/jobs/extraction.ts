import { normalize, parseSlot, type Requirement } from "@/modules/matching/domain";

export type Suggestion = Pick<Requirement, "kind" | "type" | "value"> & { sourceText: string; hint: string };
export type Extraction = { suggestions: Suggestion[]; unparsed: string[]; limited: boolean };
const plain = (text: string) => normalize(text).normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/g, "d");
const boundary = (pattern: string) => new RegExp(`(?<![\\p{L}\\p{N}_])(?:${pattern})(?![\\p{L}\\p{N}_])`, "giu");
const skills = [
  ["React Native", "react\\s+native"], ["JavaScript", "javascript"], ["TypeScript", "typescript"],
  ["Node.js", "node\\.?js"], ["Next.js", "next\\.?js"], ["React", "react(?:\\.?js)?"],
  ["Vue", "vue(?:\\.?js)?"], ["Angular", "angular"], ["Java", "java"], ["Python", "python"],
  ["C++", "c\\+\\+"], ["C#", "c#"], [".NET", "\\.net"], ["HTML", "html(?:5)?"], ["CSS", "css(?:3)?"],
  ["PostgreSQL", "postgres(?:ql)?"], ["MySQL", "mysql"], ["SQL", "sql"], ["GitHub", "github"], ["Git", "git"],
  ["Docker", "docker"], ["AWS", "aws"], ["Linux", "linux"], ["Figma", "figma"], ["Excel", "excel"],
  ["PLC", "plc"], ["Flutter", "flutter"], ["Kotlin", "kotlin"], ["Swift", "swift"],
] as const;
const majors = [
  ["Công nghệ thông tin", "cong nghe thong tin|cntt|information technology|computer science"],
  ["Tự động hóa", "tu dong hoa|automation"], ["Kinh tế", "kinh te|economics"],
  ["Marketing", "marketing"], ["Thiết kế", "thiet ke|design"],
] as const;
const required = /bat buoc|yeu cau|toi thieu|it nhat|\bmust\b|\brequired\b|\bminimum\b|必須/;
const preferred = /uu tien|loi the|khuyen khich|preferred|nice.to.have|歓迎/;
const ambiguous = /\bhoac\b|\bor\b|mot trong|one of|any of|either|[a-z]\s*\/\s*[a-z]|khong (?:bat buoc|yeu cau|can|co|biet)|chua (?:biet|co)|not required|optional|without|不要|または/;
const headerPattern = /^(?:(?:yeu cau|dieu kien)(?: ung vien| tuyen dung)?(?: bat buoc)?|requirements?|must.have|bat buoc|uu tien|preferred|nice.to.have|必須|歓迎)\s*:?$/;
const ignoredHeader = /^(?:mo ta(?: cong viec)?|trach nhiem|quyen loi|phuc loi|responsibilities|benefits|about us)\s*:?$/;

/** Conservative local extraction. Every result stays a draft until reviewed. */
export function extractRequirements(text: string): Extraction {
  const result: Extraction = { suggestions: [], unparsed: [], limited: false };
  let section: Requirement["type"] = "UNCLEAR";
  let inDescription = false;
  const seen = new Set<string>();
  for (const raw of text.slice(0, 20_000).split(/\r?\n|[;；]/)) {
    const sourceText = raw.trim();
    if (!sourceText) continue;
    const content = sourceText.replace(/^[-*•\s]+/, "").trim();
    const line = plain(content);
    if (headerPattern.test(line)) { section = preferred.test(line) ? "PREFERRED" : required.test(line) || /requirements?/.test(line) ? "REQUIRED" : "UNCLEAR"; inDescription = false; continue; }
    if (ignoredHeader.test(line)) { inDescription = true; section = "UNCLEAR"; continue; }
    if (sourceText.length > 1000 || (inDescription && !required.test(line) && !preferred.test(line))) { result.unparsed.push(sourceText); continue; }
    const type = preferred.test(line) ? "PREFERRED" : required.test(line) ? "REQUIRED" : section;
    const add = (kind: Suggestion["kind"], value: string, hint = "Kiểm tra nội dung và mức độ quan trọng trước khi xác nhận.", override = type) => {
      const key = `${kind}:${normalize(value)}:${override}`;
      if (seen.has(key)) return;
      seen.add(key);
      if (result.suggestions.length >= 30) { result.limited = true; if (!result.unparsed.includes(sourceText)) result.unparsed.push(sourceText); return; }
      result.suggestions.push({ kind, type: override, value, sourceText, hint });
    };
    const before = result.suggestions.length;
    if (ambiguous.test(line) || (required.test(line) && preferred.test(line))) {
      add("OTHER", content.slice(0, 160), "Câu có lựa chọn hoặc điều kiện không bắt buộc. Hãy xác nhận cách đáp ứng với nhà tuyển dụng.", "UNCLEAR");
      continue;
    }
    // Skills with overlapping names are matched once: Java != JavaScript, React Native != React.
    const occupied: [number, number][] = [];
    for (const [value, pattern] of skills) {
      for (const match of line.matchAll(boundary(pattern))) {
        const start = match.index;
        const end = start + match[0].length;
        if (occupied.some(([a, b]) => start < b && end > a)) continue;
        occupied.push([start, end]);
        add("SKILL", value);
      }
    }
    if (/chuyen nganh|nganh|sinh vien|major|degree/.test(line)) {
      const found = majors.filter(([, pattern]) => boundary(pattern).test(line));
      if (found.length > 1) add("OTHER", content.slice(0, 160), "Có nhiều ngành được nhắc đến. Hãy xác nhận ngành nào được chấp nhận thay vì xem mọi ngành là bắt buộc.", "UNCLEAR");
      else if (found.length) add("MAJOR", found[0][0], "Tên ngành đã được chuẩn hóa; hãy kiểm tra ngành tương đương trước khi xác nhận.");
    }
    if (/kinh nghiem|experience/.test(line)) {
      const range = /\d\s*(?:-|–|den|to)\s*\d|toi da|khong qua|duoi|hon|tren|at most|maximum|less than|more than|\bover\b/.test(line);
      const quantities = [...line.matchAll(/(\d+(?:[.,]\d+)?)\s*(thang|months?|nam|years?)(?![a-z])/g)];
      if (!range && quantities.length === 1) {
        const amount = Number(quantities[0][1].replace(",", ".")) * (/nam|year/.test(quantities[0][2]) ? 12 : 1);
        if (Number.isInteger(amount) && amount >= 0 && amount <= 999) add("EXPERIENCE", String(amount), "Số năm được đổi sang tháng. Hãy kiểm tra đây là mức tối thiểu nhà tuyển dụng yêu cầu.");
        else add("OTHER", content.slice(0, 160), "Chưa chuyển được kinh nghiệm thành số tháng để đối chiếu.", "UNCLEAR");
      } else add("OTHER", content.slice(0, 160), "Kinh nghiệm chưa có mức tối thiểu rõ ràng; giữ lại để hỏi thêm.", "UNCLEAR");
    }
    if (/thu\s*[2-7]|chu nhat|monday|tuesday|wednesday|thursday|friday|saturday|sunday|lich|ca lam|gio\/tuan|schedule|working hours/.test(line)) {
      const ranges = [...line.matchAll(/(\d{1,2})(?::(\d{2})|h(\d{2})?)\s*(?:-|–|—|den|to)\s*(\d{1,2})(?::(\d{2})|h(\d{2})?)/g)];
      const dayNames = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
      let dayNumbers = [...line.matchAll(/thu\s*([2-7])/g)].map((match) => Number(match[1]));
      if (/chu nhat/.test(line)) dayNumbers.push(8);
      dayNames.forEach((name, index) => { if (line.includes(name)) dayNumbers.push(index + 2); });
      const dayRange = /thu\s*([2-7])\s*(?:-|–|den)\s*(?:thu\s*)?([2-7])/.exec(line);
      if (dayRange && Number(dayRange[1]) <= Number(dayRange[2])) dayNumbers = Array.from({ length: Number(dayRange[2]) - Number(dayRange[1]) + 1 }, (_, index) => Number(dayRange[1]) + index);
      // A compact day list such as “thứ 2, 4, 6” needs clarification rather than losing days.
      const compactDays = /thu\s*[2-7]\s*[,/]\s*[2-8]/.test(line);
      const englishRange = /(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s*(?:-|to)/.test(line);
      const times = ranges.map((match) => `${match[1].padStart(2, "0")}:${match[2] ?? match[3] ?? "00"}-${match[4].padStart(2, "0")}:${match[5] ?? match[6] ?? "00"}`);
      const ambiguousPairing = new Set(dayNumbers).size > 1 && times.length > 1;
      const reverseDays = dayRange && Number(dayRange[1]) > Number(dayRange[2]);
      const foreignZone = /utc|gmt|jst|日本時間/.test(line);
      if (dayNumbers.length && times.length && !compactDays && !englishRange && !ambiguousPairing && !reverseDays && !foreignZone && times.every((time) => parseSlot(`2 ${time}`))) {
        for (const day of new Set(dayNumbers)) for (const time of times) add("AVAILABILITY", `${day} ${time}`, "Lịch được tách theo ngày. Hãy xác nhận tất cả khoảng giờ đều cần đáp ứng.");
      } else add("AVAILABILITY", content.slice(0, 160), "Lịch chưa đủ rõ để đối chiếu theo ngày và giờ; hãy hỏi nhà tuyển dụng.", "UNCLEAR");
    }
    if (result.suggestions.length === before && !result.unparsed.includes(sourceText)) result.unparsed.push(sourceText);
  }
  if (text.length > 20_000) result.limited = true;
  return result;
}
