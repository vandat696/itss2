# Phạm vi MVP

- Hồ sơ cá nhân có chuyên ngành, năm học, kỹ năng, kinh nghiệm, dự án, lịch rảnh và CV PDF tùy chọn. Bản ghi hồ sơ đầu tiên và lần lưu CV đầu tiên tạo mốc để xem lại.
- Danh sách tin giả lập và tin nhập tay, với bộ lọc theo từ khóa, chuyên ngành, loại công việc, kỹ năng và lịch làm việc.
- Đối chiếu theo dữ liệu có cấu trúc. Các trường văn bản tự do được dùng để người dùng đọc và xác nhận. Điểm làm tròn đến số nguyên, với trọng số 2 cho yêu cầu bắt buộc và 1 cho yêu cầu ưu tiên. Trạng thái chưa xác định bị loại khỏi mẫu số. Phần trăm không dự báo khả năng trúng tuyển.
- Cột mốc có thể chỉnh sửa, hoàn thành hoặc xóa. Lịch sử hoàn thành được giữ lại khi xóa. Chỉ số cột mốc hiện tại đếm các cột mốc còn tồn tại. Chỉ số kỹ năng so sánh hồ sơ hiện tại với hồ sơ ban đầu. Chỉ số cập nhật CV đếm số lần tải CV sau bản đầu tiên.
- Một tin được đếm là đã đánh giá khi có kết quả ghi nhận, kể cả khi kết quả chưa đủ thông tin. Số lần thay đổi hồ sơ/JD không làm tăng số tin đã đánh giá.

Cột mốc có hạn hoàn thành tùy chọn, bộ lọc trạng thái và đánh dấu quá hạn theo UTC+7. Mục đã hoàn thành không bị đánh dấu quá hạn. Trên hồ sơ, người dùng có thể tải lại 5 phiên bản CV gần nhất.

Theo dõi ứng tuyển ở `/applications`: ghi nhận thủ công hoặc liên kết một tin tuyển dụng, tìm kiếm/lọc sáu trạng thái, lịch phỏng vấn, ngày theo dõi tiếp, thông tin liên hệ và ghi chú. Sự kiện trạng thái được lưu riêng; mỗi tin chỉ liên kết với một đơn. Ngày giờ theo UTC+7; nhắc việc hiển thị trong trang cho các đơn đang theo đuổi. Xóa đơn xóa lịch sử tương ứng. Không tự gửi hồ sơ, email hoặc thông báo nền. Landing và trang hành trình có đường dẫn đến chức năng này.

JD hỗ trợ dán văn bản để gợi ý tiêu chí theo bộ quy tắc có giới hạn, kèm đoạn trích gốc và xác nhận từng mục. Điều kiện mơ hồ giữ ở mức chưa rõ; những dòng chưa nhận diện cần được đọc thủ công. Không dùng AI hoặc tải nội dung từ URL. Màn hình đánh giá tách ba nhóm, thể hiện số tiêu chí được tính, giải thích và bằng chứng đã lưu; thông tin thiếu không bị mặc định xem là không đáp ứng. Gợi ý hỏi nhà tuyển dụng và liên kết tạo cột mốc có ở từng mục cần làm rõ/cải thiện.

Các phiên bản sau có thể bổ sung xác thực và phân tách người dùng, phân tích CV đáng tin cậy, xóa phiên bản CV, tích hợp nguồn tin thật và lịch làm việc theo ngày cụ thể. Bản MVP hỗ trợ lịch lặp theo tuần với các khoảng giờ trong một ngày.
