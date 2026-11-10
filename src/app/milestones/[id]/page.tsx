import { redirect } from "next/navigation";
import { Lightbulb } from "lucide-react";
import { SearchParams, singleValues } from "@/shared/query";
import { readMilestonePage } from "@/modules/milestones/data";
import { Back, Heading } from "@/shared/ui";
import { MilestoneForm } from "@/modules/milestones/form";
import { milestoneTypes } from "@/modules/milestones/domain";

export const dynamic = "force-dynamic";
export default async function MilestonePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<SearchParams> }) {
  const [{ id }, rawQuery] = await Promise.all([params, searchParams]);
  const query = singleValues(rawQuery, ["from", "job", "title", "type", "assessment"]);
  const isNew = id === "new";
  const { milestone, jobs, assessment, job } = await readMilestonePage(id, query.job, query.assessment);
  if (!isNew && !milestone) redirect("/journey");
  const fromMatch = query.from === "match" && job && (job.confirmedAt || assessment);
  const back = fromMatch ? `/jobs/${job.id}/match${assessment ? `?assessment=${assessment.id}` : ""}` : "/journey";
  const type = milestoneTypes.find((item) => item === query.type) ?? "RESEARCH";
  return <>
    <Back href={back}>{fromMatch ? "Về kết quả đánh giá" : "Về hành trình"}</Back>
    <Heading japanese="小さな目標の詳細" title={isNew ? "Tạo cột mốc nhỏ" : "Chi tiết cột mốc"}>Chọn một việc cụ thể bạn có thể làm và ghi lại điều học được trên đường đi.</Heading>
    <div className="layout-side">
      <MilestoneForm milestone={milestone} jobs={jobs} back={back} draft={{ jobId: job?.id, title: query.title?.slice(0, 160), type }} />
      <aside className="card callout"><Lightbulb /><h2>Chọn một việc vừa sức</h2><p>Ví dụ: thêm mô tả một dự án vào CV, luyện trả lời một câu phỏng vấn, hoặc hỏi nhà tuyển dụng về lịch làm việc.</p></aside>
    </div>
  </>;
}
