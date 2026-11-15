import { normalize, parseSlot, type Requirement } from "@/modules/matching/domain";

export type RequirementDraft = Omit<Requirement, "id">;

const groupLabels = [
  [/^(?:yêu cầu(?: bắt buộc| ứng viên| công việc)?|bắt buộc|required(?: qualifications)?|must[- ]have|requirements)$/iu, "REQUIRED"],
  [/^(?:yêu cầu ưu tiên|ưu tiên|preferred(?: qualifications)?|nice[- ]to[- ]have)$/iu, "PREFERRED"],
  [/^(?:chưa rõ|cần xác nhận|unclear)$/iu, "UNCLEAR"],
] as const;

const fieldLabels = [
  [/^(?:chuyên ngành|ngành học|major|field of study)\s*[:：]\s*(.+)$/iu, "MAJOR"],
  [/^(?:kỹ năng(?: yêu cầu)?|skills?)\s*[:：]\s*(.+)$/iu, "SKILL"],
  [/^(?:(?:kinh nghiệm(?: làm việc)?|experience)\s*[:：]\s*|(?=(?:(?:có )?(?:tối thiểu |ít nhất )?\d+\s*(?:năm|tháng).{0,20}kinh nghiệm|không (?:yêu cầu|cần) kinh nghiệm)))(.+)$/iu, "EXPERIENCE"],
  [/^(?:(?:lịch làm việc|thời gian làm việc|giờ làm việc|work(?:ing)? (?:hours|schedule)|schedule)\s*[:：]\s*|làm việc (?:từ )?(?=thứ\s*[2-7]|chủ nhật)|(?=(?:thứ\s*[2-7]|chủ nhật)\s+\d))(.+)$/iu, "AVAILABILITY"],
  [/^(?:thành thạo|biết sử dụng|có kiến thức về)\s+(.+)$/iu, "SKILL"],
  [/^(?:tốt nghiệp|đang học|sinh viên)\s+(?:chuyên )?ngành\s+(.+)$/iu, "MAJOR"],
] as const;

const ambiguous = /(?:\b(?:or|either|flexible|negotiable|optional)\b|(?:^|\s)(?:hoặc|linh hoạt|thỏa thuận|tùy|có thể|không bắt buộc)(?=\s|[.,;!?]|$)|\s\/\s|[?？])/iu;

function experienceMonths(value: string): string | null {
  const normalized = normalize(value);
  if (/^\d{1,3}$/.test(normalized)) return normalized;
  if (/^(?:không yêu cầu kinh nghiệm|không cần kinh nghiệm|no experience(?: required)?)\.?$/iu.test(normalized)) return "0";
  const match = /^(?:có |tối thiểu |ít nhất |at least |minimum )*(\d{1,3})\+?\s*(năm|tháng|years?|months?)\s*(?:trở lên|kinh nghiệm|kinh nghiệm trở lên|of experience)?[.!]?$/iu.exec(normalized);
  if (!match) return null;
  const months = Number(match[1]) * (/^(năm|year)/u.test(match[2]) ? 12 : 1);
  return months <= 999 ? String(months) : null;
}

function workingSlots(value: string): string[] | null {
  const normalized = normalize(value)
    .replace(/^từ\s+/u, "")
    .replace(/^thứ\s*([2-7])\s*(?:[-–—]|đến)\s*thứ\s*([2-7])\b/u, "$1-$2")
    .replace(/^([2-7])-([2-7])\s*[,，:]\s*/u, "$1-$2 ")
    .replace(/^thứ\s*([2-7])\b/u, "$1")
    .replace(/^chủ nhật/u, "8")
    .replace(/^(\d)\s*[,，:]\s*/u, "$1 ")
    .replace(/(\d{1,2})(?::|h)(\d{2})?\b/gu, (_, hour: string, minute?: string) => `${hour.padStart(2, "0")}:${minute ?? "00"}`)
    .replace(/\s*(?:[-–—]|đến|to)\s*/gu, "-");
  const range = /^([2-7])-([2-7])\s+(.+)$/u.exec(normalized);
  const slot = parseSlot(range ? `${range[1]} ${range[3]}` : normalized);
  if (!slot) return null;
  const lastDay = range ? Number(range[2]) : slot.day;
  if (lastDay < slot.day) return null;
  return Array.from({ length: lastDay - slot.day + 1 }, (_, index) => `${slot.day + index} ${slot.start}-${slot.end}`);
}

export const requirementKey = ({ kind, value }: Pick<RequirementDraft, "kind" | "value">) => `${kind}:${normalize(value)}`;

export function extractRequirements(text: string): RequirementDraft[] {
  const drafts = new Map<string, RequirementDraft>();
  let group: RequirementDraft["type"] | undefined;
  for (const raw of text.normalize("NFC").split(/\r?\n/u)) {
    let line = raw.trim().replace(/^(?:[-*•▪–]|\d+[.)])\s+/u, "");
    if (!line) continue;
    const [, heading, remainder] = /^([^:：]+)[:：]\s*(.*)$/u.exec(line) ?? [];
    const marked = groupLabels.find(([pattern]) => pattern.test(heading ?? line))?.[1];
    if (marked && !remainder) {
      group = marked;
      continue;
    }
    if (marked) line = remainder;
    if (!marked && /^(?:mô tả công việc|quyền lợi|lương|cách ứng tuyển|trách nhiệm|responsibilities|benefits)\s*(?:[:：]|$)/iu.test(line)) {
      group = undefined;
      continue;
    }

    const field = fieldLabels.find(([pattern]) => pattern.test(line));
    if (!field) continue;
    const [pattern, kind] = field;
    const value = line.replace(pattern, "$1").trim();
    const type = marked ?? group;
    const values = kind === "SKILL" && !ambiguous.test(value) ? value.split(/[,;，]|\s+và\s+|\s+and\s+/iu) : [value];
    for (const candidate of values) {
      const rawValue = candidate.trim().replace(/[.]$/u, "");
      const priority = /\s*\((ưu tiên|preferred|nice[- ]to[- ]have)\)$/iu.exec(rawValue);
      const content = priority ? rawValue.slice(0, priority.index).trim() : rawValue;
      const uncertain = ambiguous.test(content) || (kind === "SKILL" && /\p{Ll}\/\p{Lu}/u.test(content));
      const months = kind === "EXPERIENCE" ? experienceMonths(content) : null;
      const normalizedValues = kind === "AVAILABILITY" ? workingSlots(content)
        : kind === "EXPERIENCE" ? (months === null ? null : [months]) : [content];
      const draftType = uncertain || !normalizedValues || type === "UNCLEAR"
        ? "UNCLEAR" : priority ? "PREFERRED" : type ?? "UNCLEAR";
      for (const entry of normalizedValues ?? [content]) {
        if (!entry || entry.length > 160) continue;
        const key = requirementKey({ kind, value: entry });
        const previous = drafts.get(key);
        drafts.set(key, { kind, type: previous && previous.type !== draftType ? "UNCLEAR" : draftType, value: previous?.value ?? entry });
      }
    }
  }
  return [...drafts.values()];
}
