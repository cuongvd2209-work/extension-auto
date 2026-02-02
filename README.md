# Hướng Dẫn Phát Triển Extension AI Task Auto Process

## Mô Tả
Extension Chrome này tự động hóa quá trình xử lý văn bản trên hệ thống quản lý văn bản điện tử. Nó sử dụng AI để phân tích file PDF đính kèm và tự động điền các trường trong form phân công nhiệm vụ.

## Yêu Cầu
- Google Chrome hoặc trình duyệt Chromium-based
- Tài khoản truy cập hệ thống mục tiêu
- API server backend đang chạy và accessible

## Cài Đặt Extension Ở Chế Độ Phát Triển

1. **Mở Chrome và truy cập trang Extensions:**
   - Nhập `chrome://extensions/` vào thanh địa chỉ và nhấn Enter.

2. **Bật Chế Độ Nhà Phát Triển:**
   - Ở góc trên bên phải, bật công tắc "Developer mode" (Chế độ nhà phát triển).

3. **Tải Extension Chưa Đóng Gói:**
   - Nhấp vào nút "Load unpacked" (Tải chưa đóng gói).
   - Chọn thư mục chứa extension: `e:\Projects\extension-auto`
   - Extension sẽ xuất hiện trong danh sách với tên "AI Task Auto Process".

4. **Kiểm Tra Extension Đã Tải:**
   - Đảm bảo extension được bật (công tắc xanh).
   - Icon extension sẽ xuất hiện ở thanh công cụ của Chrome.

## Cách Sử Dụng

### Chuẩn Bị
1. Đăng nhập vào hệ thống mục tiêu.
2. Đảm bảo API server backend đang chạy và accessible.

### Chạy Extension
1. **Mở Trang Văn Bản:**
   - Truy cập trang danh sách văn bản đến cần xử lý.

2. **Mở Popup Extension:**
   - Nhấp vào icon extension ở thanh công cụ Chrome.

3. **Cấu Hình và Chạy:**
   - **Doc ID (tùy chọn):** Nhập ID cụ thể của văn bản nếu muốn xử lý một văn bản duy nhất. Để trống để xử lý tất cả văn bản trong danh sách.
   - Nhấp nút "Run" để bắt đầu quá trình tự động.

### Quá Trình Tự Động
Extension sẽ thực hiện các bước sau:
1. Lấy danh sách ID văn bản từ trang hiện tại.
2. Mở trang phân công nhiệm vụ cho văn bản đầu tiên.
3. Tải và phân tích file PDF đính kèm bằng AI.
4. Tự động điền các trường: độ ưu tiên, hạn hoàn thành, số ngày thực hiện, tiêu đề, mô tả.
5. Phân công nhiệm vụ cho người dùng dựa trên kết quả AI.
6. Chuyển sang văn bản tiếp theo và lặp lại.

### Ghi Log
Extension ghi log các hành động vào API server để theo dõi quá trình xử lý.

## Cấu Trúc File
- `manifest.json`: Cấu hình extension
- `background.js`: Service worker background
- `content.js`: Content script inject vào trang web
- `inject.js`: Script chính thực hiện logic tự động
- `popup.html` & `popup.js`: Giao diện popup của extension

## Lưu Ý Quan Trọng
- Extension chỉ hoạt động trên các domain được chỉ định trong manifest
- Đảm bảo API server có access token hợp lệ (tự động refresh khi hết hạn)
- Quá trình phân tích PDF có thể mất thời gian, extension sẽ tự động retry nếu cần
- Không sử dụng extension trên môi trường production mà không kiểm tra kỹ
- Cần cấu hình thông tin đăng nhập và API endpoints trong file `inject.js`

## Phát Triển Thêm
- Sửa đổi code trong các file JS theo nhu cầu
- Reload extension từ trang chrome://extensions/ sau khi thay đổi
- Sử dụng console của trang web để debug (F12 > Console)

## Liên Hệ
Nếu có vấn đề, kiểm tra log trong console hoặc liên hệ đội phát triển.