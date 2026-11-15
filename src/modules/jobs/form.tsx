"use client";

import { useState } from "react";
import { Plus, ScanText, Trash2 } from "lucide-react";
import type { Job } from "./data";
import { categoryHelp, categoryLabels, criterionLabels } from "./requirements";
import { saveJob } from "./actions";
import { extractRequirements, requirementKey } from "./extract-requirements";
import { criteria, requirementTypes } from "@/modules/matching/domain";
import { ActionForm } from "@/shared/action-form";
import { Field, SectionTitle } from "@/shared/ui";

type Draft = Pick<Job["requirements"][number], "kind" | "type" | "value"> & { key: number };

const criterionPlaceholders = {
  SKILL: "Ví dụ: React", MAJOR: "Ví dụ: Công nghệ thông tin",
  EXPERIENCE: "Số tháng kinh nghiệm, ví dụ: 3",
  AVAILABILITY: "Ví dụ: 2 09:00-12:00 (8 là Chủ nhật)",
  OTHER: "Nhập điều kiện từ JD",
};

export function JobForm({ job }: { job: Job | null }) {
  const [items, setItems] = useState<Draft[]>(() => (job?.requirements ?? []).map((item, key) => ({ ...item, key })));
  const [nextKey, setNextKey] = useState(items.length);
  const [dirty, setDirty] = useState(false);
  const [extractionMessage, setExtractionMessage] = useState("");

  function addRequirement(type: Draft["type"]) {
    setItems([...items, { key: nextKey, kind: type === "UNCLEAR" ? "OTHER" : "SKILL", type, value: "" }]);
    setNextKey(nextKey + 1);
    setDirty(true);
  }

  function updateRequirement(key: number, changes: Partial<Pick<Draft, "type" | "kind">>) {
    setItems((current) => current.map((item) => item.key === key ? { ...item, ...changes } : item));
  }

  function extractFromDescription(form: HTMLFormElement | null) {
    if (!form) return;
    const data = new FormData(form);
    const description = String(data.get("description") ?? "");
    if (!description.trim()) {
      setExtractionMessage("Hãy dán nội dung JD vào ô Mô tả công việc trước.");
      return;
    }
    const extracted = extractRequirements(description);
    if (!extracted.length) {
      setExtractionMessage("Chưa nhận diện được yêu cầu. Hãy thử tách mỗi yêu cầu thành một dòng hoặc thêm tiêu chí thủ công.");
      return;
    }
    const values = data.getAll("value");
    const existing = new Set(items.map(({ kind }, index) => requirementKey({ kind, value: String(values[index] ?? "") })));
    const newItems = extracted.filter((item) => !existing.has(requirementKey(item)));
    if (!newItems.length) {
      setExtractionMessage("Các yêu cầu nhận diện được đã có trong danh sách.");
      return;
    }
    const available = newItems.slice(0, 30 - items.length);
    setItems([...items, ...available.map((item, index) => ({ ...item, key: nextKey + index }))]);
    setNextKey(nextKey + available.length);
    setDirty(true);
    const limitMessage = available.length < newItems.length ? " Danh sách đã đạt giới hạn 30 tiêu chí." : "";
    setExtractionMessage(`Đã thêm ${available.length} yêu cầu. Hãy kiểm tra nội dung và mức độ trước khi xác nhận.${limitMessage}`);
  }

  return <ActionForm action={saveJob.bind(null, job?.id ?? "")}>{(pending) => <section className="card stack" onChange={() => setDirty(true)}>
    <SectionTitle detail={job?.sample ? "Tin giả lập dùng để minh họa. Bạn có thể chỉnh sửa các điều kiện trước khi đánh giá." : "Nhập thông tin từ JD và kiểm tra từng yêu cầu trước khi đối chiếu."}>{job ? "Chi tiết và yêu cầu" : "Nhập tin tuyển dụng"}</SectionTitle>
    <div className="two"><Field label="Tên vị trí"><input name="title" required defaultValue={job?.title} /></Field>
    <Field label="Doanh nghiệp"><input name="company" required defaultValue={job?.company} /></Field>
    <Field label="Chuyên ngành"><input name="major" defaultValue={job?.major} /></Field>
    <Field label="Loại công việc"><select name="type" defaultValue={job?.type}><option value="INTERNSHIP">Thực tập</option><option value="PART_TIME">Việc làm thêm</option></select></Field></div>
    <Field label="Mô tả công việc" help="Dán JD tại đây. Để dễ nhận diện, đặt mỗi yêu cầu trên một dòng, ví dụ “Kỹ năng: React, Git” hoặc “Kinh nghiệm: ít nhất 6 tháng”.">
      <textarea name="description" rows={6} maxLength={4000} defaultValue={job?.description} />
    </Field>
    <button type="button" className="button secondary fit" disabled={pending || items.length >= 30} onClick={(event) => extractFromDescription(event.currentTarget.form)}><ScanText size={16} /> Trích xuất yêu cầu từ JD</button>
    {extractionMessage && <p className="muted" role="status">{extractionMessage}</p>}
    <div className="two"><Field label="Lịch làm việc"><input name="schedule" defaultValue={job?.schedule} /></Field>
    <Field label="Kinh nghiệm"><input name="experience" defaultValue={job?.experience} /></Field></div>
    <Field label="Liên kết ứng tuyển gốc"><input name="applyUrl" type="url" defaultValue={job?.applyUrl ?? ""} placeholder="https://…" /></Field>
    <div className="divider" />
    <SectionTitle detail="Chọn nhóm khi thêm yêu cầu. Kiểm tra lại từng mục rồi nhấn Xác nhận để đối chiếu với hồ sơ.">Các yêu cầu tuyển dụng</SectionTitle>
    <div className="tags" aria-label="Số yêu cầu theo nhóm">
      {requirementTypes.map((type) => <span key={type} className={`tag ${type === "UNCLEAR" ? "amber" : ""}`}>{categoryLabels[type]} · {items.filter((item) => item.type === type).length}</span>)}
    </div>
    <div className="actions" aria-label="Thêm yêu cầu theo nhóm">
      {requirementTypes.map((type) => <button key={type} className="button secondary" type="button" disabled={pending || items.length >= 30} onClick={() => addRequirement(type)}><Plus size={16} /> Thêm {categoryLabels[type].toLowerCase()}</button>)}
    </div>
    {!items.length && <p className="muted">Chưa có tiêu chí. Bạn vẫn có thể lưu tin để bổ sung sau.</p>}
    {items.map((item, index) => <fieldset className="requirement stack" key={item.key}>
      <legend>Tiêu chí {index + 1}</legend>
      <div className="two"><Field label="Mức độ"><select name="category" value={item.type} onChange={(event) => {
        updateRequirement(item.key, { type: event.target.value as Draft["type"] });
      }}>{requirementTypes.map((type) => <option key={type} value={type}>{categoryLabels[type]}</option>)}</select></Field>
      <Field label="Đối chiếu"><select name="criterion" value={item.kind} onChange={(event) => {
        updateRequirement(item.key, { kind: event.target.value as Draft["kind"] });
      }}>{criteria.map((kind) => <option key={kind} value={kind}>{criterionLabels[kind]}</option>)}</select></Field></div>
      <small>{categoryHelp[item.type]}</small>
      <div className="with-button"><Field label="Nội dung yêu cầu"><input name="value" defaultValue={item.value} placeholder={item.type === "UNCLEAR" ? "Ví dụ: Có thể làm từ xa không?" : criterionPlaceholders[item.kind]} maxLength={160} required /></Field><button className="icon-button" type="button" aria-label={`Xóa tiêu chí ${index + 1}`} onClick={() => {
        setItems(items.filter(({ key }) => key !== item.key));
        setDirty(true);
      }}><Trash2 size={17} /></button></div>
    </fieldset>)}
    {job && <p className="muted">{job.confirmedAt && !dirty ? "Yêu cầu đã lưu được xác nhận." : "Yêu cầu cần được xác nhận trước khi đối chiếu."}</p>}
    <div className="actions"><button className="button primary" disabled={pending} name="intent" value="confirm">Xác nhận yêu cầu và xem mức độ phù hợp</button>
    <button className="button secondary" disabled={pending} name="intent" value="draft">Lưu bản nháp</button></div>
  </section>}</ActionForm>;
}
