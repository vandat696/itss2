import { db } from "@/shared/db";
import { readProfile, skillsSchema } from "@/modules/profile/data";
import { progressMetrics } from "./domain";

export async function readJourney() {
  const [profile, milestones, timeline, assessedJobs, saved, cvCount] = await Promise.all([
    readProfile(),
    db.milestone.findMany({ orderBy: { createdAt: "desc" } }),
    db.progressRecord.findMany({ orderBy: [{ createdAt: "desc" }, { id: "desc" }] }),
    db.jobPosting.findMany({
      where: { OR: [{ assessments: { some: {} } }, { saved: { isNot: null } }] },
      include: { saved: true, assessments: { orderBy: { createdAt: "desc" }, select: { id: true, percent: true, createdAt: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    db.savedJob.count(),
    db.cvSnapshot.count(),
  ]);
  const initial = timeline.findLast((event) => event.kind === "BASELINE");
  const initialSkills = skillsSchema.parse(initial?.skills ?? []);
  const metrics = progressMetrics(profile?.skills ?? [], initialSkills, milestones, cvCount);
  return { profile, milestones, timeline, assessedJobs, saved, initialSkills, assessed: assessedJobs.filter((job) => job.assessments.length).length, initial, ...metrics };
}
