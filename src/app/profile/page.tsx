import { ClipboardList, FileCheck2, ShieldCheck } from "lucide-react";
import { readJob } from "@/modules/jobs/data";
import { readProfile } from "@/modules/profile/data";
import { ProfileForm } from "@/modules/profile/form";
import { Back, Heading } from "@/shared/ui";

import { SearchParams, singleValues } from "@/shared/query";

export const dynamic = "force-dynamic";
export default async function ProfilePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const query = singleValues(await searchParams, ["job"]);
  const [profile, job] = await Promise.all([readProfile(), query.job ? readJob(query.job) : null]);
  const origin = job?.confirmedAt ? job.id : "";
  return <>
    <Back href={origin ? `/jobs/${origin}/match` : "/journey"}>{origin ? "Về kết quả đánh giá" : "Về hành trình"}</Back>
    <Heading japanese="プロフィール・スキル" title="Hồ sơ năng lực">Ghi lại kỹ năng, kinh nghiệm và lịch rảnh để tìm cơ hội phù hợp với bạn.</Heading>
    <div className="layout-side">
      <ProfileForm profile={profile} origin={origin} />
      <aside className="stack">
        <div className="card callout"><ClipboardList /><h2>Bắt đầu từ điều bạn đã có</h2><p>Bạn có thể điền từng phần rồi quay lại cập nhật. Kỹ năng từ bài tập, hoạt động CLB và dự án cá nhân đều có giá trị.</p></div>
        <div className="card aside-note"><ShieldCheck /><div><strong>CV được lưu trên máy</strong><p>Bước Nhỏ dùng dữ liệu bạn tự nhập để đối chiếu yêu cầu.</p></div></div>
        {profile?.snapshots[0] && <div className="card aside-note"><FileCheck2 /><div><strong>CV gần nhất</strong><p>{profile.snapshots[0].original}</p></div></div>}
      </aside>
    </div>
  </>;
}
