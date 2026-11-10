"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Job } from "./data";
import { categoryLabels, criterionLabels } from "./requirements";
import { saveJob } from "./actions";
import { criteria, requirementTypes } from "@/modules/matching/domain";
import { ActionForm } from "@/shared/action-form";
import { Field, SectionTitle } from "@/shared/ui";

type Draft = Pick<Job["requirements"][number], "kind" | "type" | "value"> & { key: number };

export function JobForm({ job }: { job: Job | null }) {
  const [items, setItems] = useState<Draft[]>(() => (job?.requirements ?? []).map((item, key) => ({ ...item, key })));
  const [nextKey, setNextKey] = useState(items.length);
  return <ActionForm action={saveJob.bind(null, job?.id ?? "")}>{(pending) => <section className="card stack">
    <SectionTitle detail={job?.sample ? "Tin giả lập dùng để minh họa. Bạn có thể chỉnh sửa các điều kiện trước khi đánh giá." : "Nhập thông tin từ JD và kiểm tra từng yêu cầu trước khi đối chiếu."}>{job ? "Chi tiết và yêu cầu" : "Nhập tin tuyển dụng"}</SectionTitle>
    <div className="two"><Field label="Tên vị trí"><input name="title" required defaultValue={job?.title} /></Field>
    <Field label="Doanh nghiệp"><input name="company" required defaultValue={job?.company} /></Field>
    <Field label="Chuyên ngành"><input name="major" defaultValue={job?.major} /></Field>
    <Field label="Loại công việc"><select name="type" defaultValue={job?.type}><option value="INTERNSHIP">Thực tập</option><option value="PART_TIME">Việc làm thêm</option></select></Field></div>
    <Field label="Mô tả công việc"><textarea name="description" rows={3} defaultValue={job?.description} /></Field>
    <div className="two"><Field label="Lịch làm việc"><input name="schedule" defaultValue={job?.schedule} /></Field>
    <Field label="Kinh nghiệm"><input name="experience" defaultValue={job?.experience} /></Field></div>
    <Field label="Liên kết ứng tuyển gốc"><input name="applyUrl" type="url" defaultValue={job?.applyUrl ?? ""} placeholder="https://…" /></Field>
    <div className="divider" />
    <SectionTitle detail="Nếu chưa biết mức độ quan trọng, hãy chọn Chưa rõ. Với lịch, nhập 2 09:00-12:00 (8 là Chủ nhật). Với kinh nghiệm, nhập số tháng.">Các yêu cầu tuyển dụng</SectionTitle>
    {!items.length && <p className="muted">Chưa có tiêu chí. Bạn vẫn có thể lưu tin để bổ sung sau.</p>}
    {items.map((item, index) => <fieldset className="requirement stack" key={item.key}>
      <legend>Tiêu chí {index + 1}</legend>
      <div className="two"><Field label="Mức độ"><select name="category" defaultValue={item.type}>{requirementTypes.map((type) => <option key={type} value={type}>{categoryLabels[type]}</option>)}</select></Field>
      <Field label="Đối chiếu"><select name="criterion" defaultValue={item.kind}>{criteria.map((kind) => <option key={kind} value={kind}>{criterionLabels[kind]}</option>)}</select></Field></div>
      <div className="with-button"><Field label="Nội dung yêu cầu"><input name="value" defaultValue={item.value} required /></Field><button className="icon-button" type="button" aria-label={`Xóa tiêu chí ${index + 1}`} onClick={() => setItems(items.filter(({ key }) => key !== item.key))}><Trash2 size={17} /></button></div>
    </fieldset>)}
    <button className="button secondary fit" type="button" disabled={items.length >= 30} onClick={() => { setItems([...items, { key: nextKey, kind: "SKILL", type: "UNCLEAR", value: "" }]); setNextKey(nextKey + 1); }}><Plus size={16} /> Thêm tiêu chí</button>
    <div className="actions"><button className="button primary" disabled={pending} name="intent" value="confirm">Xác nhận yêu cầu và xem mức độ phù hợp</button>
    <button className="button secondary" disabled={pending} name="intent" value="draft">Lưu tin</button></div>
  </section>}</ActionForm>;
}
