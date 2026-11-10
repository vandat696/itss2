import { z } from "zod";
import { db } from "@/shared/db";
import { readProfile } from "@/modules/profile/data";
import { MatchingService, criteria, outcomes, requirementTypes, score } from "./domain";

export const itemSchema = z.array(z.object({
  id: z.string(), kind: z.enum(criteria), type: z.enum(requirementTypes), value: z.string(), outcome: z.enum(outcomes),
}));
export const noProfileRevision = new Date(0);
export const assessmentKey = (id: string, revision: number, updatedAt: Date | undefined) => ({
  jobId: id, jobRevision: revision, profileRevision: updatedAt ?? noProfileRevision,
});

export async function recordAssessment(jobId: string) {
  const [job, profile] = await Promise.all([
    db.jobPosting.findUnique({ where: { id: jobId }, include: { requirements: { orderBy: { order: "asc" } }, saved: true } }),
    readProfile(),
  ]);
  if (!job?.confirmedAt) return { job, profile, assessment: null };
  const key = assessmentKey(job.id, job.revision, profile?.updatedAt);
  let row = await db.matchAssessment.findUnique({ where: { jobId_jobRevision_profileRevision: key } });
  if (!row) {
    const items = new MatchingService().assess(profile, job.requirements.map(({ id, type, kind, value }) => ({ id, type, kind, value })));
    row = await db.matchAssessment.upsert({
      where: { jobId_jobRevision_profileRevision: key }, create: { ...key, percent: score(items), items }, update: {},
    });
  }
  return { job, profile, assessment: { ...row, items: itemSchema.parse(row.items) } };
}

export async function readAssessment(jobId: string, assessmentId: string) {
  const [row, profile] = await Promise.all([
    db.matchAssessment.findFirst({ where: { id: assessmentId, jobId }, include: { job: { include: { saved: true } } } }),
    readProfile(),
  ]);
  if (!row) return null;
  return { job: row.job, profile, assessment: { ...row, items: itemSchema.parse(row.items) } };
}
