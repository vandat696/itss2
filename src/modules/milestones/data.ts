import { db } from "@/shared/db";
import { profileId } from "@/modules/profile/data";

export async function readMilestonePage(id: string, jobId?: string, assessmentId?: string) {
  const [milestone, jobs, assessment, cv] = await Promise.all([
    id === "new" ? null : db.milestone.findUnique({ where: { id } }),
    db.jobPosting.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true, confirmedAt: true } }),
    jobId && assessmentId ? db.matchAssessment.findFirst({ where: { id: assessmentId, jobId }, select: { id: true, items: true } }) : null,
    id === "new" ? db.cvSnapshot.findFirst({ where: { profileId }, select: { id: true } }) : null,
  ]);
  return { milestone, jobs, assessment, hasCv: Boolean(cv), job: jobs.find((item) => item.id === jobId) };
}
