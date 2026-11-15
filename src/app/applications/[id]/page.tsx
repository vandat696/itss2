import Link from "next/link";
import { ArrowUpRight, FilePenLine, History, Sparkles } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { db } from "@/shared/db";
import { applicationJobs, readApplication } from "@/modules/applications/data";
import { ApplicationForm } from "@/modules/applications/form";
import { interviewLabel, statusLabels, statusTones } from "@/modules/applications/domain";
import { calendarToday } from "@/modules/milestones/domain";
import { Back, Heading, SectionTitle } from "@/shared/ui";
import { SearchParams, singleValues } from "@/shared/query";

export const dynamic = "force-dynamic";
export default async function ApplicationPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<SearchParams> }) {
  const [{ id }, rawQuery] = await Promise.all([params, searchParams]);
  const query = singleValues(rawQuery, ["job", "notice"]);
  const isNew = id === "new";
  const [application, jobs] = await Promise.all([isNew ? null : readApplication(id), applicationJobs()]);
  if (!isNew && !application) notFound();
  const initialJob = isNew ? jobs.find((job) => job.id === query.job) : undefined;
  if (initialJob) {
    const existing = await db.jobApplication.findUnique({ where: { jobId: initialJob.id }, select: { id: true } });
    if (existing) redirect(`/applications/${existing.id}`);
  }
  return <>
    <Back href="/applications">Về danh sách ứng tuyển</Back>
    <Heading japanese="応募の詳細" title={isNew ? "Ghi nhận đơn ứng tuyển" : "Chi tiết đơn ứng tuyển"}>{application ? `${application.title} · ${application.company}` : "Một cơ hội mới, một bước tiến mới. Ghi lại những thông tin bạn muốn theo dõi."}</Heading>
    {query.notice === "saved" && <p className="notice green" role="status">Đã lưu đơn ứng tuyển.</p>}
    {isNew && query.job && !initialJob && <p className="notice amber">Không tìm thấy tin liên kết. Bạn vẫn có thể nhập thông tin đơn bên dưới.</p>}
    <div className="layout-side">
      <ApplicationForm application={application} jobs={jobs} initialJob={initialJob} today={calendarToday()} />
      <aside className="stack">
        {application && <section className="card stack"><div className="aside-note"><span className="tile-icon lavender"><History size={19} /></span><SectionTitle>Lịch sử trạng thái</SectionTitle></div><span className={`tag fit ${statusTones[application.status]}`}>{statusLabels[application.status]}</span><ol className="timeline application-history">{application.events.map((event) => <li key={event.id}><time dateTime={event.createdAt.toISOString()}>{interviewLabel(event.createdAt)}</time><strong>{statusLabels[event.status]}</strong>{event.note && <p>{event.note}</p>}</li>)}</ol></section>}
        <section className="application-tip"><Sparkles size={24} /><h2>Mỗi cơ hội đều đáng nhớ.</h2><p>Ghi lại người liên hệ, phản hồi và việc cần chuẩn bị. Khi trạng thái thay đổi, lịch sử sẽ được giữ lại cho bạn.</p></section>
        {application?.jobId && <Link className="button secondary" href={`/jobs?job=${application.jobId}#job-detail`}><FilePenLine size={16} /> Xem tin tuyển dụng</Link>}
        {application?.applyUrl && <a className="button secondary" href={application.applyUrl} target="_blank" rel="noopener noreferrer">Mở liên kết tuyển dụng <ArrowUpRight size={15} /></a>}
      </aside>
    </div>
  </>;
}
