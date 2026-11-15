import { db } from "@/shared/db";

export const readApplications = () => db.jobApplication.findMany({
  orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
  include: { job: { select: { id: true, sample: true } } },
});
export const readApplication = (id: string) => db.jobApplication.findUnique({
  where: { id }, include: { events: { orderBy: [{ createdAt: "desc" }, { id: "desc" }] } },
});
export const applicationJobs = () => db.jobPosting.findMany({
  orderBy: { title: "asc" }, select: { id: true, title: true, company: true, applyUrl: true, sample: true },
});
