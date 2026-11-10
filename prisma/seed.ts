import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

const jobs = [
  { id: "frontend-demo", title: "Thực tập sinh Frontend", company: "Studio Mây", major: "Công nghệ thông tin", type: "INTERNSHIP", description: "Cùng nhóm sản phẩm xây dựng giao diện web, sửa lỗi và tham gia review code. Có người hướng dẫn trong quá trình thực tập.", schedule: "Thứ 2, 09:00–12:00", experience: "Ưu tiên đã từng làm dự án web.", criteria: [["REQUIRED", "SKILL", "HTML"], ["REQUIRED", "AVAILABILITY", "2 09:00-12:00"], ["PREFERRED", "SKILL", "React"], ["UNCLEAR", "OTHER", "Có thể làm việc từ xa trong tuần thi?"]] },
  { id: "ict-demo", title: "Cộng tác viên hỗ trợ IT", company: "Kết Nối Lab", major: "ICT", type: "PART_TIME", description: "Hỗ trợ thiết lập máy tính, kiểm tra kết nối mạng và ghi nhận các yêu cầu hỗ trợ.", schedule: "Thứ 7, 08:00–12:00", experience: "Không yêu cầu kinh nghiệm.", criteria: [["REQUIRED", "SKILL", "Mạng máy tính"], ["REQUIRED", "AVAILABILITY", "7 08:00-12:00"], ["PREFERRED", "SKILL", "Linux"]] },
  { id: "automation-demo", title: "Thực tập sinh Tự động hóa", company: "Xưởng Mạch", major: "Tự động hóa", type: "INTERNSHIP", description: "Đọc sơ đồ, hỗ trợ kiểm thử và ghi lại kết quả cho các mô hình điều khiển.", schedule: "Trao đổi theo lịch học", experience: "Ưu tiên có kinh nghiệm làm đồ án.", criteria: [["REQUIRED", "SKILL", "PLC"], ["PREFERRED", "MAJOR", "Tự động hóa"], ["PREFERRED", "EXPERIENCE", "3"], ["UNCLEAR", "OTHER", "Ca làm cố định hay linh hoạt?"]] },
] as const;

async function seed() {
  for (const { criteria, ...job } of jobs) {
    await db.jobPosting.upsert({
      where: { id: job.id }, update: {},
      create: { ...job, sample: true, requirements: { create: criteria.map(([type, kind, value], order) => ({ type, kind, value, order })) } },
    });
  }
}
seed().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => db.$disconnect());
