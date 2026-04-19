# FileVault (Tính năng mã hóa ổ đĩa)

FileVault là "vệ sĩ" có sẵn của macOS để mã hoá dữ liệu trên ổ cứng giúp bảo vệ tốt hơn, tương tự BitLocker của Windows. Nhờ có OpenCore (phần mềm hỗ trợ khởi động), việc hỗ trợ tính năng này đã ngon lành hơn nhiều so với mấy cái driver Clover (driver cũ) thời xưa rồi.

Để bắt đầu, bạn sẽ cần mấy file .efi (trình điều khiển hệ thống) sau đây:

* OpenRuntime.efi
  * Hoặc là [OpenUsbKbDxe.efi](https://github.com/acidanthera/OpenCorePkg/releases) dành cho các dân chơi xài DuetPkg (tức là những máy đời cũ không có hỗ trợ UEFI á)

**Tuyệt đối không sử dụng VirtualSMC.efi với OpenCore nha, vì nó đã được "tích hợp sẵn" bên trong rồi**. Tuy nhiên, bạn vẫn cần file VirtualSMC.kext (trình điều khiển hệ thống ảo) như bình thường đó.

Thiết lập trong file config.plist (file cấu hình) của bạn:

* Misc -> Boot
  * `PollAppleHotKeys` đặt thành YES (Có thể không bắt buộc nhưng mở đi cho chắc, giúp nhận các phím tắt khi khởi động)
* Misc -> Security
  * `AuthRestart` đặt thành YES (Cho phép khởi động lại có xác thực cho FileVault 2, giúp bạn không cần nhập mật khẩu mỗi lần reboot (khởi động lại). Cái này có thể coi là một rủi ro bảo mật nhẹ nên ai kỹ tính thì coi như tùy chọn thôi nha)
* NVRAM -> Add -> 4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14
  * `UIScale` đặt thành 02 nếu bạn xài màn hình nhỏ mà độ phân giải cao (giả kiểu màn hình Retina trên mấy con MacBook) cho đỡ mỏi mắt
* UEFI -> Input
  * `KeySupport` đặt thành YES (Chỉ xài cái này khi bạn xài bộ nạp đầu vào có sẵn của OpenCore, mấy bạn đang sử dụng OpenUsbKbDxe thì né cái này ra nha)
* UEFI -> Output
  * `ProvideConsoleGop` đặt thành YES
* UEFI -> ProtocolOverrides
  * `FirmwareVolume` đặt thành YES
  * `HashServices` đặt thành YES cho đời Broadwell trở về trước (tính luôn cả dòng X99), cái này cần thiết cho mấy máy bị lỗi thuật toán băm SHA-1 (thuật toán bảo mật)
* UEFI -> Quirks
  * `RequestBootVarRouting` đặt thành YES
  * `ExitBootServicesDelay` đặt giá trị là `3000`-`5000` nếu bạn bị lỗi đứng hình ở dòng `Still waiting for root device` trên các dòng máy Aptio IV (đời Broadwell trở về trước)

Sau khi chỉnh xong mấy thứ trên, bạn có thể tự tin đi kích hoạt FileVault y hệt như một chiếc Mac xịn trong phần `System Preferences -> Security & Privacy -> FileVault`

Nếu gặp lỗi hiển thị, mời bạn xem qua mục [Sửa độ phân giải không đúng và tắt màn hình dòng lệnh chạy chữ](../../cosmetic/verbose.md)
