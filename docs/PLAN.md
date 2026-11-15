# Kế hoạch triển khai MVP

Trạng thái: DRAFT v0.1 — phụ thuộc các quyết định trong `QUESTIONS.md`.
Ngày: 10/11/2026. Cơ sở: `SPEC.md` và sơ đồ đính kèm.

## 1. Kết quả khảo sát

Repo đã clone từ `https://github.com/vandat696/itss2.git`, nhánh `main`, commit `da0c656ad22f2c525c2c77d918545baea8dac343`. Repo chỉ có README và chưa có stack hay tính năng để tái sử dụng. Không có AGENTS.md trong checkout lúc khảo sát.

Khảo sát ban đầu chưa có ứng dụng. Theo yêu cầu tiếp theo, đã triển khai landing page cùng bản trải nghiệm dữ liệu mẫu; xem `LANDING.md`. Chưa triển khai backend hoặc AI thật và chưa push thay đổi lên GitHub gốc.

## 2. Những quyết định phải chốt trước khi viết tính năng

1. Prototype cho solution interview hay MVP hoạt động thật; đối tượng và hai vấn đề cần kiểm chứng.
2. Có tài khoản/backend/DB hay dùng dữ liệu local cho demo.
3. Cách nhập CV/JD và mức AI phải chạy thật.
4. Rubric đánh giá, cách xử lý thiếu bằng chứng, có cần điểm tổng hay không.
5. Ý nghĩa hành trình và cột mốc, nhiều công việc hay một mục tiêu.
6. Ngôn ngữ, thiết kế, stack, deadline, nhân lực và môi trường triển khai.

## 3. Lựa chọn kiến trúc để thảo luận

| Phương án | Hợp với | Thành phần | Giới hạn |
| --- | --- | --- | --- |
| Prototype để phỏng vấn | Kiểm chứng luồng/giá trị nhanh | Frontend, dữ liệu mẫu được gắn nhãn, lưu local nếu cần | Không chứng minh độ chính xác AI hay dùng nhiều tài khoản |
| MVP dùng thật | Người dùng lưu hồ sơ và quay lại | Frontend, backend, DB, authentication, xử lý CV/AI nếu đã chọn | Cần triển khai, dữ liệu và kiểm thử quyền truy cập |

Chưa chọn framework, phiên bản hay hosting. Nếu môn học không áp stack, có thể cân nhắc TypeScript cho frontend; chọn backend theo năng lực nhóm. Cần xác minh tài liệu chính thức và dependency tại thời điểm khởi tạo. Không thêm hạ tầng tìm kiếm/vector DB nếu yêu cầu chưa cần.

## 4. Các mốc công việc theo thứ tự phụ thuộc

| Mốc | Công việc | Đầu ra và điều kiện hoàn thành | Phụ thuộc |
| --- | --- | --- | --- |
| M0 — Chốt sản phẩm | Trả lời câu hỏi, ưu tiên chức năng, định nghĩa rubric, chọn prototype/MVP | SPEC v1, phạm vi có/không, tiêu chí nghiệm thu được thống nhất | Phản hồi người dùng |
| M1 — Thiết kế | Wireframe 5 màn hình; form, empty/error/loading; locale; fixtures hồ sơ/JD | Một luồng demo hoàn chỉnh bằng wireframe và hợp đồng dữ liệu | M0 |
| M2 — Nền tảng | Khởi tạo stack, routes, layout, model, persistence đã chọn; auth nếu có | Chạy dự án, điều hướng đủ màn hình, dữ liệu mẫu; hướng dẫn setup | M1 |
| M3 — Luồng hồ sơ và hành trình | S01, S04, S05; nhập tay, lưu/hủy, nguồn mở, hoàn thành và ghi nhận | Một người tạo hồ sơ, cột mốc và theo dõi tiến bộ được | M2 |
| M4 — Luồng đánh giá | S02, S03; nhập/xác nhận yêu cầu; evaluator đã chọn; snapshot; tạo cột mốc từ khoảng thiếu | Đi hết hồ sơ → JD → kết quả → cột mốc → hành trình | M3 và rubric M0 |
| M5 — Tích hợp tùy phạm vi | Trích xuất CV/JD, AI thật, storage file, i18n nếu đã chốt | Input được người dùng duyệt; xử lý lỗi dịch vụ; không lộ khóa | M4, quyền truy cập dịch vụ |
| M6 — Kiểm tra và bàn giao | Kiểm tra acceptance, responsive, dữ liệu, quyền; demo và tài liệu | Bản sẵn sàng theo mục tiêu interview hoặc triển khai đã thống nhất | Các mốc trong phạm vi |

M5 là tùy chọn nhưng nếu được chốt là chức năng cốt lõi thì phải đưa vào MVP và lịch thực hiện. Không báo hoàn thành MVP thật khi đang dùng kết quả giả.

## 5. Backlog có thể chuyển thành issue sau khi chốt

| ID | Hạng mục | Mức đề xuất | Tiêu chí liên quan |
| --- | --- | --- | --- |
| B01 | Bộ route/layout và điều hướng 5 màn hình | P0 | Tất cả |
| B02 | Form hồ sơ nhập tay, validation, lưu/hủy | P0 | AC01–02 |
| B03 | Form JD, tiêu chí và bước xác nhận | P0 | AC04–05 |
| B04 | Evaluator và contract kết quả có giải thích | P0 | AC04–06 |
| B05 | Render S03, sửa JD, về hành trình | P0 | AC04–06 |
| B06 | Danh sách hành trình và trạng thái trống | P0 | AC10–11 |
| B07 | Cột mốc: thêm, sửa, lưu/hủy đúng nguồn | P0 | AC07–10 |
| B08 | Hoàn thành và lưu ghi nhận, chống trùng | P0 | AC11 |
| B09 | Phiên bản hồ sơ/JD và snapshot đánh giá | P0 cho MVP thật | AC12 |
| B10 | Persistence phù hợp với phương án đã chọn | P0 | AC14 |
| B11 | CV upload/trích xuất và phục hồi lỗi | Cần chốt | AC03 |
| B12 | Authentication và phân quyền dữ liệu | P0 nếu nhiều tài khoản | AC13 |
| B13 | Chuyển đổi Nhật/Việt | Cần chốt | Đặc tả ngôn ngữ sau M0 |
| B14 | Responsive, accessibility, lỗi và loading | P0 | Tất cả |
| B15 | Tài liệu chạy, fixtures, kịch bản demo | P0 | Bàn giao |

P0 là đề xuất ưu tiên, không phải phạm vi đã được người dùng xác nhận. Chưa tạo issue hay phân công cho thành viên trên GitHub.

## 6. Chiến lược kiểm tra

- Sau mỗi luồng: kiểm tra validation, lưu/hủy và nguồn điều hướng bằng fixtures xác định trước.
- Với evaluator: test tiêu chí đạt/một phần/thiếu/chưa rõ; dữ liệu trống, tổng trọng số 0, yêu cầu bắt buộc và tính lặp lại theo rubric. Nếu có AI: kiểm schema, nguồn bằng chứng và trường hợp timeout/sai định dạng; không dùng lời văn giống nhau làm tiêu chí chất lượng.
- Luồng end-to-end quan trọng: tạo hồ sơ → đánh giá JD → tạo cột mốc từ kết quả → lưu → hoàn thành và ghi nhận → tải lại.
- Kiểm tra riêng hủy từ S03 và S04, submit lặp, lưu lỗi và snapshot sau khi sửa hồ sơ.
- Nếu có tài khoản: kiểm người A không truy cập dữ liệu người B bằng ID hoặc liên kết chéo.
- Chạy lint/typecheck/build và các test phù hợp stack trước bàn giao. Hiện chưa chạy vì repo chưa có ứng dụng.

## 7. Kịch bản solution interview — nếu đây là mục tiêu

1. Cho người tham gia nhập hồ sơ hoặc dùng hồ sơ mẫu phù hợp bối cảnh.
2. Đưa một JD cụ thể; yêu cầu người tham gia tự đi đến kết quả và giải thích họ hiểu gì.
3. Yêu cầu chọn một khoảng thiếu và tạo việc nhỏ có điều kiện hoàn thành.
4. Quay lại hành trình, mở cột mốc và ghi nhận hoàn thành.
5. Hỏi kết quả có giúp ra quyết định gì, thông tin nào thiếu và họ có muốn quay lại theo dõi không.

Ghi nhận chỗ cần trợ giúp, hiểu nhầm, giá trị cảm nhận và độ tin tưởng vào giải thích. Không đặt sẵn chỉ tiêu số người hay tỷ lệ thành công khi nhóm chưa chốt thiết kế phỏng vấn.

## 8. Rủi ro và cách xử lý

| Rủi ro | Ảnh hưởng | Cách xử lý đề xuất |
| --- | --- | --- |
| Công thức đánh giá chưa rõ | UI có điểm nhưng thiếu ý nghĩa | Chốt rubric và vài ví dụ tay trước evaluator |
| AI/CV vượt ngân sách hoặc lỗi | Không demo được luồng cốt lõi | Nhập tay; adapter có timeout/retry; fixture riêng, gắn nhãn rõ |
| Thiếu dữ liệu bị kết luận là thiếu năng lực | Kết quả gây hiểu nhầm | Trạng thái unknown và yêu cầu bổ sung minh chứng |
| Thay đổi hồ sơ làm sai kết quả cũ | Mất khả năng giải thích | Snapshot và phiên bản đầu vào |
| S05 quay lại sai màn hình | Mất ngữ cảnh đánh giá | Lưu origin và assessmentId; fallback S04 |
| CV hoặc khóa dịch vụ bị lộ | Mất riêng tư/chi phí | Dữ liệu tối thiểu, server secrets, không log nội dung CV |
| Mở rộng thành nền tảng tuyển dụng | Trễ MVP | Giữ phạm vi 5 màn hình, thay đổi phải được cập nhật vào spec |

## 9. Tiến độ và việc tiếp theo

Chưa ước lượng ngày công hoặc ngày hoàn thành do chưa biết deadline, số người, năng lực và mức chạy thật. Sau câu trả lời, chia backlog theo người và ước lượng từng hạng mục; ưu tiên một luồng xuyên suốt trước các tính năng mở rộng.

Bước tiếp theo là cập nhật SPEC v1 và PLAN v1 từ câu trả lời; sau đó mới khởi tạo ứng dụng theo stack đã chọn.
