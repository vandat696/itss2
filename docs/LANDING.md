# Landing page Michii

Tên Michii là tên tạm cho giao diện, chưa chốt thương hiệu sản phẩm.

## Chạy và triển khai

Website tĩnh HTML/CSS/JavaScript, không có dependency cần cài. Dùng Node.js để kiểm tra và đóng gói:

```bash
npm run check
npm run build:landing
```

Phần landing đã được ghép vào ứng dụng Next.js tại `/`. Dùng `npm run dev` để chạy toàn bộ ứng dụng; `npm run build` để build production. `npm run build:landing` chỉ tạo bản landing riêng ở `dist/`; các liên kết đến ứng dụng cần backend Next.js.

## Nội dung và tương tác

- Hero minh họa S04 và các bước phát triển năng lực; không có thống kê hay lời chứng thực giả.
- Ba giá trị: hiểu hồ sơ, hiểu yêu cầu công việc, theo dõi cột mốc.
- Ba tab mô tả luồng S01 → S02/S03 → S05/S04.
- FAQ dùng native details; menu di động; neo cuộn; hiệu ứng reveal, hover và nổi nhẹ có hỗ trợ reduced motion.
- CTA chính mở `/journey` trong ứng dụng thật. Nút “Xem bản mẫu nhanh” mở dialog với hồ sơ mẫu, hai công việc mẫu, đối chiếu kỹ năng và cột mốc mẫu có thể hoàn thành.
- Dialog hỗ trợ Escape, focus trap native, trả focus; các tab hỗ trợ phím mũi tên, Home/End.
- Dữ liệu bản mẫu chỉ ở bộ nhớ trong phiên mở dialog, không gửi mạng và không yêu cầu thông tin cá nhân.

## Phạm vi

Dialog là trải nghiệm minh họa độc lập. Ứng dụng Next.js đi kèm có backend SQLite, lưu hồ sơ, CV và cột mốc; chưa có tài khoản hoặc phân tích AI thật. SPEC và PLAN là tài liệu đề xuất của nhánh UI; phạm vi đang chạy được mô tả trong README và mvp-scope.md. Giao diện hiện dùng tiếng Việt.

## Cấu trúc

- `index.html`: nội dung và cấu trúc.
- `styles.css`: giao diện responsive và animation.
- `app.js`: tương tác, điều hướng và dữ liệu mẫu.
- `assets/`: favicon, phông chữ Noto Sans tự phục vụ và giấy phép.
- `scripts/`: kiểm tra liên kết/tài nguyên và build static.

## Hệ màu cập nhật theo tham khảo Mobbin

| Vai trò | Màu |
| --- | --- |
| Nút chính | Indigo `#4F46D8` |
| Chữ chính | Navy `#202640` |
| Nền trang | Trắng nhẹ `#F9F9FD` |
| Nền hỗ trợ | Lavender `#EFEDFB` |
| Khối CTA | Tím đậm `#302867` |
| Điểm nhấn ấm | Apricot `#E7A584` |

Tham khảo phần bảng màu công khai trên Mobbin:
- [Canva](https://mobbin.com/colors/brand/canva): họ xanh dương/tím cho điểm nhấn.
- [Discord](https://mobbin.com/colors/brand/discord): hướng indigo cho hành động chính.
- [Lavender](https://mobbin.com/colors/meaning/lavender): nền tím nhạt phối với màu chữ đậm.

Đây là bảng màu riêng được điều chỉnh cho Michii. Các ảnh UI chi tiết trên Mobbin không tải được trong môi trường nghiên cứu; không sử dụng ảnh, logo hoặc tuyên bố đã phân tích các màn hình đó. Trạng thái đáp ứng/hoàn thành trong bản mẫu giữ màu ngữ nghĩa riêng.
