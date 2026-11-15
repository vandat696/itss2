# Michii — ITSS2

Ứng dụng hướng nghiệp cho sinh viên. Bạn có thể đối chiếu hồ sơ với yêu cầu tuyển dụng, chọn một việc cần cải thiện và ghi lại tiến bộ theo thời gian.

Đã tích hợp landing Michii từ `origin/main` cùng ứng dụng Next.js/Prisma. Trang `/` hiển thị UI mới; các nút bắt đầu mở `/journey`. Nút **Xem bản mẫu nhanh** giữ trải nghiệm minh họa độc lập, không thay đổi dữ liệu đã lưu. Hồ sơ ở `/profile`, tin tuyển dụng ở `/jobs`.

## Chạy trên máy cá nhân

Cần Node.js 22.13+ hoặc Node.js 24, npm và một database PostgreSQL (khuyến nghị Neon).

```powershell
npm ci
Copy-Item .env.example .env
# Điền DATABASE_URL và DIRECT_URL trong .env
npm run db:setup
npm run dev
```

Trên macOS/Linux, dùng `cp .env.example .env`. Mở [Michii](http://127.0.0.1:3000). Lệnh `db:setup` kiểm tra kết nối PostgreSQL, tạo Prisma Client, chạy migration và thêm tin mẫu. Có thể chạy lại mà không nhân bản hoặc ghi đè các tin mẫu đã sửa.

`npm run dev` và `npm run build` tự chuẩn bị landing và tài nguyên trong `public/landing/`. Sửa nguồn tại `index.html`, `styles.css`, `app.js`, `assets/`, rồi khởi động lại dev server. `npm run check` kiểm tra nguồn landing; `npm run build:landing` tạo bản tĩnh riêng ở `dist/`. Bản tĩnh chỉ phục vụ phần giới thiệu/bản mẫu; các liên kết `/journey` cần chạy ứng dụng Next.js. Xem [Landing](docs/LANDING.md).

Để chạy bản production trên máy cá nhân, dùng `npm run build` rồi `npm start`.

## Deploy lên Vercel với Neon

1. Tạo một project PostgreSQL trên Neon và lấy hai connection string:
   - `DATABASE_URL`: connection string pooled của Neon, thường có `-pooler`.
   - `DIRECT_URL`: connection string trực tiếp, dùng cho migration.
2. Điền hai biến này vào `.env` local theo mẫu `.env.example`.
3. Khởi tạo database và dữ liệu mẫu:

```powershell
npm run db:setup
```

4. Trên Vercel, import repository với thư mục gốc hiện tại và thêm `DATABASE_URL`, `DIRECT_URL` trong **Settings → Environment Variables** cho môi trường cần deploy.
5. Dùng build command mặc định `npm run build`. Không đặt `npm start` làm lệnh deploy trên Vercel.

SQLite local và thư mục `data/cv/` không được dùng cho dữ liệu production trên Vercel. CV cần được chuyển sang object storage như Vercel Blob hoặc S3 trước khi bật upload production.

## Kiểm thử

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Có thể dùng Chrome đã cài bằng cách đặt `PLAYWRIGHT_CHANNEL=chrome`. Với PowerShell, dùng `$env:PLAYWRIGHT_CHANNEL = "chrome"`. Playwright dùng bản build production, cổng 3011 và cần một database Neon riêng cho test qua `E2E_DATABASE_URL` và `E2E_DIRECT_URL`. CV test nằm trong `data/e2e-*`, được Git bỏ qua.

## Dữ liệu và phạm vi

- Database dùng PostgreSQL qua `DATABASE_URL`; `DIRECT_URL` là kết nối trực tiếp dùng cho migration. Tệp CV hiện được lưu dưới `data/cv/` với định danh riêng.
- CV là PDF tối đa 5 MB. Quy tắc đối chiếu dùng dữ liệu nhập tay. Trang hồ sơ hiển thị 5 phiên bản gần nhất và cho phép tải lại tệp gốc, chưa trích xuất nội dung PDF. Route tải CV dùng bản ghi của hồ sơ demo, không chấp nhận đường dẫn tệp từ người dùng và không lưu cache.
- Cột mốc có hạn hoàn thành tùy chọn. Hành trình đánh dấu đến hạn hôm nay, quá hạn và có bộ lọc đang mở / quá hạn / hoàn thành. Các mục đang mở được xếp theo hạn gần nhất. Ngày hạn được giữ nguyên theo lịch; trạng thái hôm nay dùng múi giờ Việt Nam (UTC+7).
- Tin có nhãn **Tin mẫu** là dữ liệu giả lập. Không có liên kết ứng tuyển giả.
- Đây là bản demo một người dùng, chạy trên loopback, không có xác thực. Thiết kế này không phù hợp để triển khai công khai cho nhiều người dùng.

Xem thêm [Kiến trúc](docs/architecture.md), [Luồng màn hình](docs/screen-flow.md) và [Phạm vi MVP](docs/mvp-scope.md).
