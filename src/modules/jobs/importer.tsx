"use client";

import { useState } from "react";
import { FileSearch, Plus } from "lucide-react";
import { extractRequirements, type Extraction, type Suggestion } from "./extraction";
import { categoryLabels, criterionLabels } from "./requirements";
import { Field } from "@/shared/ui";

export function JDImporter({ initialText, remaining, onAdd, onTextChange }: { initialText: string; remaining: number; onAdd: (items: Suggestion[]) => number; onTextChange: () => void }) {
  const [text, setText] = useState(initialText);
  const [result, setResult] = useState<Extraction | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [message, setMessage] = useState("");
  return <section className="jd-import stack">
    <div className="aside-note"><span className="tile-icon lavender"><FileSearch size={21} /></span><div><h2>Bắt đầu từ nội dung JD</h2><p>Dán phần yêu cầu, kinh nghiệm và lịch làm việc để gợi ý tiêu chí.</p></div></div>
    <Field label="Nội dung JD gốc" help="Gợi ý theo từ khóa chạy trên máy, chưa sử dụng AI. Mỗi tiêu chí cần được bạn kiểm tra trước khi đánh giá."><textarea name="jdText" rows={6} maxLength={20000} value={text} onChange={(event) => { setText(event.target.value); setResult(null); setMessage(""); onTextChange(); }} placeholder={'Yêu cầu bắt buộc:\n- Có kiến thức HTML, CSS và JavaScript\n- Tối thiểu 6 tháng kinh nghiệm\n- Thứ 2 09:00-12:00\nƯu tiên:\n- Biết React'} /></Field>
    <button className="button secondary fit" type="button" disabled={!text.trim()} onClick={() => {
      const extraction = extractRequirements(text);
      setResult(extraction); setSelected(extraction.suggestions.map((_, index) => index));
      setMessage(extraction.suggestions.length ? `Có ${extraction.suggestions.length} gợi ý. Chọn các mục muốn thêm rồi kiểm tra với đoạn trích gốc.` : "Chưa nhận diện được tiêu chí. Bạn có thể thêm thủ công và kiểm tra nội dung gốc bên dưới.");
    }}><FileSearch size={16} /> Gợi ý yêu cầu từ JD</button>
    {message && <p className="jd-feedback" role="status">{message}</p>}
    {result && <>
      {result.limited && <p className="notice amber">Đã đạt giới hạn 30 gợi ý. Hãy chia JD thành phần nhỏ hơn và kiểm tra những dòng chưa nhận diện.</p>}
      {result.suggestions.length > 0 && <div className="stack compact jd-suggestions">{result.suggestions.map((item, index) => <label className="jd-suggestion" key={index}>
        <input type="checkbox" checked={selected.includes(index)} onChange={(event) => setSelected(event.target.checked ? [...selected, index] : selected.filter((value) => value !== index))} />
        <span><strong>{item.value}</strong><span className="jd-suggestion-tags"><span className="tag lavender">{criterionLabels[item.kind]}</span><span className={`tag ${item.type === "UNCLEAR" ? "amber" : "neutral"}`}>{categoryLabels[item.type]}</span></span><q>{item.sourceText}</q><small>{item.hint}</small></span>
      </label>)}</div>}
      {result.suggestions.length > 0 && <div className="stack compact"><button type="button" className="button primary fit" disabled={!selected.length || selected.length > remaining} onClick={() => {
        const count = onAdd(result.suggestions.filter((_, index) => selected.includes(index)));
        setResult({ ...result, suggestions: [] }); setSelected([]); setMessage(`Đã thêm ${count} tiêu chí mới; bỏ qua mục trùng. Hãy kiểm tra và đánh dấu xác nhận từng mục bên dưới.`);
      }}><Plus size={16} /> Thêm {selected.length} gợi ý vào yêu cầu</button>{selected.length > remaining && <small>Chỉ còn chỗ cho {remaining} tiêu chí. Bỏ chọn một số gợi ý hoặc xóa mục không cần thiết.</small>}</div>}
      {!!result.unparsed.length && <details className="jd-unparsed"><summary>{result.unparsed.length} dòng cần bạn đọc và bổ sung thủ công</summary><p>Những dòng này vẫn nằm trong JD gốc, chưa được dùng để tính điểm.</p><ul>{result.unparsed.map((line, index) => <li key={index}>{line}</li>)}</ul></details>}
    </>}
  </section>;
}
