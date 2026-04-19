# Vault (Niêm phong hệ thống)

**Vaulting là cái chi vậy?**

Nói nôm na, Vaulting là một kiểu "niêm phong" dựa trên 2 thứ: vault.plist và vault.sig:

* vault.plist: Một bản "chụp hình" hiện trạng toàn bộ thư mục EFI của bạn.
* vault.sig: Cái chữ ký xác nhận bản chụp kia là hàng thật.

Bạn có thể coi đây là tính năng Secure Boot (khởi động an toàn) dành riêng cho OpenCore, đảm bảo không có ông nào "táy máy" sửa code của bạn để xâm nhập khi chưa được phép.

Cụ thể hơn là một cái chữ ký RSA-2048 (mã hóa 256 byte) của file vault.plist sẽ được "nhồi" thẳng vào file OpenCore.efi của chúng ta. Cái chìa khóa này có thể nhồi vào tệp mã nguồn [OpenCoreVault.c](https://github.com/acidanthera/OpenCorePkg/blob/master/Platform/OpenCore/OpenCoreVault.c) trước khi biên dịch, hoặc dùng lệnh `sign.command` nếu bạn đã có sẵn file OpenCore.efi rồi.

Lưu ý là file nvram.plist sẽ không được "niêm phong" đâu, nên mấy bạn dùng NVRAM giả lập (emulated NVRAM) vẫn có rủi ro bị ai đó thêm bớt mấy cái biến NVRAM đó nha.

**Thiết lập trong file config.plist**:

* `Misc -> Security -> Vault`:
  * `Basic`: Chỉ cần file vault.plist hiện diện là được, chủ yếu dùng để kiểm tra tính toàn vẹn của hệ thống file.
  * `Secure`: Đòi hỏi phải có cả vault.plist và vault.sig, bảo mật tận răng vì mỗi lần file vault.plist thay đổi là phải ký lại chữ ký mới.
* `Booter -> ProtectSecureBoot:` `YES`
  * Cần thiết cho các dòng mainboard Insyde để sửa lỗi khóa Secure Boot và báo cáo các vi phạm bảo mật.

**Setting up vault**:

Tải bộ OpenCorePkg về và mở thư mục `CreateVault` ra, bên trong sẽ thấy mấy món ăn chơi sau:

* `create_vault.sh`
* `RsaTool`
* `sign.command`

Cái chúng ta cần quan tâm nhất là: `sign.command` (chương trình dòng lệnh để ký tên).

Khi chạy lệnh này, nó sẽ lùng sục thư mục EFI nằm kế bên thư mục Utilities (tiện ích). Vì vậy, bạn hãy copy thư mục EFI của mình vào trong thư mục OpenCorePkg, hoặc lôi cái Utilities vào trong thư mục EFI của mình cũng được:

![](../../images/post-install/security-md/sign.png)

Giờ thì sẵn sàng chạy `sign.command` rồi đó:

![](../../images/post-install/security-md/sign-demo.png)

**Cách gỡ bỏ Vault sau khi đã cài**:

Nếu bạn đang cần vọc vạch sâu (troubleshooting) hoặc muốn nghỉ chơi với Vault, hãy làm các bước sau:

* Kiếm một file OpenCore.efi mới tinh (chưa bị ký).
* Chỉnh lại `Misc -> Security -> Vault` thành Optional.
* Xoá 2 file `vault.plist` và `vault.sig` là xong.
