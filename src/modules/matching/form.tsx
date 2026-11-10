"use client";

import { Bookmark, CheckCircle2, CircleHelp, Sprout } from "lucide-react";
import { updateAssessment } from "./actions";
import type { Item } from "./domain";
import { categoryLabels, criterionLabels } from "@/modules/jobs/requirements";
import { ActionForm } from "@/shared/action-form";
import { Empty } from "@/shared/ui";

const groups = [
  { outcome: "MET", label: "Điểm mạnh", detail: "Những yêu cầu bạn đang đáp ứng.", style: "green", icon: CheckCircle2 },
  { outcome: "UNKNOWN", label: "Điều cần làm rõ", detail: "Bổ sung thông tin hoặc xác nhận với nhà tuyển dụng.", style: "amber", icon: CircleHelp },
  { outcome: "GAP", label: "Điểm có thể cải thiện", detail: "Chọn một yêu cầu để lên kế hoạch bổ sung.", style: "blue", icon: Sprout },
] as const;
const labels = { MET: "Đáp ứng", GAP: "Chưa đáp ứng", UNKNOWN: "Chưa xác định" };

export function AssessmentForm({ id, items, historical, saved }: { id: string; items: Item[]; historical: boolean; saved: boolean }) {
  const content = (pending: boolean) => <>
    {items.length === 0 && <Empty title="Chưa có tiêu chí để đối chiếu">Bạn có thể quay lại tin tuyển dụng để thêm yêu cầu.</Empty>}
    {groups.map(({ outcome, label, detail, style, icon: Icon }) => {
      const rows = items.filter((item) => item.outcome === outcome);
      return <section className="card stack" key={outcome}>
        <div className="aside-note"><span className={`tile-icon ${style}`}><Icon size={19} /></span><div><h2>{label}</h2><p>{detail}</p></div></div>
        {rows.length ? rows.map((item) => <div className="result-row" key={item.id}>
          <div><strong>{item.value}</strong><small>{criterionLabels[item.kind]} · {categoryLabels[item.type]}</small></div>
          {!historical && item.type !== "UNCLEAR" && <select aria-label={`Mức đáp ứng cho ${item.value}`} name={`outcome-${item.id}`} defaultValue={item.outcome}>
            {Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>}
        </div>) : <small>Chưa có tiêu chí trong nhóm này.</small>}
      </section>;
    })}
    {!historical && <div className="actions"><button disabled={pending} name="intent" value="update" className="button primary">Cập nhật đối chiếu</button><button disabled={pending} name="intent" value="save" className="button secondary"><Bookmark size={16} />{saved ? "Lưu kết quả cập nhật" : "Lưu để xem sau"}</button></div>}
  </>;
  return historical ? <div className="stack">{content(false)}</div> : <ActionForm action={updateAssessment.bind(null, id)}>{content}</ActionForm>;
}
