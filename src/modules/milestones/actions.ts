"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/shared/db";
import { ActionState, FormError, formFailure, input, long, required, validate } from "@/shared/forms";
import { completeMilestone, milestoneTypes } from "./domain";

const schema = z.object({
  title: required("Hãy nhập tên cột mốc."), description: long, learned: long,
  type: z.enum(milestoneTypes), jobId: z.string().max(120).nullable(),
});

export async function saveMilestone(id: string, _: ActionState, form: FormData): Promise<ActionState> {
  try {
    const intent = input(form, "intent");
    if (intent === "delete" && id) {
      await db.milestone.delete({ where: { id } });
    } else {
      const data = validate(schema, {
        title: input(form, "title"), description: input(form, "description"), learned: input(form, "learned"),
        type: input(form, "type"), jobId: input(form, "job") || null,
      });
      await db.$transaction(async (tx) => {
        const previous = id ? await tx.milestone.findUnique({ where: { id } }) : null;
        if (id && !previous) throw new FormError("Cột mốc này không còn tồn tại.");
        const completion = intent === "complete" ? completeMilestone(previous?.completedAt ?? null, new Date()) : null;
        const fields = completion ? { ...data, status: completion.status, completedAt: completion.completedAt } : data;
        if (previous) await tx.milestone.update({ where: { id }, data: fields });
        else await tx.milestone.create({ data: fields });
        if (completion?.recordCompletion) await tx.progressRecord.create({
          data: { kind: "MILESTONE", title: data.title, detail: data.learned || "Đã hoàn thành cột mốc." },
        });
      });
    }
  } catch (error) {
    return formFailure(error);
  }
  redirect("/journey");
}
