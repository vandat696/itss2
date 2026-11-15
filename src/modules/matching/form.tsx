"use client";

import Link from "next/link";
import { Bookmark, CheckCircle2, CircleHelp, MessageCircle, Sprout } from "lucide-react";
import { updateAssessment } from "./actions";
import { requirementLabel, type Item } from "./domain";
import { categoryLabels, criterionLabels } from "@/modules/jobs/requirements";
import { ActionForm } from "@/shared/action-form";
import { Empty } from "@/shared/ui";

const groups = [
  { outcome: "MET", label: "Điểm mạnh", detail: "Những yêu cầu bạn đang đáp ứng.", style: "green", icon: CheckCircle2 },
  { outcome: "GAP", label: "Điều có thể cải thiện", detail: "Những thông tin chưa đáp ứng theo hồ sơ đã khai báo. Chọn một bước nhỏ để bổ sung.", style: "blue", icon: Sprout },
  { outcome: "UNKNOWN", label: "Thông tin cần hỏi thêm", detail: "Những mục chưa được tính điểm. Chưa rõ thông tin không đồng nghĩa với thiếu năng lực.", style: "amber", icon: CircleHelp },
] as const;
const labels = { MET: "Đáp ứng", GAP: "Chưa đáp ứng", UNKNOWN: "Chưa xác định" };

export function AssessmentForm({ id, jobId, items, historical, saved }: { id: string; jobId: string; items: Item[]; historical: boolean; saved: boolean }) {
  const content = (pending: boolean) => <>
    {items.length === 0 && <Empty title="Chưa có tiêu chí để đối chiếu">Bạn có thể quay lại tin tuyển dụng để thêm yêu cầu.</Empty>}
    {groups.map(({ outcome, label, detail, style, icon: Icon }) => {
      const rows = items.filter((item) => outcome === "UNKNOWN" ? item.outcome === "UNKNOWN" || item.type === "UNCLEAR" : item.type !== "UNCLEAR" && item.outcome === outcome);
      return <section className="card stack" key={outcome}>
        <div className="aside-note"><span className={`tile-icon ${style}`}><Icon size={19} /></span><div><h2>{label} <span className="assessment-count">{rows.length}</span></h2><p>{detail}</p></div></div>
        {rows.length ? rows.map((item) => <div className="assessment-item" key={item.id}><div className="result-row">
          <div><strong>{requirementLabel(item)}</strong><small>{criterionLabels[item.kind]} · {categoryLabels[item.type]}{item.method === "SELF" ? " · Bạn tự xác nhận" : ""}</small></div>
          {!historical && item.type !== "UNCLEAR" && <select aria-label={`Mức đáp ứng cho ${item.value}`} name={`outcome-${item.id}`} defaultValue={item.outcome}>
            {Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>}
          </div>
          <p className="assessment-explanation">{item.explanation || "Đây là kết quả đã ghi nhận. Bản lưu cũ chưa có giải thích chi tiết cho tiêu chí này."}</p>
          {item.evidence && <details className="assessment-evidence"><summary>Hồ sơ tại lần đối chiếu</summary><p>{item.evidence}</p></details>}
          {item.sourceText && <blockquote className="jd-source"><span>Trích JD đã xác nhận</span>{item.sourceText}</blockquote>}
          {outcome === "UNKNOWN" && <p className="clarification-question"><MessageCircle size={15} /><span>Gợi ý hỏi: {item.type === "UNCLEAR" ? `“${requirementLabel(item)}” là điều kiện bắt buộc hay ưu tiên, và cần đáp ứng ở mức nào?` : `Anh/chị có thể làm rõ cách đánh giá yêu cầu “${requirementLabel(item)}” được không?`}</span></p>}
          {outcome !== "MET" && <Link className="text-link assessment-next" href={`/milestones/new?${new URLSearchParams({ from: "match", job: jobId, assessment: id, title: `${outcome === "UNKNOWN" ? "Làm rõ" : "Bổ sung"}: ${item.value}`.slice(0, 160), type: outcome === "UNKNOWN" ? "CLARIFY" : item.kind === "SKILL" ? "SKILL" : "RESEARCH" })}`}>{outcome === "UNKNOWN" ? "Ghi lại việc cần hỏi" : `Tạo mục tiêu cho ${requirementLabel(item)}`} →</Link>}
        </div>) : <small>Chưa có tiêu chí trong nhóm này.</small>}
      </section>;
    })}
    {!historical && <div className="actions"><button disabled={pending} name="intent" value="update" className="button primary">Cập nhật đối chiếu</button><button disabled={pending} name="intent" value="save" className="button secondary"><Bookmark size={16} />{saved ? "Lưu kết quả cập nhật" : "Lưu để xem sau"}</button></div>}
  </>;
  return historical ? <div className="stack">{content(false)}</div> : <ActionForm action={updateAssessment.bind(null, id)}>{content}</ActionForm>;
}
