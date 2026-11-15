import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, CalendarClock, Check, ChevronRight, Clock3, MailCheck, Plus, Search, Send, Sparkles } from "lucide-react";
import { readApplications } from "@/modules/applications/data";
import { applicationStatuses, interviewLabel, isActiveApplication, needsFollowUp, statusLabels, statusTones } from "@/modules/applications/domain";
import { normalize } from "@/modules/matching/domain";
import { calendarToday, dueDateLabel } from "@/modules/milestones/domain";
import { Empty, Field, Heading, SectionTitle } from "@/shared/ui";
import { SearchParams, singleValues } from "@/shared/query";

export const dynamic = "force-dynamic";
export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const [applications, rawQuery] = await Promise.all([readApplications(), searchParams]);
  const query = singleValues(rawQuery, ["q", "status", "notice"]);
  const status = applicationStatuses.find((value) => value === query.status);
  const today = calendarToday();
  const now = new Date();
  const shown = applications.filter((item) => (!status || item.status === status)
    && normalize(`${item.title} ${item.company} ${item.contact} ${item.notes}`).includes(normalize(query.q ?? "")));
  const active = applications.filter((item) => isActiveApplication(item.status));
  const followUps = applications.filter((item) => needsFollowUp(item, today)).sort((a, b) => a.followUpOn!.localeCompare(b.followUpOn!));
  const upcoming = active.filter((item) => item.interviewAt && item.interviewAt >= now).sort((a, b) => a.interviewAt!.getTime() - b.interviewAt!.getTime()).slice(0, 3);
  const stats = [
    { label: "Đơn đã ghi nhận", value: applications.length, icon: Send, tone: "lavender" },
    { label: "Đang theo đuổi", value: active.length, icon: BriefcaseBusiness, tone: "peach" },
    { label: "Đang phỏng vấn", value: applications.filter((item) => item.status === "INTERVIEW").length, icon: CalendarClock, tone: "blue" },
    { label: "Đề nghị nhận việc", value: applications.filter((item) => item.status === "OFFER").length, icon: MailCheck, tone: "green" },
  ];
  const filterHref = (value?: string) => {
    const params = new URLSearchParams();
    if (query.q) params.set("q", query.q);
    if (value) params.set("status", value);
    return `/applications${params.size ? `?${params}` : ""}#application-list`;
  };
  return <>
    <Heading japanese="応募の記録" title="Theo dõi ứng tuyển" action={<Link className="button primary" href="/applications/new"><Plus size={17} /> Thêm đơn ứng tuyển</Link>}>Mỗi lần gửi hồ sơ là một bước tiến. Giữ các cơ hội và việc cần làm tiếp trong cùng một nơi.</Heading>
    {query.notice === "deleted" && <p role="status" className="notice green">Đã xóa đơn ứng tuyển.</p>}
    <section className="application-banner">
      <div><span className="eyebrow actions"><Sparkles size={15} /> TỪ CƠ HỘI ĐẾN BƯỚC TIẾP THEO</span><h2>Một hành trình.<br /><em>Nhiều cánh cửa đang mở.</em></h2><p>Ghi lại nơi bạn đã ứng tuyển, chuẩn bị cho cuộc hẹn và dành thời gian cho cơ hội phù hợp.</p><Link href="/jobs" className="text-link actions">Khám phá thêm công việc <ArrowUpRight size={16} /></Link></div>
      <div className="application-route" aria-hidden="true"><span className="application-route-dot"><Send size={22} /></span><span className="route-line" /><span className="application-route-dot peach"><CalendarClock size={22} /></span><span className="route-line" /><span className="application-route-dot green"><Check size={25} /></span></div>
    </section>
    <div className="application-stats">{stats.map(({ label, value, icon: Icon, tone }) => <article className="card application-stat" key={label}><span className={`tile-icon ${tone}`}><Icon size={19} /></span><div><strong>{value}</strong><small>{label}</small></div></article>)}</div>
    <div className="application-layout">
      <section className="card stack">
        <SectionTitle detail={`${shown.length} / ${applications.length} đơn · Dữ liệu được lưu trên máy`}>Những cơ hội bạn đã chọn</SectionTitle>
        <form className="application-search" key={`${query.q ?? ""}-${status ?? ""}`}>
          {status && <input type="hidden" name="status" value={status} />}
          <Field label="Tìm đơn ứng tuyển"><input name="q" defaultValue={query.q} placeholder="Vị trí, công ty hoặc ghi chú…" /></Field><button className="button secondary"><Search size={17} /> Tìm</button>
        </form>
        <nav className="application-tabs" aria-label="Lọc đơn ứng tuyển"><Link href={filterHref()} aria-current={!status ? "page" : undefined}>Tất cả <span>{applications.length}</span></Link>{applicationStatuses.map((value) => <Link key={value} href={filterHref(value)} aria-current={status === value ? "page" : undefined}>{statusLabels[value]}<span>{applications.filter((item) => item.status === value).length}</span></Link>)}</nav>
        <div id="application-list" className="stack compact">
          {!applications.length ? <div className="application-empty"><span className="application-empty-icon"><Send size={33} strokeWidth={1.4} /></span><h3>Bắt đầu từ một đơn đã gửi.</h3><p>Thêm công việc bạn đã nộp hồ sơ.<br />Michii giúp bạn ghi nhớ bước tiếp theo.</p><Link href="/applications/new" className="button primary"><Plus size={16} /> Ghi nhận đơn đầu tiên</Link></div>
            : !shown.length ? <Empty title="Chưa có đơn phù hợp với bộ lọc"><Link className="text-link" href="/applications">Xem tất cả đơn</Link></Empty>
            : shown.map((item) => <Link href={`/applications/${item.id}`} key={item.id} className="application-card">
              <span className="company-monogram" aria-hidden="true">{Array.from(item.company)[0]?.toUpperCase()}</span>
              <div className="application-card-main"><div className="application-card-heading"><h3>{item.title}</h3><span className={`tag ${statusTones[item.status]}`}>{statusLabels[item.status]}</span></div><p>{item.company}{item.job?.sample ? " · Tin mẫu" : ""}</p><div className="application-meta"><span><Send size={13} /> Nộp {dueDateLabel(item.appliedOn)}</span>{item.interviewAt && <span><CalendarClock size={13} /> {interviewLabel(item.interviewAt)}</span>}{needsFollowUp(item, today) && <span className="follow-up"><Clock3 size={13} /> Cần theo dõi{item.followUpOn === today ? " hôm nay" : ""}</span>}</div></div><ChevronRight className="application-chevron" size={18} />
            </Link>)}
        </div>
      </section>
      <aside className="stack">
        <section className="card stack application-agenda"><div className="aside-note"><span className="tile-icon peach"><CalendarClock size={19} /></span><SectionTitle detail="Giờ Việt Nam · UTC+7">Cuộc hẹn sắp tới</SectionTitle></div>{upcoming.length ? upcoming.map((item) => <Link key={item.id} href={`/applications/${item.id}`} className="agenda-entry"><time dateTime={item.interviewAt!.toISOString()}>{interviewLabel(item.interviewAt!)}</time><strong>{item.title}</strong><small>{item.company}</small><span className="text-link actions">Xem chi tiết <ArrowUpRight size={13} /></span></Link>) : <p className="muted">Chưa có lịch phỏng vấn sắp tới. Thêm lịch hẹn trong chi tiết đơn để tiện chuẩn bị.</p>}</section>
        <section className="card stack"><SectionTitle detail={`${followUps.length} đơn đến ngày theo dõi`}>Một lời nhắc nhỏ</SectionTitle>{followUps.length ? followUps.slice(0, 4).map((item) => <Link key={item.id} href={`/applications/${item.id}`} className="follow-up-entry"><Clock3 size={17} /><div><strong>{item.company}</strong><small>Theo dõi từ {dueDateLabel(item.followUpOn!)}</small></div><ChevronRight size={15} /></Link>) : <p className="muted">Khi có ngày cần liên hệ lại, Michii sẽ đánh dấu tại đây. Bạn đang chủ động với hành trình của mình.</p>}</section>
        <div className="application-tip"><Sparkles size={22} /><h3>Chậm một chút cũng được.</h3><p>Một lần chưa phù hợp không định nghĩa năng lực của bạn. Ghi lại điều đã học và tiếp tục bước tới.</p></div>
      </aside>
    </div>
  </>;
}
