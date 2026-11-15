"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Lightbulb } from "lucide-react";
import type { Milestone } from "@prisma/client";
import { ActionForm } from "@/shared/action-form";
import { Field, SectionTitle, dateLabel } from "@/shared/ui";
import { saveMilestone } from "./actions";
import { milestoneLabels, milestoneTypes } from "./domain";
import type { MilestoneSuggestion, suggestMilestones } from "./suggestions";

export function MilestoneForm({ milestone, jobs, back, jobId, suggestions }: {
  milestone: Milestone | null; jobs: { id: string; title: string }[]; back: string;
  jobId?: string; suggestions: ReturnType<typeof suggestMilestones> | null;
}) {
  const recommendation = suggestions?.recommended;
  const [details, setDetails] = useState({
    title: milestone?.title ?? recommendation?.title ?? "",
    description: milestone?.description ?? recommendation?.description ?? "",
    type: milestone?.type ?? recommendation?.type ?? "RESEARCH",
    jobId: milestone?.jobId ?? jobId ?? "",
  });
  const titleInput = useRef<HTMLInputElement>(null);

  function choose(suggestion: MilestoneSuggestion) {
    setDetails({ title: suggestion.title, description: suggestion.description, type: suggestion.type, jobId: suggestion.jobId ?? "" });
    titleInput.current?.focus();
  }

  return <div className="layout-side">
    {suggestions && <aside className="card stack milestone-suggestions">
      <div className="aside-note"><span className="tile-icon"><Lightbulb size={18} /></span><SectionTitle detail="Chọn một việc để điền vào form, sau đó sửa theo kế hoạch của bạn.">Gợi ý cột mốc</SectionTitle></div>
      {suggestions.options.map((suggestion) => <button key={suggestion.id} type="button" className="row-link text-left" onClick={() => choose(suggestion)}>
        <div><strong>{suggestion.title}</strong><small>{suggestion.description}</small></div>
      </button>)}
    </aside>}
    <ActionForm action={saveMilestone.bind(null, milestone?.id ?? "")}>{(pending) => <section className="card stack">
    <SectionTitle detail={milestone ? `Tạo ngày ${dateLabel(milestone.createdAt)}` : "Bạn có thể hoàn thành ngay hoặc quay lại ghi nhận sau."}>Thông tin cột mốc</SectionTitle>
    {milestone?.completedAt && <div className="notice green">Đã hoàn thành ngày {dateLabel(milestone.completedAt)}</div>}
    <Field label="Tên cột mốc"><input ref={titleInput} name="title" required maxLength={160} value={details.title} onChange={(event) => setDetails({ ...details, title: event.target.value })} placeholder="Ví dụ: Ôn lại các thao tác Git cơ bản" /></Field>
    <Field label="Loại cột mốc"><select name="type" value={details.type} onChange={(event) => setDetails({ ...details, type: event.target.value as Milestone["type"] })}>{milestoneTypes.map((type) => <option key={type} value={type}>{milestoneLabels[type]}</option>)}</select></Field>
    <Field label="Hạn hoàn thành" help="Không bắt buộc. Cột mốc đến hạn và quá hạn sẽ được đánh dấu trong hành trình."><input name="dueDate" type="date" min="1900-01-01" max="9999-12-31" defaultValue={milestone?.dueDate ?? ""} /></Field>
    <Field label="Mô tả"><textarea name="description" rows={3} value={details.description} onChange={(event) => setDetails({ ...details, description: event.target.value })} /></Field>
    <Field label="Tin tuyển dụng liên quan"><select name="job" value={details.jobId} onChange={(event) => setDetails({ ...details, jobId: event.target.value })}><option value="">Không liên kết</option>{jobs.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}</select></Field>
    <div className="divider" />
    <SectionTitle detail="Điền những mục phù hợp với việc bạn vừa làm. Bạn có thể bổ sung sau khi hoàn thành.">Ghi nhận sau cột mốc</SectionTitle>
    <Field label="Điều đã học"><textarea name="learned" rows={3} maxLength={4000} defaultValue={milestone?.learned} placeholder="Ví dụ: Biết khi nào nên dùng thẻ HTML ngữ nghĩa" /></Field>
    <Field label="Kỹ năng đã cải thiện"><textarea name="improvedSkills" rows={2} maxLength={4000} defaultValue={milestone?.improvedSkills} placeholder="Ví dụ: Tự xử lý xung đột khi dùng Git" /></Field>
    <Field label="Kinh nghiệm thu được"><textarea name="experienceGained" rows={2} maxLength={4000} defaultValue={milestone?.experienceGained} placeholder="Ví dụ: Thử trình bày dự án trong hai phút và nhận phản hồi" /></Field>
    <div className="actions"><button name="intent" value="save" disabled={pending} className="button primary">Lưu cột mốc</button>
      {!milestone?.completedAt && <button name="intent" value="complete" disabled={pending} className="button secondary">Hoàn thành và lưu ghi nhận</button>}
      <Link href={back} className="button secondary">Hủy</Link>
    </div>
    {milestone && <button type="submit" name="intent" value="delete" disabled={pending} formNoValidate className="text-link delete-button fit" onClick={(event) => {
      if (!window.confirm("Xóa cột mốc này? Nhật ký hoàn thành trước đây sẽ được giữ lại.")) event.preventDefault();
    }}>Xóa cột mốc</button>}
    </section>}</ActionForm>
    {milestone && <aside className="card callout"><Lightbulb /><h2>Điều chỉnh cột mốc</h2><p>Bạn có thể chia nhỏ việc cần làm hoặc đổi hạn để phù hợp với lịch của mình.</p></aside>}
  </div>;
}
