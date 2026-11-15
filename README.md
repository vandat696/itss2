# Michii — ITSS2

Landing page giới thiệu website hỗ trợ người tìm việc hiểu năng lực, đối chiếu yêu cầu công việc và theo dõi cột mốc cải thiện. Michii là tên giao diện tạm thời.

## Khởi chạy

Không cần cài dependency. Dùng Node.js có hỗ trợ ES modules và `import.meta.dirname`:

```bash
npm run check
npm run build
```

Phục vụ thư mục `dist/` bằng static server. Có thể triển khai trên nền tảng hosting tĩnh với build command `npm run build` và output directory `dist`.

## Cấu trúc

- `index.html`, `styles.css`, `app.js`: nội dung, giao diện responsive và tương tác.
- `assets/`: favicon, phông chữ tự phục vụ, giấy phép phông chữ.
- `docs/SPEC.md`: đặc tả MVP dạng nháp.
- `docs/PLAN.md`: kế hoạch triển khai.
- `docs/QUESTIONS.md`: câu hỏi cần làm rõ.
- `docs/LANDING.md`: phạm vi landing và bản mẫu.

## Phạm vi bản mẫu

CTA mở bản trải nghiệm bằng dữ liệu chuẩn bị sẵn: hồ sơ, hai công việc mẫu, đối chiếu kỹ năng, tạo và hoàn thành cột mốc. Bản mẫu không gửi dữ liệu ra ngoài, không có tài khoản, tải CV hoặc AI thật. Đóng/mở lại bản mẫu sẽ đặt lại dữ liệu trải nghiệm.

Hiệu ứng tôn trọng `prefers-reduced-motion`. Menu di động, dialog và tab có hỗ trợ bàn phím.
