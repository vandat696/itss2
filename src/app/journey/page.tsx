import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, CheckCircle2, ClipboardCheck, Compass, FileText, Flag, Plus, Sprout, Bookmark } from "lucide-react";
import { readJourney } from "@/modules/journey/data";
import { milestoneLabels } from "@/modules/milestones/domain";
import { dateLabel, Empty, Heading, RowLink, SectionTitle } from "@/shared/ui";

export const dynamic = "force-dynamic";
export default async function JourneyPage() {
  const data = await readJourney();
  const stats = [
    { label: "Cột mốc hoàn thành", value: data.completed, icon: CheckCircle2 },
    { label: "Kỹ năng bổ sung", value: data.added, icon: Sprout },
    { label: "Tin đã đánh giá", value: data.assessed, icon: ClipboardCheck },
    { label: "Cơ hội đã lưu", value: data.saved, icon: Bookmark },
    { label: "Lần cập nhật CV", value: data.cvUpdates, icon: FileText },
  ];
  return <>
    <Heading japanese="就職活動の歩み" title="Hành trình tìm việc" action={<Link className="button primary" href="/milestones/new"><Plus size={17} /> Tạo cột mốc</Link>}>Theo dõi những bước nhỏ bạn đã thực hiện, từ kỹ năng đầu tiên đến cơ hội tiếp theo.</Heading>
    <section className="hero journey-hero">
      <div><span className="hero-kicker"><Compass size={16} /> NHỊP ĐỘ CỦA RIÊNG BẠN</span><h2>Mỗi bước nhỏ đều có ý nghĩa.</h2><p>Tìm hiểu một công việc, bổ sung kỹ năng hay cập nhật CV đều là những bước tiến.</p><div className="actions"><Link className="button hero-button" href="/jobs"><BriefcaseBusiness size={16} /> Khám phá tuyển dụng <ArrowUpRight size={15} /></Link><Link className="button hero-outline" href="/profile">{data.profile ? "Cập nhật hồ sơ" : "Tạo hồ sơ năng lực"}</Link></div></div>
      <div className="hero-visual" aria-hidden="true"><Compass size={125} strokeWidth={0.9} /></div>
    </section>
    <div className="stats">{stats.map(({ label, value, icon: Icon }) => <article className="card stat" key={label}><span className="tile-icon green"><Icon size={18} /></span><strong>{value}</strong><small>{label}</small></article>)}</div>
    <div className="journey-grid">
      <div className="stack">
        <section className="card stack"><SectionTitle detail={`${data.completed} / ${data.milestones.length} cột mốc đã hoàn thành`}>Cột mốc của bạn</SectionTitle>
          <progress className="progress" aria-label="Tiến độ cột mốc" value={data.progress} max={100} />
          {!data.milestones.length && <Empty title="Một mục tiêu nhỏ cho hôm nay"><p>Hãy chọn một việc vừa sức, ví dụ cập nhật phần dự án trong CV.</p><Link className="text-link" href="/milestones/new">Tạo cột mốc đầu tiên</Link></Empty>}
          {data.milestones.map((item) => <RowLink key={item.id} href={`/milestones/${item.id}`} title={item.title} detail={`${milestoneLabels[item.type]} · ${dateLabel(item.completedAt ?? item.createdAt)}`} badge={<span className={`tag ${item.status === "COMPLETED" ? "green" : "neutral"}`}>{item.status === "COMPLETED" ? "Hoàn thành" : "Đang mở"}</span>} />)}
        </section>
        <section className="card stack"><SectionTitle detail="Mở lại các bản đánh giá hoặc tìm cơ hội đã lưu.">Cơ hội của bạn</SectionTitle>
          {!data.assessedJobs.length && <Empty title="Bạn chưa đánh giá cơ hội nào"><Link className="text-link" href="/jobs">Xem tin tuyển dụng</Link></Empty>}
          {data.assessedJobs.map((job) => <div key={job.id} className="stack compact">
            <div><strong>{job.title}</strong><p className="muted">{job.company}{job.saved ? " · Đã lưu" : ""}</p></div>
            {job.assessments.map((assessment) => <RowLink key={assessment.id} href={`/jobs/${job.id}/match?assessment=${assessment.id}`} title={assessment.percent === null ? "Chưa đủ thông tin" : `Phù hợp ${assessment.percent}%`} detail={dateLabel(assessment.createdAt)} />)}
          </div>)}
        </section>
      </div>
      <aside className="stack">
        <section className="card stack"><div className="aside-note"><span className="tile-icon"><Flag size={19} /></span><SectionTitle>Điểm xuất phát</SectionTitle></div>
          {data.initial ? <><strong>{data.initial.title}</strong><p className="muted">{dateLabel(data.initial.createdAt)} · {data.initial.detail}</p>{data.initialSkills.length > 0 && <div className="tags">{data.initialSkills.map((skill) => <span className="tag" key={skill}>{skill}</span>)}</div>}{data.profile?.snapshots.length ? <small>CV gần nhất: {data.profile.snapshots[0].original}</small> : <small>Chưa đính kèm CV</small>}</> : <Empty title="Chưa có hồ sơ"><Link className="text-link" href="/profile">Thiết lập hồ sơ</Link></Empty>}
        </section>
        <section className="card stack"><SectionTitle>Nhật ký tiến bộ</SectionTitle>
          {data.timeline.length ? <ol className="timeline">{data.timeline.map((event) => <li key={event.id}><time dateTime={event.createdAt.toISOString()}>{dateLabel(event.createdAt)}</time><strong>{event.title}</strong><p>{event.detail}</p></li>)}</ol> : <p className="muted">Các lần cập nhật hồ sơ và cột mốc hoàn thành sẽ xuất hiện ở đây.</p>}
        </section>
      </aside>
    </div>
  </>;
}
