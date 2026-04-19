# Bảo mật và mã hoá ổ cứng bằng FileVault

Một điều làm nên sự đặc biệt của OpenCore chính là nó được xây dựng với tư duy bảo mật ngay từ trong trứng nước, một điều khá là hiếm có khó tìm, nhất là trong cái cộng đồng Hackintosh này. Rồi, giờ chúng ta sẽ cùng nhau đi qua và thiết lập vài tính năng Security (Bảo mật) xịn sò của OpenCore:

* [**FileVault**](./security/filevault.md)
  * Tính năng mã hóa ổ cứng tích hợp sẵn của Apple
* [**Vault**](./security/vault.md)
  * OpenCore's semi-secure boot (Chế độ khởi động bán bảo mật của OpenCore), sử dụng để snapshot (chụp lại trạng thái) OpenCore để đảm bảo không có thay đổi không mong muốn nào xảy ra.
* [**ScanPolicy**](./security/scanpolicy.md)
  * OpenCore's drive policy (Chính sách ổ đĩa của OpenCore), quyết định xem loại ổ đĩa nào được phép "hiện nguyên hình" trong menu khởi động của OpenCore.
* [**OpenCore Password Setup**](./security/password.md)
  * Cho phép thiết lập mật khẩu trong menu khởi động OpenCore.
* [**Apple Secure Boot**](./security/applesecureboot.md)
  * Biến thể chế độ khởi động an toàn của Apple trong nhân macOS.
