import { readFile } from "node:fs/promises";
import { join, resolve, sep } from "node:path";
import { db } from "@/shared/db";
import { profileId } from "@/modules/profile/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const snapshot = await db.cvSnapshot.findFirst({ where: { id, profileId } });
  const missing = () => new Response("Không tìm thấy tệp CV.", { status: 404, headers: { "Cache-Control": "no-store" } });
  if (!snapshot) return missing();
  const directory = resolve(process.env.CV_DIR || join(process.cwd(), "data", "cv"));
  const path = resolve(directory, snapshot.fileKey);
  if (!path.startsWith(directory + sep)) return missing();
  let file: Buffer;
  try { file = await readFile(path); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return missing();
    throw error;
  }
  return new Response(new Uint8Array(file), { headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="cv.pdf"; filename*=UTF-8''${encodeURIComponent(snapshot.original).replace(/['()*]/g, (char) => `%${char.charCodeAt(0).toString(16)}`)}`,
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  } });
}
