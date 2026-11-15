export const requirementTypes = ["REQUIRED", "PREFERRED", "UNCLEAR"] as const;
export const criteria = ["SKILL", "MAJOR", "EXPERIENCE", "AVAILABILITY", "OTHER"] as const;
export const outcomes = ["MET", "GAP", "UNKNOWN"] as const;
export type Outcome = typeof outcomes[number];
export type Requirement = { id: string; type: typeof requirementTypes[number]; kind: typeof criteria[number]; value: string; sourceText?: string };
export type Item = Requirement & { outcome: Outcome; explanation?: string; evidence?: string; method?: "AUTOMATIC" | "SELF" };
export type Slot = { day: number; start: string; end: string };
export type Evidence = { skills: string[]; major: string; months: number | null; availability: Slot[] };

export const normalize = (value: string) => value.trim().normalize("NFC").toLocaleLowerCase("vi");
export const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
export const days = [2, 3, 4, 5, 6, 7, 8];
export const dayLabel = (day: number) => day === 8 ? "Chủ nhật" : `Thứ ${day}`;

export function parseSlot(value: string): Slot | null {
  const match = /^([2-8])\s+(\S+)-(\S+)$/.exec(value.trim());
  if (!match || !timePattern.test(match[2]) || !timePattern.test(match[3]) || match[2] >= match[3]) return null;
  return { day: Number(match[1]), start: match[2], end: match[3] };
}

const weights = { REQUIRED: 2, PREFERRED: 1, UNCLEAR: 0 };
export function score(items: Item[]): number | null {
  let total = 0;
  let earned = 0;
  for (const item of items) {
    if (item.outcome === "UNKNOWN") continue;
    const weight = weights[item.type];
    total += weight;
    if (item.outcome === "MET") earned += weight;
  }
  return total ? Math.round(100 * earned / total) : null;
}

export function assessmentSummary(items: Item[]) {
  const known = items.filter((item) => item.type !== "UNCLEAR" && item.outcome !== "UNKNOWN");
  return { assessed: known.length, met: known.filter((item) => item.outcome === "MET").length,
    unknown: items.length - known.length, requiredGaps: known.filter((item) => item.type === "REQUIRED" && item.outcome === "GAP").length };
}

export function requirementLabel(item: Pick<Requirement, "kind" | "value">) {
  if (item.kind === "EXPERIENCE" && /^\d+$/.test(item.value)) return `${item.value} tháng kinh nghiệm`;
  if (item.kind === "AVAILABILITY") {
    const slot = parseSlot(item.value);
    if (slot) return `${dayLabel(slot.day)} · ${slot.start}–${slot.end}`;
  }
  return item.value;
}

function evidenceFor(profile: Evidence | null, kind: Requirement["kind"]): string {
  if (!profile) return "Chưa có hồ sơ năng lực tại lần đối chiếu này.";
  switch (kind) {
    case "SKILL": return profile.skills.length ? `Kỹ năng đã khai báo: ${profile.skills.join(", ")}.` : "Chưa khai báo kỹ năng.";
    case "MAJOR": return profile.major ? `Chuyên ngành đã khai báo: ${profile.major}.` : "Chưa khai báo chuyên ngành.";
    case "EXPERIENCE": return profile.months !== null ? `Kinh nghiệm đã khai báo: ${profile.months} tháng.` : "Chưa khai báo số tháng kinh nghiệm.";
    case "AVAILABILITY": return profile.availability.length ? `Lịch rảnh: ${profile.availability.map((slot) => `${dayLabel(slot.day)} ${slot.start}–${slot.end}`).join("; ")}.` : "Chưa khai báo lịch rảnh.";
    case "OTHER": return "Điều kiện này cần được bạn kiểm tra trực tiếp.";
  }
}

function explain(profile: Evidence | null, requirement: Requirement, outcome: Outcome): string {
  if (requirement.type === "UNCLEAR") return "Chưa rõ mức độ quan trọng của yêu cầu. Tiêu chí này chưa được tính điểm; bạn có thể hỏi nhà tuyển dụng trước khi quyết định.";
  if (!profile) return "Chưa có hồ sơ để đối chiếu. Bổ sung thông tin sẽ giúp làm rõ yêu cầu này.";
  if (outcome === "UNKNOWN") return requirement.kind === "OTHER" || (requirement.kind === "AVAILABILITY" && !parseSlot(requirement.value))
    ? "Chưa thể tự động đối chiếu điều kiện này. Bạn có thể xác nhận với nhà tuyển dụng hoặc tự đánh giá khi đã có đủ thông tin."
    : "Hồ sơ chưa có đủ thông tin cho tiêu chí này. Trạng thái chưa xác định không đồng nghĩa với việc bạn thiếu năng lực.";
  switch (requirement.kind) {
    case "SKILL": return outcome === "MET" ? "Kỹ năng này xuất hiện trong hồ sơ đã khai báo." : "Chưa tìm thấy tên kỹ năng này trong hồ sơ. Bạn có thể bổ sung thông tin, kiểm tra cách gọi tương đương hoặc tạo một mục tiêu học tập.";
    case "MAJOR": return outcome === "MET" ? "Tên chuyên ngành trong hồ sơ trùng với yêu cầu đã xác nhận." : "Tên chuyên ngành chưa trùng theo cách ghi hiện tại. Hãy kiểm tra nhà tuyển dụng có chấp nhận ngành tương đương không.";
    case "EXPERIENCE": return outcome === "MET" ? "Số tháng kinh nghiệm đã khai báo đạt mức yêu cầu." : "Số tháng đã khai báo thấp hơn yêu cầu. Bạn có thể hỏi xem dự án cá nhân hoặc hoạt động liên quan có được tính không.";
    case "AVAILABILITY": return outcome === "MET" ? "Các khoảng rảnh đã khai báo bao phủ toàn bộ ca làm này." : "Lịch rảnh hiện chưa bao phủ toàn bộ ca làm. Bạn có thể hỏi khả năng đổi ca hoặc điều chỉnh theo lịch học.";
    case "OTHER": return "Bạn đã xác nhận điều kiện này.";
  }
}

export function selfAssessmentExplanation(outcome: Outcome) {
  return outcome === "MET" ? "Bạn đã tự xác nhận đáp ứng tiêu chí này."
    : outcome === "GAP" ? "Bạn đã tự xác nhận còn điều cần bổ sung ở tiêu chí này."
      : "Bạn đã đánh dấu cần thêm thông tin trước khi kết luận tiêu chí này.";
}

export class MatchingService {
  assess(profile: Evidence | null, requirements: Requirement[]): Item[] {
    return requirements.map((requirement) => {
      const outcome = this.compare(profile, requirement);
      return { ...requirement, outcome, explanation: explain(profile, requirement, outcome), evidence: evidenceFor(profile, requirement.kind), method: "AUTOMATIC" };
    });
  }

  private compare(profile: Evidence | null, { type, kind, value }: Requirement): Outcome {
    if (!profile || type === "UNCLEAR") return "UNKNOWN";
    const compare = (known: boolean, matches: boolean): Outcome => known ? (matches ? "MET" : "GAP") : "UNKNOWN";
    switch (kind) {
      case "SKILL":
        return compare(profile.skills.length > 0, profile.skills.some((skill) => normalize(skill) === normalize(value)));
      case "MAJOR":
        return compare(Boolean(profile.major), normalize(profile.major) === normalize(value));
      case "EXPERIENCE":
        return compare(profile.months !== null && /^\d+$/.test(value), (profile.months ?? 0) >= Number(value));
      case "AVAILABILITY": {
        const slot = parseSlot(value);
        if (!slot) return "UNKNOWN";
        const ranges = profile.availability.filter((range) => range.day === slot.day).sort((a, b) => a.start.localeCompare(b.start));
        let coveredUntil = slot.start;
        for (const range of ranges) {
          if (range.start > coveredUntil) break;
          if (range.end > coveredUntil) coveredUntil = range.end;
        }
        return compare(profile.availability.length > 0, coveredUntil >= slot.end);
      }
      case "OTHER":
        return "UNKNOWN";
    }
  }
}
