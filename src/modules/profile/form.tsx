"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, UploadCloud } from "lucide-react";
import type { Profile } from "./data";
import { saveProfile } from "./actions";
import { ActionForm } from "@/shared/action-form";
import { Field, SectionTitle } from "@/shared/ui";
import { days, dayLabel, Slot } from "@/modules/matching/domain";

export function ProfileForm({ profile, origin }: { profile: Profile | null; origin: string }) {
  const [skills, setSkills] = useState(profile?.skills.join(", ") ?? "");
  const [slots, setSlots] = useState<(Slot & { key: number })[]>(() => (profile?.availability ?? []).map((slot, key) => ({ ...slot, key })));
  const [nextKey, setNextKey] = useState(slots.length);
  const [filename, setFilename] = useState("");
  return <ActionForm action={saveProfile.bind(null, origin)}>{(pending) => <>
    <section className="card stack">
      <SectionTitle detail="Điền những thông tin bạn muốn dùng để đối chiếu.">Thông tin cơ bản</SectionTitle>
      <div className="two"><Field label="Chuyên ngành"><input name="major" defaultValue={profile?.major} placeholder="Ví dụ: Công nghệ thông tin" /></Field>
      <Field label="Khóa / Năm học"><input name="year" defaultValue={profile?.year} placeholder="Ví dụ: Năm 3" /></Field></div>
      <Field label="Kỹ năng" help="Phân cách bằng dấu phẩy."><input name="skills" value={skills} onChange={(event) => setSkills(event.target.value)} placeholder="Ví dụ: HTML, React, Git" /></Field>
      <div className="tags">{[...new Set(skills.split(",").map((value) => value.trim()).filter(Boolean))].map((skill) => <span className="tag" key={skill}>{skill}</span>)}</div>
      <Field label="Kinh nghiệm"><textarea name="experience" rows={3} defaultValue={profile?.experience} placeholder="Công việc, hoạt động hoặc kinh nghiệm liên quan" /></Field>
      <Field label="Số tháng kinh nghiệm" help="Nhập 0 nếu bạn chưa có kinh nghiệm. Có thể để trống nếu chưa xác định."><input type="number" min="0" max="600" name="months" defaultValue={profile?.months ?? ""} /></Field>
      <Field label="Dự án cá nhân"><textarea name="projects" rows={3} defaultValue={profile?.projects} placeholder="Ví dụ: Xây dựng website cho câu lạc bộ" /></Field>
    </section>
    <section className="card stack">
      <SectionTitle detail="Thêm các khoảng thời gian bạn có thể làm việc trong tuần.">Lịch rảnh</SectionTitle>
      {slots.map((slot, index) => <div className="slot" key={slot.key}>
        <Field label={`Ngày ${index + 1}`}><select name="day" defaultValue={slot.day}>{days.map((day) => <option key={day} value={day}>{dayLabel(day)}</option>)}</select></Field>
        <Field label="Từ"><input name="start" type="time" defaultValue={slot.start} required /></Field>
        <Field label="Đến"><input name="end" type="time" defaultValue={slot.end} required /></Field>
        <button type="button" className="icon-button" aria-label={`Xóa khoảng giờ ${index + 1}`} onClick={() => setSlots(slots.filter((item) => item.key !== slot.key))}><Trash2 size={17} /></button>
      </div>)}
      <button className="button secondary fit" type="button" disabled={slots.length >= 28} onClick={() => { setSlots([...slots, { key: nextKey, day: 2, start: "09:00", end: "12:00" }]); setNextKey(nextKey + 1); }}><Plus size={16} /> Thêm khoảng giờ</button>
    </section>
    <section className="card stack">
      <SectionTitle detail="Tệp PDF tối đa 5 MB. Bạn cũng có thể lưu hồ sơ bằng dữ liệu nhập tay.">CV đính kèm</SectionTitle>
      <label className="upload"><UploadCloud size={25} /><span>{filename || "Chọn tệp PDF"}</span><input name="cv" type="file" accept=".pdf,application/pdf" onChange={(event) => setFilename(event.target.files?.[0]?.name ?? "")} /></label>
      {filename && <button type="button" className="button secondary fit" onClick={(event) => { const file = event.currentTarget.form?.elements.namedItem("cv"); if (file instanceof HTMLInputElement) file.value = ""; setFilename(""); }}>Bỏ tệp đã chọn</button>}
    </section>
    <div className="actions"><button className="button primary" disabled={pending}>{pending ? "Đang lưu…" : "Lưu hồ sơ"}</button><Link className="button secondary" href={origin ? `/jobs/${origin}/match` : "/journey"}>Hủy</Link></div>
  </>}</ActionForm>;
}
