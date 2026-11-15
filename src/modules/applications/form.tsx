"use client";

import Link from "next/link";
import { useState } from "react";
import type { JobApplication } from "@prisma/client";
import { CalendarClock, Check, FilePenLine, Trash2 } from "lucide-react";
import { ActionForm } from "@/shared/action-form";
import { Field, SectionTitle } from "@/shared/ui";
import { saveApplication } from "./actions";
import { applicationStatuses, interviewInput, statusLabels } from "./domain";

type JobOption = { id: string; title: string; company: string; applyUrl: string | null; sample: boolean };
export function ApplicationForm({ application, jobs, initialJob, today }: {
  application: JobApplication | null; jobs: JobOption[]; initialJob?: JobOption; today: string;
}) {
  const [title, setTitle] = useState(application?.title ?? initialJob?.title ?? "");
  const [company, setCompany] = useState(application?.company ?? initialJob?.company ?? "");
  const [url, setUrl] = useState(application?.applyUrl ?? initialJob?.applyUrl ?? "");
  return <ActionForm action={saveApplication.bind(null, application?.id ?? "")}>{(pending) => <>
    <section className="card stack application-form-section">
      <SectionTitle detail="Ghi nhận đơn bạn đã nộp. Michii không tự gửi hồ sơ đến doanh nghiệp.">Thông tin ứng tuyển</SectionTitle>
      <Field label="Tin tuyển dụng liên quan"><select name="jobId" defaultValue={application?.jobId ?? initialJob?.id ?? ""} onChange={(event) => {
        const job = jobs.find((item) => item.id === event.target.value);
        if (job) { setTitle(job.title); setCompany(job.company); setUrl(job.applyUrl ?? ""); }
      }}><option value="">Nhập riêng, không liên kết tin</option>{jobs.map((job) => <option value={job.id} key={job.id}>{job.company} · {job.title}{job.sample ? " (Tin mẫu)" : ""}</option>)}</select></Field>
      <div className="two"><Field label="Vị trí ứng tuyển"><input name="title" required maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ví dụ: Frontend Developer Intern" /></Field>
        <Field label="Doanh nghiệp"><input name="company" required maxLength={160} value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Tên công ty bạn ứng tuyển" /></Field></div>
      <div className="two"><Field label="Trạng thái đơn"><select name="status" defaultValue={application?.status ?? "APPLIED"}>{applicationStatuses.map((status) => <option value={status} key={status}>{statusLabels[status]}</option>)}</select></Field>
        <Field label="Ngày nộp hồ sơ"><input name="appliedOn" type="date" required min="1900-01-01" max={today} defaultValue={application?.appliedOn ?? today} /></Field></div>
      <Field label="Liên kết tuyển dụng"><input name="applyUrl" type="url" maxLength={2048} value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://…" /></Field>
    </section>
    <section className="card stack application-form-section">
      <div className="aside-note"><span className="tile-icon lavender"><CalendarClock size={19} /></span><SectionTitle detail="Ngày và giờ hiển thị theo giờ Việt Nam (UTC+7).">Lịch hẹn & bước tiếp theo</SectionTitle></div>
      <div className="two"><Field label="Lịch phỏng vấn"><input name="interviewAt" type="datetime-local" min="1900-01-01T00:00" max="9999-12-31T23:59" defaultValue={interviewInput(application?.interviewAt ?? null)} /></Field>
        <Field label="Ngày theo dõi tiếp" help="Đánh dấu khi bạn cần kiểm tra phản hồi hoặc liên hệ lại."><input name="followUpOn" type="date" min="1900-01-01" max="9999-12-31" defaultValue={application?.followUpOn ?? ""} /></Field></div>
      <Field label="Người liên hệ" help="Tên, email hoặc thông tin người phụ trách tuyển dụng."><input name="contact" maxLength={160} defaultValue={application?.contact} placeholder="Ví dụ: Chị Linh · hr@congty.vn" /></Field>
      <Field label="Ghi chú" help="Ghi lại vòng phỏng vấn, phản hồi hoặc việc cần chuẩn bị."><textarea name="notes" rows={5} maxLength={4000} defaultValue={application?.notes} placeholder="Mình đã gửi CV và portfolio. Chuẩn bị trình bày dự án React…" /></Field>
    </section>
    <div className="actions"><button className="button primary" disabled={pending} name="intent" value="save"><Check size={17} />{pending ? "Đang lưu…" : application ? "Lưu cập nhật" : "Lưu đơn ứng tuyển"}</button><Link href="/applications" className="button secondary">Hủy</Link>
      {application && <button className="text-link delete-button" type="submit" name="intent" value="delete" formNoValidate disabled={pending} onClick={(event) => {
        if (!window.confirm("Xóa đơn ứng tuyển và lịch sử trạng thái của đơn này?")) event.preventDefault();
      }}><Trash2 size={15} /> Xóa đơn</button>}
    </div>
    {!application && <p className="muted actions"><FilePenLine size={15} /> Bạn có thể quay lại cập nhật trạng thái bất cứ lúc nào.</p>}
  </>}</ActionForm>;
}
