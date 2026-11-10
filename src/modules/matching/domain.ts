export const requirementTypes = ["REQUIRED", "PREFERRED", "UNCLEAR"] as const;
export const criteria = ["SKILL", "MAJOR", "EXPERIENCE", "AVAILABILITY", "OTHER"] as const;
export const outcomes = ["MET", "GAP", "UNKNOWN"] as const;
export type Outcome = typeof outcomes[number];
export type Requirement = { id: string; type: typeof requirementTypes[number]; kind: typeof criteria[number]; value: string };
export type Item = Requirement & { outcome: Outcome };
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

export class MatchingService {
  assess(profile: Evidence | null, requirements: Requirement[]): Item[] {
    return requirements.map((requirement) => ({ ...requirement, outcome: this.compare(profile, requirement) }));
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
