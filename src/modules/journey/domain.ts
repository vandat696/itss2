import { normalize } from "@/modules/matching/domain";

export function progressMetrics(skills: string[], initialSkills: string[], milestones: { status: string }[], cvCount: number) {
  const original = new Set(initialSkills.map(normalize));
  const newSkills = new Map<string, string>();
  for (const skill of skills) {
    const key = normalize(skill);
    if (!original.has(key) && !newSkills.has(key)) newSkills.set(key, skill);
  }
  const addedSkills = [...newSkills.values()];
  const completed = milestones.filter((item) => item.status === "COMPLETED").length;
  const progress = milestones.length ? Math.round(completed * 100 / milestones.length) : 0;
  return { added: addedSkills.length, addedSkills, completed, progress, cvUpdates: Math.max(0, cvCount - 1) };
}

export function progressSinceStart<T extends { createdAt: Date; kind: string }>(events: T[], startAt: Date | null) {
  const timeline = startAt ? events.filter((event) => event.createdAt >= startAt) : events;
  const completed = timeline.filter((event) => event.kind === "MILESTONE").length;
  return { timeline, completed };
}
