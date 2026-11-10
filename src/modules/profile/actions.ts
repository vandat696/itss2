"use server";

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/shared/db";
import { ActionState, FormError, formFailure, input, long, short, validate } from "@/shared/forms";
import { normalize } from "@/modules/matching/domain";
import { profileId, slotsSchema } from "./data";

const schema = z.object({
  major: short, year: short, skills: z.array(short.min(1)).max(60),
  experience: long, projects: long, months: z.number().int().min(0).max(600).nullable(),
  availability: slotsSchema,
});

export async function saveProfile(job: string, _: ActionState, form: FormData): Promise<ActionState> {
  let uploaded: { path: string; key: string; original: string } | undefined;
  try {
    const skills = new Map(input(form, "skills").split(",").map((skill) => [normalize(skill), skill.trim()]));
    skills.delete("");
    const months = input(form, "months").trim();
    const data = validate(schema, {
      major: input(form, "major"), year: input(form, "year"), skills: [...skills.values()],
      experience: input(form, "experience"), projects: input(form, "projects"),
      months: months ? (/^\d+$/.test(months) ? Number(months) : NaN) : null,
      availability: form.getAll("day").map((day, index) => ({
        day: Number(day), start: form.getAll("start")[index], end: form.getAll("end")[index],
      })),
    });
    const file = form.get("cv");
    if (file instanceof File && (file.name || file.size)) {
      if (!file.size || file.size > 5 * 1024 * 1024 || !file.name.toLowerCase().endsWith(".pdf") || file.type !== "application/pdf"
        || Buffer.from(await file.slice(0, 5).arrayBuffer()).toString() !== "%PDF-") {
        throw new FormError("CV cần là tệp PDF hợp lệ, tối đa 5 MB. Bạn có thể bỏ tệp và lưu hồ sơ thủ công.");
      }
      const folder = process.env.CV_DIR || join(process.cwd(), "data", "cv");
      const key = `${randomUUID()}.pdf`;
      await mkdir(folder, { recursive: true });
      uploaded = { key, path: join(folder, key), original: file.name.slice(0, 200) };
      await writeFile(uploaded.path, Buffer.from(await file.arrayBuffer()), { flag: "wx" });
    }
    if (!Object.values(data).some((value) => Array.isArray(value) ? value.length : value !== "" && value !== null) && !uploaded) {
      throw new FormError("Hãy nhập ít nhất một thông tin hoặc đính kèm CV.");
    }
    await db.$transaction(async (tx) => {
      const previous = await tx.studentProfile.findUnique({ where: { id: profileId } });
      const firstCv = uploaded && !(await tx.cvSnapshot.count({ where: { profileId } }));
      await tx.studentProfile.upsert({ where: { id: profileId }, create: { id: profileId, ...data }, update: data });
      if (uploaded) {
        await tx.cvSnapshot.create({ data: { profileId, original: uploaded.original, fileKey: uploaded.key, skills: data.skills } });
      }
      await tx.progressRecord.create({ data: {
        profileId, kind: previous && !firstCv ? "PROFILE" : "BASELINE",
        title: firstCv ? "Lưu CV đầu tiên" : previous ? "Cập nhật hồ sơ năng lực" : "Tạo hồ sơ đầu tiên",
        detail: uploaded ? `CV: ${uploaded.original}` : [data.major, data.year].filter(Boolean).join(" · ") || "Hồ sơ nhập thủ công",
        skills: data.skills,
      } });
    });
  } catch (error) {
    if (uploaded) await unlink(uploaded.path).catch(() => {});
    return formFailure(error);
  }
  redirect(job ? `/jobs/${encodeURIComponent(job)}/match` : "/journey");
}
