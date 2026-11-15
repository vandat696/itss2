export const requirementTypes = ["REQUIRED", "PREFERRED", "UNCLEAR"] as const;
export const criteria = ["SKILL", "MAJOR", "EXPERIENCE", "AVAILABILITY", "OTHER"] as const;
export const outcomes = ["MET", "GAP", "UNKNOWN"] as const;
export type Outcome = typeof outcomes[number];
export type Requirement = { id: string; type: typeof requirementTypes[number]; kind: typeof criteria[number]; value: string };
export type Item = Requirement & { outcome: Outcome; explanation?: string | null };
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
export function summarizeAssessment(items: Item[]) {
  let possibleWeight = 0;
  let earnedWeight = 0;
  let evaluated = 0;
  for (const item of items) {
    if (item.outcome === "UNKNOWN" || item.type === "UNCLEAR") continue;
    const weight = weights[item.type];
    evaluated += 1;
    possibleWeight += weight;
    if (item.outcome === "MET") earnedWeight += weight;
  }
  return { evaluated, possibleWeight, earnedWeight, total: items.length };
}

export function score(items: Item[]): number | null {
  const { earnedWeight, possibleWeight } = summarizeAssessment(items);
  return possibleWeight ? Math.round(100 * earnedWeight / possibleWeight) : null;
}

export class MatchingService {
  assess(profile: Evidence | null, requirements: Requirement[]): Item[] {
    return requirements.map((requirement) => ({ ...requirement, ...this.compare(profile, requirement) }));
  }

  private compare(profile: Evidence | null, { type, kind, value }: Requirement): Pick<Item, "outcome" | "explanation"> {
    if (!profile || type === "UNCLEAR") return { outcome: "UNKNOWN" };
    const compare = (known: boolean, matches: boolean, explanation: string): Pick<Item, "outcome" | "explanation"> => {
      if (!known) return { outcome: "UNKNOWN" };
      return matches ? { outcome: "MET", explanation } : { outcome: "GAP" };
    };
    switch (kind) {
      case "SKILL":
        return compare(profile.skills.length > 0, profile.skills.some((skill) => normalize(skill) === normalize(value)),
          `Hồ sơ của bạn có kỹ năng ${value}.`);
      case "MAJOR":
        return compare(Boolean(profile.major), normalize(profile.major) === normalize(value),
          `Chuyên ngành ${profile.major} trong hồ sơ trùng với yêu cầu.`);
      case "EXPERIENCE":
        return compare(profile.months !== null && /^\d+$/.test(value), (profile.months ?? 0) >= Number(value),
          `Hồ sơ ghi ${profile.months} tháng kinh nghiệm, đạt yêu cầu tối thiểu ${Number(value)} tháng.`);
      case "AVAILABILITY": {
        const slot = parseSlot(value);
        if (!slot) return { outcome: "UNKNOWN" };
        const ranges = profile.availability.filter((range) => range.day === slot.day).sort((a, b) => a.start.localeCompare(b.start));
        let coveredUntil = slot.start;
        for (const range of ranges) {
          if (range.start > coveredUntil) break;
          if (range.end > coveredUntil) coveredUntil = range.end;
        }
        return compare(profile.availability.length > 0, coveredUntil >= slot.end,
          `Lịch rảnh của bạn bao phủ ca ${dayLabel(slot.day)}, ${slot.start}–${slot.end}.`);
      }
      case "OTHER":
        return { outcome: "UNKNOWN" };
    }
  }
}
