import Link from "next/link";
import { ArrowUpRight, Bookmark, CircleHelp, ListPlus, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { readAssessment, recordAssessment } from "@/modules/matching/data";
import { AssessmentForm } from "@/modules/matching/form";
import { Back, Heading, SectionTitle } from "@/shared/ui";

import { SearchParams, singleValues } from "@/shared/query";

export const dynamic = "force-dynamic";
export default async function MatchPage({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<SearchParams>;
}) {
  const [{ id }, rawQuery] = await Promise.all([params, searchParams]);
  const query = singleValues(rawQuery, ["assessment", "saved", "updated"]);
  const result = query.assessment ? await readAssessment(id, query.assessment) : await recordAssessment(id);
  if (!result?.job) redirect("/jobs");
  if (!result.assessment) redirect(`/jobs?job=${id}`);
  const { job, profile, assessment } = result;
  const matchHref = `/jobs/${id}/match`;
  const isHistorical = Boolean(query.assessment && (assessment.jobRevision !== job.revision || assessment.profileRevision.getTime() !== (profile?.updatedAt?.getTime() ?? 0)));
  const gaps = assessment.items.filter((item) => item.outcome === "GAP" && item.type === "REQUIRED");
  const focus = gaps[0] ?? assessment.items.find((item) => item.outcome === "UNKNOWN") ?? assessment.items.find((item) => item.outcome === "GAP");
  const milestoneHref = `/milestones/new?${new URLSearchParams({ from: "match", job: id, ...(query.assessment && { assessment: query.assessment }), ...(focus && { title: `${focus.outcome === "UNKNOWN" ? "Làm rõ" : "Bổ sung"}: ${focus.value}`.slice(0, 160), type: focus.outcome === "UNKNOWN" ? "CLARIFY" : focus.kind === "SKILL" ? "SKILL" : "RESEARCH" }) })}`;
  const applyUrl = job.applyUrl && /^https?:\/\//i.test(job.applyUrl) ? job.applyUrl : null;
  return <>
    <Back href={`/jobs?job=${id}#job-detail`}>Về yêu cầu tuyển dụng</Back>
    <Heading japanese="適合度の評価結果" title="Kết quả độ phù hợp">{job.title} · {job.company}{job.sample ? " · Tin mẫu" : ""}</Heading>
    {!isHistorical && (query.saved && job.saved || query.updated) && <p className="notice green" role="status">{query.saved ? "Đã lưu kết quả vào hành trình." : "Đã cập nhật kết quả đối chiếu."}</p>}
    {isHistorical && <p className="notice amber">Đây là kết quả đã ghi nhận trước khi hồ sơ hoặc JD thay đổi. <Link className="text-link" href={matchHref} prefetch={false}>Mở kết quả hiện tại</Link></p>}
    <div className="layout-side">
      <div className="stack">
        <section className="hero score-hero">
          <div><span className="hero-kicker"><Sparkles size={15} /> ĐỐI CHIẾU HỒ SƠ</span><h2>{assessment.percent === null ? "Chưa đủ thông tin để đánh giá" : "Mức độ phù hợp ước tính"}</h2><p>{assessment.percent === null ? "Hãy bổ sung hồ sơ, làm rõ yêu cầu hoặc tự kiểm tra từng tiêu chí." : "Tỷ lệ này phản ánh các tiêu chí đã xác định, không phải xác suất trúng tuyển."}</p></div>
          {assessment.percent !== null && <strong className="score-number">{assessment.percent}%</strong>}
        </section>
        {gaps.length > 0 && <div className="notice amber"><strong>Yêu cầu bắt buộc cần bổ sung</strong><p>{gaps.map((item) => item.value).join(" · ")}</p></div>}
        <AssessmentForm key={`${assessment.id}-${assessment.updatedAt.getTime()}`} id={assessment.id} items={assessment.items} historical={isHistorical} saved={Boolean(job.saved)} />
      </div>
      <aside className="stack">
        <section className="card stack"><SectionTitle>Bước tiếp theo</SectionTitle>
          <Link className="button primary" href={milestoneHref}><ListPlus size={17} /> Tạo cột mốc cải thiện</Link>
          <Link className="button secondary" href={`/profile?job=${id}`}>{profile ? "Cập nhật hồ sơ" : "Nhập hồ sơ"}</Link>
          <Link className="button secondary" href={`/jobs?job=${id}#job-detail`}>Sửa yêu cầu tuyển dụng</Link>
          {applyUrl && <a className="button secondary" href={applyUrl} target="_blank" rel="noopener noreferrer">Mở trang ứng tuyển <ArrowUpRight size={15} /></a>}
          <Link className="text-link" href="/journey">Xem hành trình</Link>
        </section>
        <section className="card aside-note"><CircleHelp /><div><strong>Cách tính</strong><p>Tổng trọng số đáp ứng ÷ tổng trọng số đánh giá được × 100. Bắt buộc có 2 điểm, ưu tiên có 1 điểm. Điều kiện chưa rõ và mức đáp ứng chưa xác định được loại khỏi công thức.</p></div></section>
        {job.saved && <div className="card aside-note"><Bookmark /><div><strong>Đã lưu cơ hội này</strong><p>Bạn có thể xem lại trong hành trình.</p></div></div>}
      </aside>
    </div>
  </>;
}
