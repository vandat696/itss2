"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/shared/db";
import { ActionState, FormError, formFailure, input } from "@/shared/forms";
import { profileId } from "@/modules/profile/data";
import { outcomes, Outcome, score } from "./domain";
import { itemSchema, noProfileRevision } from "./data";

export async function updateAssessment(id: string, _: ActionState, form: FormData): Promise<ActionState> {
  let jobId: string;
  const save = input(form, "intent") === "save";
  try {
    jobId = await db.$transaction(async (tx) => {
      const row = await tx.matchAssessment.findUnique({ where: { id }, include: { job: true } });
      if (!row) throw new FormError("Không tìm thấy kết quả đánh giá.");
      const profile = await tx.studentProfile.findUnique({ where: { id: profileId } });
      if (row.jobRevision !== row.job.revision || row.profileRevision.getTime() !== (profile?.updatedAt ?? noProfileRevision).getTime()) {
        throw new FormError("Dữ liệu đã thay đổi. Hãy mở kết quả hiện tại để chỉnh sửa.");
      }
      const items = itemSchema.parse(row.items).map((item) => {
        if (item.type === "UNCLEAR") return item;
        const selected = input(form, `outcome-${item.id}`) as Outcome;
        if (!outcomes.includes(selected)) throw new FormError("Hãy kiểm tra trạng thái của từng tiêu chí.");
        return { ...item, outcome: selected };
      });
      await tx.matchAssessment.update({ where: { id }, data: { percent: score(items), items } });
      if (save) await tx.savedJob.upsert({ where: { jobId: row.jobId }, create: { jobId: row.jobId }, update: {} });
      return row.jobId;
    });
  } catch (error) {
    return formFailure(error);
  }
  revalidatePath("/journey");
  redirect(`/jobs/${jobId}/match${save ? "?saved=1" : "?updated=1"}`);
}
