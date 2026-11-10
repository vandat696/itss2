import { z } from "zod";
export type ActionState = { error?: string };
export class FormError extends Error {}

export function input(form: FormData, name: string) {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
}
export function validate<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) throw new FormError(result.error.issues[0]?.message ?? "Vui lòng kiểm tra thông tin đã nhập.");
  return result.data;
}
export function formFailure(error: unknown): ActionState {
  if (error instanceof FormError) return { error: error.message };
  console.error(error);
  return { error: "Chưa thể lưu dữ liệu. Vui lòng thử lại." };
}
export const short = z.string().trim().max(160, "Giới hạn 160 ký tự.");
export const long = z.string().trim().max(4000, "Giới hạn 4.000 ký tự.");
export const required = (message: string) => short.min(1, message);
