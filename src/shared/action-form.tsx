"use client";

import { startTransition, useActionState, type ReactNode } from "react";
import type { ActionState } from "./forms";

export type FormAction = (state: ActionState, data: FormData) => Promise<ActionState>;
export function ActionForm({ action, children }: { action: FormAction; children: (pending: boolean) => ReactNode }) {
  const [state, submit, pending] = useActionState<ActionState, FormData>(async (previous, data) => {
    const cv = data.get("cv");
    if (cv instanceof File) {
      if (!cv.name && !cv.size) data.delete("cv");
      if (cv.size > 5 * 1024 * 1024) return { error: "CV vượt quá 5 MB. Bạn có thể chọn tệp nhỏ hơn hoặc bỏ tệp để lưu thủ công." };
    }
    return action(previous, data);
  }, {});
  return <form className="stack" onSubmit={(event) => {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget, (event.nativeEvent as SubmitEvent).submitter);
    startTransition(() => submit(data));
  }}>{state.error && <p className="notice amber" role="alert">{state.error}</p>}{children(pending)}</form>;
}
