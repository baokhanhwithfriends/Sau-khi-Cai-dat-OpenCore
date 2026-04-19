# Sau khi cài đặt OpenCore

Chào mừng các dân chơi đến với hướng dẫn sau khi cài đặt (Post-Install) OpenCore! Lưu ý nhẹ là nếu bạn chưa cài đặt xong macOS, thì mình khuyên bạn nên quay xe và làm theo hướng dẫn cài đặt này trước đã:

* [Hướng dẫn cài đặt OpenCore](https://baokhanhwithfriends.github.io/Huong-dan-cai-dat-OpenCore/)

Và mặc dù mấy chiêu thức ở đây có thể áp dụng cho cả OpenCore và Clover (một trình nạp khởi động cũ), nhưng tụi mình chủ yếu "simp" OpenCore thôi. Nên nếu bạn dùng cái khác mà gặp lỗi thì chịu khó tự mò thêm chút nhé.

## Cách "luyện" bí kíp này

Đầu tiên phải nói luôn, mình không bắt buộc bạn phải làm hết mọi phần trong hướng dẫn này đâu nha. Tùy vào độ "chơi" của mỗi người, xem mình muốn máy xịn sò giống Mac thiệt tới mức nào hoặc cần sửa cái lỗi bug gì thôi.

Hướng dẫn này được chia thành 8 chương:

* [Các chức năng cơ bản](#cac-chuc-nang-co-ban)
  * Mình khuyên tất cả mọi người nên theo hết phần này trước để bảo đảm Hackintosh của bạn sử dụng được đủ chức năng.
* [Sửa lỗi USB](#sua-loi-usb)
  * Cái này ai cũng nên làm luôn cho chắc cú.
* [Cải thiện Bảo mật](#cai-thien-bao-mat)
  * Dành cho mấy bác hay lo xa, quan tâm đến bảo mật và quyền riêng tư giống như Mac thiệt.
* [Hướng dẫn dành riêng cho Laptop](#huong-dan-danh-rieng-cho-laptop)
  * Mấy bạn xài Laptop thì nên làm thêm phần này ngoài mấy cái ở trên.
* [Làm đẹp/Giao diện](#lam-đep-giao-dien)
  * Bổ sung thêm mấy thứ màu mè như giao diện GUI (Giao diện đồ họa người dùng) của OpenCore và tắt mấy dòng chữ chạy chạy nhức mắt khi khởi động để bản Hack thêm hoàn hảo.
* [Chạy nhiều hệ điều hành](#chay-nhieu-he-đieu-hanh)
  * Lời khuyên cho mấy bạn thích "bắt cá hai tay", chạy nhiều hệ điều hành một lúc.
* [Linh tinh lang tang](#linh-tinh-lang-tang)
  * Mấy cái sửa lỗi lặt vặt khác, không phải ai cũng cần sửa tới. Sửa được thì càng tốt thôi. 
* [Vá lỗi Card màn hình](#va-loi-card-man-hinh)
  * Đi sâu vào việc "chọc ngoáy" macOS để ép nó hỗ trợ nhiều loại phần cứng GPU (Bộ xử lý đồ họa) khác nhau nếu bản vá thông thường không khuất phục được cái card.

### Các chức năng cơ bản

* [Sửa lỗi âm thanh](./universal/audio.md)
  * Dành cho mấy bác cần cứu ca này, dạng như máy bị "câm" mở nhạc nhưng không nghe thấy gì.
* [Khởi động không cần USB](./universal/oc2hdd.md)
  * Giúp bạn khởi động vào OpenCore luôn mà không cần cắm USB mồi nữa.
* [Cập nhật OpenCore, kexts và macOS](./universal/update.md)
  * Cách để cập nhật Kexts (Trình điều khiển), OpenCore và thậm chí cả macOS một cách an toàn mà không làm "hư" máy.
* [Sửa lỗi quản lý bản quyền số (DRM)](./universal/drm.md)
  * Dành cho ai bị lỗi DRM (Quản lý bản quyền kỹ thuật số), ví dụ như không xem được Netflix, Apple TV.
* [Sửa mấy cái ứng dụng dịch vụ của Apple không xài được](./universal/iservices.md)
  * Giúp sửa mấy lỗi lặt vặt của iServices như iMessage (Tin nhắn) không xài được.
* [Sửa lỗi điều phối điện năng](./universal/pm.md)
  * Sửa lỗi và cải thiện kỹ năng sử dụng nguồn điện của macOS hiệu quả hơn, ít lãng phí điện, cho phép máy Hackintosh biết tiết kiệm điện khi vô chế độ nghỉ hoặc (bơm điện) khi cần tăng tốc hiệu năng.
* [Sửa chế độ ngủ không hoạt động](./universal/sleep.md)
  * Tổng hợp đủ chỗ để kiểm tra khi máy bạn bị chứng "mất ngủ" hoặc đi ngủ mà ngủ luôn không dậy.

### Sửa lỗi USB

* [Lập sơ đồ cổng USB: Phần giới thiệu](./usb/README.md)
  * Điểm bắt đầu để xử lý các vấn đề của cổng USB như bị macOS nhận diện thiếu cổng hoặc giúp máy ngủ ngon hơn nếu máy đang bị hội chứng "mất ngủ kinh niên".

### Cải thiện Bảo mật

* [Bảo mật và Mã hóa ổ cứng](./universal/security.md)
  * Ở đây chúng ta sẽ đi qua cách thiết lập tính năng Security (Bảo mật) xịn sò của OpenCore.

### Hướng dẫn dành riêng cho Laptop

* [Sửa lỗi hiển thị phần trăm pin](./laptop-specific/battery.md)
  * Nếu cục pin của bạn không chịu hiện đúng phần trăm ngay từ đầu với SMCBatteryManager (Trình quản lý pin SMC).

### Làm đẹp/Giao diện

* [Thêm giao diện và âm thanh khởi động](./cosmetic/gui.md)
  * Thêm cái giao diện GUI (Giao diện đồ họa) soang chảnh cho OpenCore và thậm chí cả tiếng "Tèng" huyền thoại khi mở máy!
* [Sửa độ phân giải không đúng và tắt màn hình dòng lệnh chạy chữ](./cosmetic/verbose.md)
  * Giúp chỉnh lại độ phân giải của OpenCore cho nét, cho phép bạn ngắm logo Táo khuyết sexy khi khởi động thay vì nhìn chữ chạy như ma trận!
* [Sửa lỗi bộ nhớ khi xài SMBIOS MacPro7,1](./universal/memory.md)
  * Sửa mấy cái lỗi bộ nhớ khó chịu nếu xài SMBIOS MacPro7,1 khi khởi động.

### Chạy nhiều hệ điều hành

* [Đa khởi động với OpenCore](https://baokhanhwithfriends.github.io/Da-khoi-dong-OpenCore/)
  * Hướng dẫn chuyên sâu để chạy nhiều hệ điều hành với OpenCore.
* [Thiết lập tùy chọn trình khởi chạy LauncherOption](./multiboot/bootstrap.md)
  * Bảo đảm ông trùm Windows không đá đít OpenCore khỏi máy tính của chúng ta.
* [Cài đặt BootCamp](./multiboot/bootcamp.md)
  * Cho phép cài đặt BootCamp (Trình hỗ trợ khởi động của Apple trên Windows) để chuyển đổi qua lại giữa các hệ điều hành dễ hơn.

### Linh tinh lang tang

* [Sửa lỗi đồng hồ thời gian thực (RTC)](./misc/rtc.md)
  * Giúp giải quyết các vấn đề liên quan đến RTC/CMOS (Bộ nhớ BIOS) hoặc máy bị khởi động lại vào chế độ an toàn (Safe Mode của BIOS).
* [Sửa lỗi khóa cấu hình (CFG Lock)](./misc/msr-lock.md)
  * Cho phép gỡ bỏ một số bản vá kernel (nhân hệ điều hành) để máy chạy ổn định hơn.
* [Giả lập bộ nhớ NVRAM](./misc/nvram.md)
  * Dành cho mấy bạn có NVRAM (Bộ nhớ truy cập ngẫu nhiên không mất dữ liệu khi bị cắt nguồn điện) bị hư (thường gặp trên mấy cái Mainboard Intel chipset dòng 300), hoặc cần test thử xem nó có chạy không.

### Vá lỗi Card màn hình

* [Vá lỗi card màn hình chuyên sâu](./gpu-patching/README.md)
  * Phần này là phần vá lỗi chuyên sâu dành cho bạn đọc đã đi theo hướng dẫn cấu hình framebuffer dành cho thế hệ CPU của mình, tuy nhiên vẫn không vào được giao diện cài đặt của macOS.