"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/shared/db";
import { ActionState, FormError, formFailure, input, validate } from "@/shared/forms";
import { applicationSchema, interviewDate } from "./domain";

export async function saveApplication(id: string, _: ActionState, form: FormData): Promise<ActionState> {
  let destination = "/applications?notice=deleted";
  try {
    if (input(form, "intent") === "delete") {
      if (!id) throw new FormError("Không tìm thấy đơn ứng tuyển.");
      await db.jobApplication.delete({ where: { id } });
    } else {
      const data = validate(applicationSchema, Object.fromEntries(
        ["title", "company", "status", "appliedOn", "interviewAt", "followUpOn", "contact", "notes", "applyUrl", "jobId"].map((key) => [key, input(form, key).trim()]),
      ));
      const application = await db.$transaction(async (tx) => {
        const previous = id ? await tx.jobApplication.findUnique({ where: { id } }) : null;
        if (id && !previous) throw new FormError("Đơn ứng tuyển này không còn tồn tại.");
        if (data.jobId && !(await tx.jobPosting.findUnique({ where: { id: data.jobId } }))) throw new FormError("Tin tuyển dụng này không còn tồn tại. Hãy chọn tin khác hoặc bỏ liên kết.");
        const fields = { ...data, jobId: data.jobId || null, applyUrl: data.applyUrl || null,
          followUpOn: data.followUpOn || null, interviewAt: data.interviewAt ? interviewDate(data.interviewAt) : null };
        const event = { status: data.status, note: data.notes };
        if (!previous) return tx.jobApplication.create({ data: { ...fields, events: { create: event } } });
        return tx.jobApplication.update({ where: { id }, data: { ...fields,
          ...(previous.status !== data.status && { events: { create: event } }),
        } });
      });
      destination = `/applications/${application.id}?notice=saved`;
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return { error: "Tin này đã có đơn theo dõi. Hãy mở đơn hiện có để cập nhật." };
    return formFailure(error);
  }
  revalidatePath("/applications");
  revalidatePath("/journey");
  redirect(destination);
}
