import { redirect } from "next/navigation";
import { SearchParams, singleValues } from "@/shared/query";
import { readMilestonePage } from "@/modules/milestones/data";
import { Back, Heading } from "@/shared/ui";
import { MilestoneForm } from "@/modules/milestones/form";
import { itemSchema } from "@/modules/matching/data";
import { suggestMilestones } from "@/modules/milestones/suggestions";

export const dynamic = "force-dynamic";
export default async function MilestonePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<SearchParams> }) {
  const [{ id }, rawQuery] = await Promise.all([params, searchParams]);
  const query = singleValues(rawQuery, ["from", "job", "assessment", "returnToAssessment"]);
  const isNew = id === "new";
  const { milestone, jobs, assessment, job, hasCv } = await readMilestonePage(id, query.job, query.assessment);
  if (!isNew && !milestone) redirect("/journey");
  const fromMatch = query.from === "match" && job && (job.confirmedAt || assessment);
  const back = fromMatch ? `/jobs/${job.id}/match${assessment && query.returnToAssessment ? `?assessment=${assessment.id}` : ""}` : "/journey";
  const suggestions = isNew ? suggestMilestones(hasCv, job, fromMatch && assessment ? itemSchema.parse(assessment.items) : []) : null;
  return <>
    <Back href={back}>{fromMatch ? "Về kết quả đánh giá" : "Về hành trình"}</Back>
    <Heading japanese="小さな目標の詳細" title={isNew ? "Tạo cột mốc nhỏ" : "Chi tiết cột mốc"}>Chọn một việc cụ thể bạn có thể làm và ghi lại điều học được trên đường đi.</Heading>
    <MilestoneForm milestone={milestone} jobs={jobs} back={back} jobId={job?.id} suggestions={suggestions} />
  </>;
}
