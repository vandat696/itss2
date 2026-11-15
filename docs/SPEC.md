# Đặc tả MVP website hỗ trợ hành trình tìm việc

Trạng thái: DRAFT v0.1 — chờ trả lời câu hỏi, chưa chốt yêu cầu.
Ngày: 10/11/2026.
Nguồn: sơ đồ `references/screen-transition.png` do người dùng cung cấp.
Repo gốc: https://github.com/vandat696/itss2 — nhánh `main`, commit `da0c656ad22f2c525c2c77d918545baea8dac343`.

## 1. Cơ sở và giới hạn

- Repo lúc khảo sát chỉ có README; chưa có frontend, backend, schema, dependency, test hay cấu hình triển khai.
- Sơ đồ xác nhận 5 màn hình và các chuyển tiếp; không xác nhận tên sản phẩm, đối tượng, công thức đánh giá, cách lưu trữ, công nghệ hay deadline.
- Các mục có nhãn **Đề xuất** cần được chốt qua `QUESTIONS.md` trước khi coi là yêu cầu chính thức.
- Bản này mô tả MVP để chuẩn bị triển khai. Landing page và bản trải nghiệm dữ liệu mẫu đã được bổ sung riêng trong `LANDING.md`; chưa triển khai backend hay gọi dịch vụ AI.

## 2. Mục tiêu sản phẩm — đề xuất

Giúp người tìm việc nhìn thấy khoảng cách giữa hồ sơ của mình và yêu cầu của một vị trí cụ thể, chuyển khoảng cách đó thành cột mốc nhỏ, rồi ghi nhận tiến bộ.

Hai giả thuyết cần xác nhận:

1. Người dùng khó xác định mình đáp ứng và còn thiếu gì so với tin tuyển dụng.
2. Người dùng khó chia mục tiêu tìm việc thành hành động nhỏ và nhìn thấy tiến bộ.

Kịch bản xuyên suốt: lưu hồ sơ → nhập yêu cầu một công việc → xác nhận dữ liệu → xem kết quả có giải thích → tạo cột mốc từ một khoảng thiếu → hoàn thành và ghi nhận → cập nhật hồ sơ, đánh giá lại khi cần.

## 3. Phạm vi

| Nhóm | Trong sơ đồ | Đề xuất cho MVP |
| --- | --- | --- |
| Hồ sơ | Nhập/sửa hồ sơ, tải CV, xử lý CV lỗi | Nhập tay luôn dùng được; CV là đầu vào hỗ trợ và cần người dùng kiểm tra |
| Yêu cầu công việc | Nhập/sửa, xác nhận, thử lại khi lỗi | Dán JD hoặc nhập yêu cầu có cấu trúc; chưa mặc định đọc URL |
| Đánh giá | Kết quả độ phù hợp | Mỗi tiêu chí có trạng thái và lý do; điểm tổng chỉ thêm khi đã chốt quy tắc |
| Hành trình | Xem hành trình, cập nhật hồ sơ, mở cột mốc | Danh sách hoặc timeline đơn giản; lưu được cột mốc và ghi nhận |
| Cột mốc | Tạo, xem, lưu, hoàn thành | Tạo thủ công hoặc tạo từ khoảng thiếu đã chọn |
| Tài khoản | Không thể hiện | Cần quyết định demo không đăng nhập hay tài khoản riêng |
| Ngôn ngữ | Tên màn hình Nhật/Việt | Cần chốt giao diện một ngôn ngữ hay chuyển đổi Nhật/Việt |

Ngoài phạm vi đề xuất: sàn tuyển dụng, tài khoản nhà tuyển dụng/admin, tự nộp CV, chatbot tổng quát, thanh toán, thu thập hàng loạt tin tuyển dụng, mạng xã hội và email nhắc hạn.

## 4. Vai trò và điều hướng

Đề xuất chỉ có một vai trò: người tìm việc, quản lý dữ liệu của mình. Nếu cần nhà tuyển dụng hoặc quản trị, phải bổ sung luồng riêng.

S01 có màu xanh trong sơ đồ nên tạm hiểu là điểm bắt đầu; cần xác nhận. Người đã lưu hồ sơ có thể vào S04 khi mở lại website — đây là đề xuất, không phải chuyển tiếp được vẽ.

| ID | Tên Nhật | Tên Việt | Route đề xuất |
| --- | --- | --- | --- |
| S01 | プロフィール・スキル | Hồ sơ năng lực | `/profile` |
| S02 | 求人情報・応募条件 | Tin tuyển dụng và yêu cầu | `/jobs/new` hoặc `/jobs/:jobId/edit` |
| S03 | 適合度の評価結果 | Kết quả độ phù hợp | `/assessments/:assessmentId` |
| S04 | 就職活動の歩み | Hành trình tìm việc | `/journey` |
| S05 | 小さな目標の詳細 | Chi tiết cột mốc | `/milestones/new` hoặc `/milestones/:milestoneId` |

## 5. Đặc tả từng màn hình

### S01 — Hồ sơ năng lực

- Mục đích: tạo hoặc sửa hồ sơ dùng cho đánh giá.
- Trường đề xuất: tên hiển thị; vị trí mục tiêu; học vấn; kỹ năng và mức độ tự đánh giá; kinh nghiệm/dự án; ngoại ngữ/chứng chỉ; mô tả hoặc minh chứng tùy chọn.
- Đầu vào: nhập tay; tải CV theo định dạng và giới hạn sẽ chốt.
- Nếu có trích xuất CV: hiển thị kết quả để người dùng sửa/xác nhận trước khi lưu; không tự ghi đè hồ sơ hiện tại.
- Lưu thành công: tăng phiên bản hồ sơ, chuyển S04.
- Hủy: bỏ bản chỉnh sửa, giữ hồ sơ đã lưu, chuyển S04. Lần đầu chưa có hồ sơ: S04 hiển thị trạng thái trống và CTA tạo hồ sơ.
- CV lỗi: ở lại S01, cho tải lại hoặc nhập tay. Lưu lỗi: giữ nội dung form để thử lại.

### S02 — Tin tuyển dụng và yêu cầu

- Mục đích: thu thập và xác nhận yêu cầu dùng để so sánh.
- Trường đề xuất: tên vị trí, công ty tùy chọn, JD gốc; danh sách tiêu chí gồm tên, nhóm, mức yêu cầu, bắt buộc/ưu tiên, trọng số nếu dùng.
- Cho sửa các tiêu chí được trích xuất trước khi xác nhận; tách thao tác trích xuất và đánh giá nếu có AI.
- Xác nhận yêu cầu → kiểm tra hồ sơ và dữ liệu → tạo lần đánh giá → chuyển S03 khi thành công.
- Dữ liệu thiếu/lỗi: ở lại S02, chỉ rõ trường cần sửa, cho thử lại.
- Quay lại hành trình → S04; đề xuất hỏi bỏ thay đổi nếu form đang sửa.
- Đề xuất: nếu chưa có hồ sơ thì chỉ rõ cần tạo hồ sơ và dẫn tới S01; giữ bản nháp JD. Đây là luồng bổ sung cần xác nhận.

### S03 — Kết quả độ phù hợp

- Mục đích: giải thích đáp ứng và khoảng thiếu, hỗ trợ chọn bước cải thiện.
- Hiển thị: vị trí đang xét, thời điểm đánh giá, phiên bản hồ sơ/JD, từng tiêu chí, thông tin đối chiếu, trạng thái và lý do; điểm tổng nếu đã thống nhất cách tính.
- Trạng thái tiêu chí đề xuất: `met`, `partial`, `missing`, `unknown`. Thiếu bằng chứng là `unknown`, không tự kết luận người dùng không có năng lực.
- Sửa yêu cầu tuyển dụng → S02, nạp dữ liệu đã dùng.
- Xem hành trình → S04.
- Tạo cột mốc cải thiện → S05, điền gợi ý từ khoảng thiếu đã chọn; người dùng được sửa.
- Đề xuất: cập nhật hồ sơ hoặc JD không làm đổi kết quả cũ; hiển thị cần đánh giá lại và tạo kết quả mới khi người dùng yêu cầu.
- Không gọi điểm phù hợp là xác suất được tuyển. Không hiển thị số giả nếu không đánh giá được.

### S04 — Hành trình tìm việc

- Mục đích: xem các cột mốc và ghi nhận tiến bộ.
- Hiển thị đề xuất: danh sách cột mốc, trạng thái, hạn dự kiến nếu có, liên kết công việc liên quan, ghi nhận hoàn thành.
- Cập nhật hồ sơ → S01.
- Đánh giá tin tuyển dụng → S02.
- Thêm/mở cột mốc → S05, ghi nhớ nguồn mở là hành trình.
- Khi chưa có dữ liệu: hướng dẫn tạo hồ sơ, đánh giá công việc hoặc tạo cột mốc.
- Chưa mặc định có Kanban, streak, thông báo hay quản lý trạng thái ứng tuyển; cần xác nhận ý nghĩa “hành trình”.

### S05 — Chi tiết cột mốc

- Mục đích: biến khoảng thiếu thành việc làm cụ thể và ghi nhận kết quả.
- Trường đề xuất: tiêu đề, mô tả hành động, điều kiện hoàn thành, hạn tùy chọn, ghi nhận kết quả; liên kết tiêu chí/công việc nếu tạo từ S03.
- Đề xuất trạng thái: `planned`, `in_progress`, `completed`; chưa coi xóa, lưu trữ hay mở lại là chức năng đã chốt.
- Lưu cột mốc → S04.
- Hoàn thành và lưu ghi nhận → lưu trạng thái và ghi nhận trong cùng thao tác → S04.
- Hủy khi mở từ S03 → trở lại đúng kết quả S03.
- Hủy khi mở từ S04 → trở lại S04.
- Thiếu thông tin → ở lại S05, chỉ rõ lỗi, sửa rồi lưu. Lưu lỗi không làm mất form.
- Hoàn thành cột mốc không tự tăng kỹ năng hay điểm phù hợp; người dùng cập nhật hồ sơ và đánh giá lại khi cần.

## 6. Bảng chuyển tiếp theo sơ đồ

| Từ | Hành động | Đến | Quy tắc |
| --- | --- | --- | --- |
| S01 | Lưu hồ sơ / Lưu thay đổi | S04 | Chỉ chuyển sau lưu thành công |
| S01 | Hủy chỉnh sửa | S04 | Không ghi bản sửa |
| S01 | CV lỗi: tải lại hoặc nhập tay | S01 | Giữ dữ liệu hợp lệ đã nhập |
| S04 | Cập nhật hồ sơ | S01 | Nạp hồ sơ hiện tại |
| S04 | Đánh giá tin tuyển dụng | S02 | Mở form yêu cầu |
| S02 | Quay lại hành trình | S04 | Quy tắc bỏ bản nháp cần chốt |
| S02 | Xác nhận yêu cầu → Xem mức độ phù hợp | S03 | Chỉ chuyển khi đánh giá thành công |
| S02 | Dữ liệu lỗi: sửa hoặc thử lại | S02 | Không mất dữ liệu |
| S03 | Sửa yêu cầu tuyển dụng | S02 | Nạp yêu cầu đã dùng |
| S03 | Xem hành trình | S04 | Giữ kết quả đã lưu |
| S03 | Tạo cột mốc cải thiện | S05 | Gắn nguồn mở và khoảng thiếu |
| S04 | Thêm / Mở cột mốc | S05 | Gắn nguồn mở là S04 |
| S05 | Lưu / Hoàn thành và lưu ghi nhận | S04 | Chỉ chuyển sau lưu thành công |
| S05 | Hủy khi mở từ kết quả | S03 | Đúng assessmentId ban đầu |
| S05 | Hủy khi mở từ hành trình | S04 | Không ghi bản sửa |
| S05 | Thiếu thông tin: bổ sung rồi lưu | S05 | Hiển thị validation |

## 7. Quy tắc đánh giá — chưa chốt

Hai lựa chọn cần quyết định:

- Rule-based: so tiêu chí đã cấu trúc với hồ sơ, quy tắc minh bạch; cần định nghĩa cách chuẩn hóa kỹ năng, mức độ và tương đương.
- AI hỗ trợ: trích xuất/đối chiếu bằng mô hình, kết quả có schema và dẫn chứng từ hồ sơ/JD; cần nhà cung cấp, ngân sách, consent và xử lý lỗi.

Nếu dùng điểm, đề xuất công thức có thể kiểm tra: `100 × sum(weight_i × match_i) / sum(weight_i)` cho các tiêu chí đủ dữ liệu; hiển thị riêng tỷ lệ tiêu chí đủ thông tin. Giá trị `match_i`, trọng số, ngưỡng và xử lý bắt buộc chưa được quyết định. Nếu không có tiêu chí đủ dữ liệu thì điểm là `null`, không chia cho 0. Không so sánh điểm giữa các lần có độ bao phủ khác nhau mà không giải thích.

Kết quả cần lưu phiên bản thuật toán/prompt, phiên bản đầu vào và lý do cho từng tiêu chí. Nếu demo dùng dữ liệu mẫu, phải ghi rõ dữ liệu mẫu và không trộn với đánh giá thật.

## 8. Mô hình dữ liệu logic — đề xuất

| Entity | Nội dung chính | Quan hệ |
| --- | --- | --- |
| ProfileVersion | id, ownerId nếu có tài khoản, version, skills, education, experience, languages, createdAt | Một người có nhiều phiên bản |
| JobRequirementVersion | id, jobId, version, title, company, rawText, criteria, createdAt | Một công việc có nhiều phiên bản yêu cầu |
| Assessment | id, profileVersionId, jobRequirementVersionId, engineVersion, status, score nullable, coverage, items, createdAt | Gắn đúng phiên bản hai đầu vào |
| AssessmentItem | criterionId, status, rationale, profileEvidence, jobEvidence | Thuộc Assessment |
| Milestone | id, ownerId nếu có, title, action, completionCriteria, status, dueDate nullable, sourceAssessmentId nullable, sourceCriterionId nullable | Có thể độc lập hoặc từ kết quả |
| MilestoneRecord | id, milestoneId, note, completedAt | Đề xuất một ghi nhận khi hoàn thành trong MVP |

Nếu dùng backend: mọi truy cập theo chủ sở hữu; kiểm tra quyền với cả entity liên kết. Nếu demo local-only: không cam kết đồng bộ thiết bị hoặc bảo vệ đa người dùng bằng localStorage.

## 9. Hợp đồng chức năng — chưa phải API đã có

- `saveProfile(input)` → profileVersion; `extractCv(file)` → draft hoặc lỗi có thể xử lý.
- `saveJobRequirements(input)` → jobRequirementVersion.
- `createAssessment(profileVersionId, jobRequirementVersionId)` → kết quả hoặc trạng thái đang xử lý.
- `getAssessment(id)` → dữ liệu snapshot để render S03.
- `listMilestones()`; `getMilestone(id)`; `saveMilestone(input)`.
- `completeMilestone(id, record)` → lưu hoàn thành và ghi nhận nguyên tử; chống submit lặp tạo bản sao.

REST endpoints, DB schema, sync/async và cơ chế authentication sẽ định nghĩa sau khi chốt kiến trúc. Các adapter đánh giá và trích xuất nên độc lập với UI để dùng fake fixtures khi kiểm thử.

## 10. Yêu cầu trải nghiệm và dữ liệu — đề xuất

- Mọi màn hình có trạng thái trống, loading, thành công, validation và lỗi phục hồi.
- Thông báo lỗi gắn đúng trường; submit đang chạy được khóa; phản hồi thành công chỉ sau khi lưu.
- Form có nhãn, điều khiển bằng bàn phím, focus rõ, không chỉ dùng màu để diễn đạt trạng thái.
- Responsive cho desktop/mobile; kích thước mục tiêu và thứ tự ưu tiên sẽ chốt trong phần giao diện.
- CV và khóa AI không đưa vào git hoặc log. Khóa dịch vụ ở server. Chốt chính sách giữ/xóa CV, dữ liệu nào gửi AI trước khi tích hợp thật.
- Đánh giá lỗi/timeout không xóa lần đánh giá thành công trước; cho thử lại với đầu vào còn nguyên.
- Truy cập trực tiếp URL thiếu entity: hiển thị không tìm thấy và đường về S04; S05 không có nguồn mở thì mặc định hủy về S04.
- Ngôn ngữ giao diện và ngôn ngữ CV/JD là hai quyết định riêng.

## 11. Tiêu chí nghiệm thu chính

| Mã | Tình huống | Kết quả mong đợi |
| --- | --- | --- |
| AC01 | Nhập hồ sơ hợp lệ và lưu | S04; mở lại S01 giữ dữ liệu |
| AC02 | Sửa hồ sơ rồi hủy | S04; dữ liệu đã lưu không đổi |
| AC03 | Tải CV không xử lý được | S01 có lỗi, vẫn nhập tay được |
| AC04 | Xác nhận JD hợp lệ với hồ sơ đã lưu | S03 gắn đúng phiên bản đầu vào |
| AC05 | JD thiếu/lỗi hoặc đánh giá lỗi | Giữ form; có cách sửa/thử lại |
| AC06 | Mở kết quả | Mỗi tiêu chí có trạng thái, lý do và thông tin đối chiếu; thiếu dữ liệu không thành số giả |
| AC07 | Từ S03 tạo cột mốc rồi hủy | Trở đúng S03; không có cột mốc mới |
| AC08 | Từ S04 mở cột mốc rồi hủy | Trở S04; dữ liệu không đổi |
| AC09 | Lưu cột mốc thiếu trường bắt buộc | Ở S05 và chỉ rõ lỗi |
| AC10 | Lưu cột mốc hợp lệ | S04 hiển thị cột mốc, liên kết đúng nguồn nếu có |
| AC11 | Hoàn thành và lưu ghi nhận | S04 hiển thị trạng thái và ghi nhận; submit lặp không nhân bản |
| AC12 | Cập nhật hồ sơ sau một lần đánh giá | Kết quả cũ giữ nguyên snapshot; lần mới dùng dữ liệu mới |
| AC13 | Nếu có tài khoản: truy cập ID của người khác | Không đọc/sửa được dữ liệu |
| AC14 | Nếu có persistence: tải lại trang | Dữ liệu đã lưu tồn tại trong phạm vi lưu trữ đã công bố |

## 12. Quyết định đang mở

Xem `QUESTIONS.md`. Chỉ sau khi trả lời mới chốt MVP, tiêu chí bắt buộc, stack, mô hình lưu trữ, rubric đánh giá, ngôn ngữ, lịch triển khai và phạm vi AI.
