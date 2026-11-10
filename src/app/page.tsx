import { redirect } from "next/navigation";
import { readProfile } from "@/modules/profile/data";

export const dynamic = "force-dynamic";
export default async function Home() {
  redirect(await readProfile() ? "/journey" : "/profile");
}
