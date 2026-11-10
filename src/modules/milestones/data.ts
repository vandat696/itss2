import { db } from "@/shared/db";

export async function readMilestonePage(id: string, jobId?: string, assessmentId?: string) {
  const [milestone, jobs, assessment] = await Promise.all([
    id === "new" ? null : db.milestone.findUnique({ where: { id } }),
    db.jobPosting.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true, confirmedAt: true } }),
    jobId && assessmentId ? db.matchAssessment.findFirst({ where: { id: assessmentId, jobId }, select: { id: true } }) : null,
  ]);
  return { milestone, jobs, assessment, job: jobs.find((item) => item.id === jobId) };
}
