import { z } from "zod";
import { db } from "@/shared/db";
import { days, timePattern } from "@/modules/matching/domain";

export const profileId = "student";
export const slotSchema = z.object({ day: z.number().refine((day) => days.includes(day)), start: z.string().regex(timePattern), end: z.string().regex(timePattern) })
  .refine((slot) => slot.start < slot.end, "Giờ kết thúc phải sau giờ bắt đầu.");
export const slotsSchema = z.array(slotSchema).max(28);
export const skillsSchema = z.array(z.string());
export async function readProfile() {
  const profile = await db.studentProfile.findUnique({
    where: { id: profileId }, include: { snapshots: { take: 5, orderBy: [{ createdAt: "desc" }, { id: "desc" }], select: { id: true, original: true, createdAt: true } } },
  });
  return profile && { ...profile, skills: skillsSchema.parse(profile.skills), availability: slotsSchema.parse(profile.availability) };
}
export type Profile = NonNullable<Awaited<ReturnType<typeof readProfile>>>;
