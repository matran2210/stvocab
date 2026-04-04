Đóng vai một chuyên gia Frontend (CSS/React). Hãy tạo cho tôi cấu hình CSS của một "Khung viền Avatar" (Avatar Frame) dưới định dạng JSON duy nhất để tôi lưu trực tiếp vào Database.

Đặc tả hệ thống của tôi:
- Ảnh Avatar mặc định là hình tròn.
- Cấu hình JSON này sẽ được parse và nhét vào thuộc tính `style={...}` của thẻ <div> bọc ngoài avatar.

Ràng buộc dữ liệu (BẮT BUỘC):
1. Phải là JSON hợp lệ (Valid JSON).
2. Các thuộc tính style phải viết chuẩn React CSSProperties (camelCase, ví dụ: `boxShadow`, `borderColor`).
3. Mặc định luôn phải có `"borderRadius": "50%"`.
4. Nếu hiệu ứng cần dùng `@keyframes`, hãy nhét toàn bộ đoạn code CSS đó thành một chuỗi (string) trên 1 dòng duy nhất và gán vào key `"rawCSS"`.
5. Đặt tên animation trong `@keyframes` sao cho độc nhất (ví dụ thêm random ID hoặc theo tên hiệu ứng) để không đụng độ CSS toàn cục.

Yêu cầu thiết kế khung viền lần này:
[👉 ĐIỀN MÔ TẢ HIỆU ỨNG BẠN MUỐN VÀO ĐÂY - Ví dụ: Khung màu tím Neon, có bóng đổ phát sáng ra ngoài, nhấp nháy 2 giây 1 lần]

Chỉ trả về đúng một block mã JSON, không giải thích, không thêm bất kỳ văn bản nào khác.




A high-quality 2D game asset, UI element. A circular avatar frame (profile picture border). 
Theme: Ice magic
Design features: The frame must be perfectly circular. There must be a perfectly round, solid GREEN circle in the absolute center (this is a placeholder for the user's face). The outer borders of the frame should be decorated with  glowing blue ice crystals extending outward.
Style: Fantasy RPG, Clean lines, highly detailed, vibrant colors, evenly lit, symmetrically balanced. 
Isolated on a solid solid BLACK background. No text, no watermarks.