import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, CheckCircle2, ClipboardCheck, Compass, FileText, Flag, Plus, Sprout, Bookmark } from "lucide-react";
import { readJourney } from "@/modules/journey/data";
import { calendarToday, deadlineState, dueDateLabel, milestoneLabels } from "@/modules/milestones/domain";
import { dateLabel, Empty, Heading, RowLink, SectionTitle } from "@/shared/ui";
import { SearchParams, singleValues } from "@/shared/query";

export const dynamic = "force-dynamic";
export default async function JourneyPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const data = await readJourney();
  const latestCv = data.profile?.snapshots[0];
  const query = singleValues(await searchParams, ["status", "progress"]);
  const tabs = [{ value: "all", label: "Tất cả" }, { value: "open", label: "Đang mở" }, { value: "overdue", label: "Quá hạn" }, { value: "completed", label: "Hoàn thành" }];
  const active = tabs.some((tab) => tab.value === query.status) ? query.status : "all";
  const sinceStart = Boolean(data.startAt && query.progress === "since-start");
  const timeline = sinceStart ? data.sinceStart.timeline : data.timeline;
  function journeyHref(status: string | undefined, fromStart: boolean, anchor: string) {
    const params = new URLSearchParams();
    if (status && status !== "all") params.set("status", status);
    if (fromStart) params.set("progress", "since-start");
    const search = params.toString();
    return `/journey${search ? `?${search}` : ""}#${anchor}`;
  }
  const today = calendarToday();
  const filtered = data.milestones.filter((item) => active === "all" || (active === "open" ? item.status === "OPEN" : deadlineState(item, today) === active));
  const milestones = [...filtered].sort((a, b) => Number(a.status === "COMPLETED") - Number(b.status === "COMPLETED") || (a.dueDate ?? "9999-12-31").localeCompare(b.dueDate ?? "9999-12-31"));
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
          <nav className="milestone-tabs" aria-label="Lọc cột mốc">{tabs.map((tab) => <Link key={tab.value} href={journeyHref(tab.value, sinceStart, "milestone-list")} aria-current={active === tab.value ? "page" : undefined}>{tab.label}<span>{data.milestones.filter((item) => tab.value === "all" || (tab.value === "open" ? item.status === "OPEN" : deadlineState(item, today) === tab.value)).length}</span></Link>)}</nav>
          <div id="milestone-list" className="stack compact">
          {!data.milestones.length && <Empty title="Một mục tiêu nhỏ cho hôm nay"><p>Hãy chọn một việc vừa sức, ví dụ cập nhật phần dự án trong CV.</p><Link className="text-link" href="/milestones/new">Tạo cột mốc đầu tiên</Link></Empty>}
          {data.milestones.length > 0 && !milestones.length && <Empty title="Không có cột mốc trong nhóm này"><Link href={journeyHref("all", sinceStart, "milestone-list")} className="text-link">Xem tất cả cột mốc</Link></Empty>}
          {milestones.map((item) => {
            const state = deadlineState(item, today);
            return <RowLink key={item.id} href={`/milestones/${item.id}`} title={item.title} detail={`${milestoneLabels[item.type]} · ${item.dueDate ? `Hạn ${dueDateLabel(item.dueDate)}` : dateLabel(item.completedAt ?? item.createdAt)}`} badge={<span className={`tag ${state === "completed" ? "green" : state === "overdue" ? "danger" : state === "today" ? "amber" : "neutral"}`}>{state === "completed" ? "Hoàn thành" : state === "overdue" ? "Quá hạn" : state === "today" ? "Đến hạn hôm nay" : "Đang mở"}</span>} />;
          })}
          </div>
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
        <section className="card stack" aria-label="Điểm xuất phát">
          <div className="aside-note"><span className="tile-icon"><Flag size={19} /></span><SectionTitle>Điểm xuất phát</SectionTitle></div>
          {data.firstCv ? <>
            <div className="stack compact">
              <strong>CV đầu tiên</strong>
              <p className="muted">{data.firstCv.original} · {dateLabel(data.firstCv.createdAt)}</p>
              <a className="text-link fit" href={`/api/cv/${data.firstCv.id}`} download>Tải CV đầu tiên</a>
            </div>
            {latestCv && latestCv.id !== data.firstCv.id && <div className="stack compact">
              <strong>CV gần nhất</strong>
              <p className="muted">{latestCv.original} · {dateLabel(latestCv.createdAt)}</p>
              <a className="text-link fit" href={`/api/cv/${latestCv.id}`} download>Tải CV gần nhất</a>
            </div>}
          </> : data.initial ? <>
            <div><strong>{data.initial.title}</strong><p className="muted">{dateLabel(data.initial.createdAt)} · {data.initial.detail}</p></div>
            <Link className="text-link fit" href="/profile">Đính kèm CV đầu tiên</Link>
          </> : <Empty title="Chưa có hồ sơ"><Link className="text-link" href="/profile">Thiết lập hồ sơ</Link></Empty>}
          {(data.firstCv || data.initial) && <div className="stack compact">
            <strong>Kỹ năng lúc bắt đầu</strong>
            {data.initialSkills.length ? <div className="tags">{data.initialSkills.map((skill) => <span className="tag" key={skill}>{skill}</span>)}</div> : <small>Hồ sơ lúc bắt đầu chưa có kỹ năng được nhập.</small>}
            <strong>Kỹ năng bổ sung</strong>
            {data.addedSkills.length ? <div className="tags">{data.addedSkills.map((skill) => <span className="tag green" key={skill}>{skill}</span>)}</div> : <small>Chưa có kỹ năng mới trong hồ sơ.</small>}
          </div>}
          {data.startAt && <div className="progress-comparison stack compact">
            <h3>Tiến bộ so với điểm xuất phát</h3>
            <p className="muted">Từ {dateLabel(data.startAt)} đến nay</p>
            <dl className="progress-totals">
              <div><dt>Kỹ năng mới trong hồ sơ</dt><dd>{data.added}</dd></div>
              <div><dt>Lần cập nhật CV</dt><dd>{data.cvUpdates}</dd></div>
              <div><dt>Cột mốc đã hoàn thành</dt><dd>{data.sinceStart.completed}</dd></div>
            </dl>
            <Link className="text-link fit" href={journeyHref(active, true, "progress-log")}>Xem nhật ký từ điểm xuất phát</Link>
          </div>}
        </section>
        <section id="progress-log" className="card stack" aria-label="Nhật ký tiến bộ"><SectionTitle>Nhật ký tiến bộ</SectionTitle>
          {data.startAt && <nav className="milestone-tabs" aria-label="Lọc nhật ký tiến bộ">
            <Link href={journeyHref(active, false, "progress-log")} aria-current={sinceStart ? undefined : "page"}>Toàn bộ hoạt động</Link>
            <Link href={journeyHref(active, true, "progress-log")} aria-current={sinceStart ? "page" : undefined}>Từ điểm xuất phát</Link>
          </nav>}
          {timeline.length ? <ol className="timeline">{timeline.map((event) => <li key={event.id}>
            <time dateTime={event.createdAt.toISOString()}>{dateLabel(event.createdAt)}</time>
            {event.kind === "MILESTONE" && <span className="tag green">Cột mốc hoàn thành</span>}
            {event.kind === "REFLECTION" && <span className="tag green">Cập nhật ghi nhận</span>}
            <strong>{event.title}</strong><p>{event.detail}</p>
          </li>)}</ol> : <p className="muted">Các lần cập nhật hồ sơ và cột mốc hoàn thành sẽ xuất hiện ở đây.</p>}
        </section>
      </aside>
    </div>
  </>;
}
