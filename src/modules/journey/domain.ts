import { normalize } from "@/modules/matching/domain";

export function progressMetrics(skills: string[], initialSkills: string[], milestones: { status: string }[], cvCount: number) {
  const original = new Set(initialSkills.map(normalize));
  const added = new Set(skills.map(normalize).filter((skill) => !original.has(skill))).size;
  const completed = milestones.filter((item) => item.status === "COMPLETED").length;
  const progress = milestones.length ? Math.round(completed * 100 / milestones.length) : 0;
  return { added, completed, progress, cvUpdates: Math.max(0, cvCount - 1) };
}
