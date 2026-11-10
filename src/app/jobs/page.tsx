import Link from "next/link";
import { BriefcaseBusiness, Plus, Search } from "lucide-react";
import { readJobs, jobLabels } from "@/modules/jobs/data";
import { JobForm } from "@/modules/jobs/form";
import { normalize } from "@/modules/matching/domain";
import { Back, Empty, Field, Heading, SectionTitle } from "@/shared/ui";

import { SearchParams, singleValues } from "@/shared/query";

export const dynamic = "force-dynamic";
const filters = ["q", "major", "type", "skill", "time"] as const;
export default async function JobsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const [jobs, rawQuery] = await Promise.all([readJobs(), searchParams]);
  const query = singleValues(rawQuery, ["job", ...filters]);
  const matches = (text: string, term: string | undefined) => normalize(text).includes(normalize(term ?? ""));
  const shown = jobs.filter((job) => matches(`${job.title} ${job.company} ${job.description}`, query.q)
    && matches(job.major, query.major) && (!query.type || query.type === job.type)
    && matches(job.requirements.filter((item) => item.kind === "SKILL").map((item) => item.value).join(" "), query.skill)
    && matches(job.schedule, query.time));
  const selected = jobs.find((job) => job.id === query.job);
  const filter = new URLSearchParams();
  for (const key of filters) if (query[key]) filter.set(key, query[key]);
  const href = (id: string) => `/jobs?${new URLSearchParams({ ...Object.fromEntries(filter), job: id })}#job-detail`;
  return <>
    <Back />
    <Heading japanese="求人情報・応募条件" title="Tin tuyển dụng" action={<Link className="button primary" href={href("new")}><Plus size={17} /> Nhập JD thủ công</Link>}>Tìm cơ hội phù hợp với ngành học và kiểm tra các yêu cầu trước khi đánh giá.</Heading>
    <form className="card filters">
      <Field label="Tìm kiếm"><input name="q" placeholder="Vị trí hoặc doanh nghiệp" defaultValue={query.q} /></Field>
      <Field label="Chuyên ngành"><input name="major" placeholder="Tất cả" defaultValue={query.major} /></Field>
      <Field label="Loại công việc"><select name="type" defaultValue={query.type ?? ""}><option value="">Tất cả</option><option value="INTERNSHIP">Thực tập</option><option value="PART_TIME">Việc làm thêm</option></select></Field>
      <Field label="Kỹ năng"><input name="skill" placeholder="Ví dụ: React" defaultValue={query.skill} /></Field>
      <Field label="Lịch làm việc"><input name="time" placeholder="Ví dụ: Thứ 2" defaultValue={query.time} /></Field>
      <button className="button secondary"><Search size={16} /> Lọc tin</button>
    </form>
    <div className="layout-list">
      <section className="stack">
        <SectionTitle detail={`${shown.length} tin · Tin mẫu là dữ liệu giả lập`}>Danh sách cơ hội</SectionTitle>
        {shown.map((job) => <Link key={job.id} href={href(job.id)} className={`card job-card ${selected?.id === job.id ? "selected" : ""}`} aria-current={selected?.id === job.id ? "true" : undefined}>
          <span className="tile-icon"><BriefcaseBusiness size={18} /></span><div><strong>{job.title}</strong><p>{job.company} · {jobLabels[job.type]}</p><div className="tags"><span className="tag neutral">{job.sample ? "Tin mẫu" : "Tin đã nhập"}</span>{job.major && <span className="tag">{job.major}</span>}</div></div>
        </Link>)}
        {!shown.length && <Empty title="Không có tin phù hợp"><p>Thử đổi bộ lọc hoặc nhập JD bạn đang quan tâm.</p><div className="actions"><Link href="/jobs" className="text-link">Xóa bộ lọc</Link><Link href={href("new")} className="text-link">Nhập JD</Link></div></Empty>}
      </section>
      <div id="job-detail">{selected || query.job === "new" ? <JobForm key={selected?.id ?? "new"} job={selected ?? null} /> : <Empty title={query.job ? "Không tìm thấy tin này" : "Chọn một cơ hội để xem chi tiết"}>Bạn có thể chỉnh sửa yêu cầu và phân biệt điều kiện bắt buộc, ưu tiên hoặc cần làm rõ.</Empty>}</div>
    </div>
  </>;
}
