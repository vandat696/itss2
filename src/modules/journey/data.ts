import { db } from "@/shared/db";
import { profileId, readFirstCv, readProfile, skillsSchema } from "@/modules/profile/data";
import { progressMetrics, progressSinceStart } from "./domain";

export async function readJourney() {
  const [profile, firstCv, milestones, timeline, assessedJobs, saved, cvCount] = await Promise.all([
    readProfile(),
    readFirstCv(),
    db.milestone.findMany({ orderBy: { createdAt: "desc" } }),
    db.progressRecord.findMany({ orderBy: [{ createdAt: "desc" }, { id: "desc" }] }),
    db.jobPosting.findMany({
      where: { OR: [{ assessments: { some: {} } }, { saved: { isNot: null } }] },
      include: { saved: true, assessments: { orderBy: { createdAt: "desc" }, select: { id: true, percent: true, createdAt: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    db.savedJob.count(),
    db.cvSnapshot.count({ where: { profileId } }),
  ]);
  const initial = timeline.findLast((event) => event.kind === "BASELINE");
  const initialSkills = firstCv?.skills ?? skillsSchema.parse(initial?.skills ?? []);
  const startAt = firstCv?.createdAt ?? initial?.createdAt ?? null;
  const sinceStart = progressSinceStart(timeline, startAt);
  const metrics = progressMetrics(profile?.skills ?? [], initialSkills, milestones, cvCount);
  return { profile, firstCv, milestones, timeline, assessedJobs, saved, initialSkills, assessed: assessedJobs.filter((job) => job.assessments.length).length, initial, startAt, sinceStart, ...metrics };
}
