"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/shared/db";
import { ActionState, FormError, formFailure, input, long, required, short, validate } from "@/shared/forms";
import { criteria, parseSlot, requirementTypes } from "@/modules/matching/domain";
import { jobTypes } from "./data";

const requirementSchema = z.object({ type: z.enum(requirementTypes), kind: z.enum(criteria), value: required("Hãy điền nội dung của từng yêu cầu.") }).superRefine((item, context) => {
  if (item.type === "UNCLEAR") return;
  if (item.kind === "AVAILABILITY" && !parseSlot(item.value)) context.addIssue({ code: "custom", message: "Lịch cần có dạng 2 09:00-12:00 (2–8, với 8 là Chủ nhật)." });
  if (item.kind === "EXPERIENCE" && !/^\d{1,3}$/.test(item.value)) context.addIssue({ code: "custom", message: "Kinh nghiệm cần là số tháng nguyên từ 0 đến 999." });
});
const jobSchema = z.object({
  title: required("Hãy nhập tên vị trí."), company: required("Hãy nhập tên doanh nghiệp."), major: short,
  type: z.enum(jobTypes), description: long, schedule: short, experience: short,
  applyUrl: z.union([z.url({ protocol: /^https?$/ }).max(2048), z.literal("")]),
  requirements: z.array(requirementSchema).max(30),
});

export async function saveJob(id: string, _: ActionState, form: FormData): Promise<ActionState> {
  let jobId: string;
  const confirm = input(form, "intent") === "confirm";
  try {
    const { requirements, applyUrl, ...fields } = validate(jobSchema, {
      title: input(form, "title"), company: input(form, "company"), major: input(form, "major"),
      type: input(form, "type"), description: input(form, "description"), schedule: input(form, "schedule"),
      experience: input(form, "experience"), applyUrl: input(form, "applyUrl").trim(),
      requirements: form.getAll("criterion").map((kind, index) => ({
        kind, type: form.getAll("category")[index], value: form.getAll("value")[index],
      })),
    });
    const data = { ...fields, applyUrl: applyUrl || null, confirmedAt: confirm ? new Date() : null };
    const rows = requirements.map((item, order) => ({ ...item, order }));
    const job = await db.$transaction(async (tx) => {
      if (!id) return tx.jobPosting.create({ data: { ...data, requirements: { create: rows } } });
      const previous = await tx.jobPosting.findUnique({ where: { id }, include: { requirements: { orderBy: { order: "asc" } } } });
      if (!previous) throw new FormError("Tin tuyển dụng này không còn tồn tại.");
      const changed = Object.entries(fields).some(([key, value]) => previous[key as keyof typeof fields] !== value)
        || data.applyUrl !== previous.applyUrl
        || rows.length !== previous.requirements.length
        || rows.some((row, index) => {
          const old = previous.requirements[index];
          return old.type !== row.type || old.kind !== row.kind || old.value !== row.value;
        });
      if (!changed) return tx.jobPosting.update({ where: { id }, data: { confirmedAt: confirm ? new Date() : previous.confirmedAt } });
      return tx.jobPosting.update({
        where: { id }, data: { ...data, revision: { increment: 1 }, requirements: { deleteMany: {}, create: rows } },
      });
    });
    jobId = job.id;
  } catch (error) {
    return formFailure(error);
  }
  redirect(confirm ? `/jobs/${jobId}/match` : `/jobs?job=${jobId}`);
}
