"use client";

import Link from "next/link";
import type { Milestone, MilestoneType } from "@prisma/client";
import { ActionForm } from "@/shared/action-form";
import { Field, SectionTitle, dateLabel } from "@/shared/ui";
import { saveMilestone } from "./actions";
import { milestoneLabels, milestoneTypes } from "./domain";

export function MilestoneForm({ milestone, jobs, back, draft }: {
  milestone: Milestone | null; jobs: { id: string; title: string }[]; back: string;
  draft: { jobId?: string; title?: string; type: MilestoneType };
}) {
  return <ActionForm action={saveMilestone.bind(null, milestone?.id ?? "")}>{(pending) => <section className="card stack">
    <SectionTitle detail={milestone ? `Tạo ngày ${dateLabel(milestone.createdAt)}` : "Bạn có thể hoàn thành ngay hoặc quay lại ghi nhận sau."}>Thông tin cột mốc</SectionTitle>
    {milestone?.completedAt && <div className="notice green">Đã hoàn thành ngày {dateLabel(milestone.completedAt)}</div>}
    <Field label="Tên cột mốc"><input name="title" required maxLength={160} defaultValue={milestone?.title ?? draft.title} placeholder="Ví dụ: Ôn lại các thao tác Git cơ bản" /></Field>
    <Field label="Loại cột mốc"><select name="type" defaultValue={milestone?.type ?? draft.type}>{milestoneTypes.map((type) => <option key={type} value={type}>{milestoneLabels[type]}</option>)}</select></Field>
    <Field label="Mô tả"><textarea name="description" rows={3} defaultValue={milestone?.description} /></Field>
    <Field label="Tin tuyển dụng liên quan"><select name="job" defaultValue={milestone?.jobId ?? draft.jobId ?? ""}><option value="">Không liên kết</option>{jobs.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}</select></Field>
    <Field label="Điều đã học" help="Bạn có thể ghi kỹ năng đã luyện, kiến thức mới hoặc việc mình muốn làm tiếp."><textarea name="learned" rows={4} defaultValue={milestone?.learned} /></Field>
    <div className="actions"><button name="intent" value="save" disabled={pending} className="button primary">Lưu cột mốc</button>
      {!milestone?.completedAt && <button name="intent" value="complete" disabled={pending} className="button secondary">Hoàn thành và lưu ghi nhận</button>}
      <Link href={back} className="button secondary">Hủy</Link>
    </div>
    {milestone && <button type="submit" name="intent" value="delete" disabled={pending} formNoValidate className="text-link delete-button fit" onClick={(event) => {
      if (!window.confirm("Xóa cột mốc này? Nhật ký hoàn thành trước đây sẽ được giữ lại.")) event.preventDefault();
    }}>Xóa cột mốc</button>}
  </section>}</ActionForm>;
}
