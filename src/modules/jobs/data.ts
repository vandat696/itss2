import { db } from "@/shared/db";
export const jobTypes = ["INTERNSHIP", "PART_TIME"] as const;
export const jobLabels = { INTERNSHIP: "Thực tập", PART_TIME: "Việc làm thêm" };
const include = { requirements: { orderBy: { order: "asc" as const } } };
export const readJob = (id: string) => db.jobPosting.findUnique({ where: { id }, include });
export const readJobs = () => db.jobPosting.findMany({ orderBy: [{ sample: "asc" }, { createdAt: "desc" }, { id: "asc" }], include });
export type Job = NonNullable<Awaited<ReturnType<typeof readJob>>>;
