# Sửa độ phân giải không đúng và tắt màn hình dòng lệnh chạy chữ

Bạn muốn trải nghiệm khởi động macOS sạch sẽ, mượt mà và không còn mấy dòng chữ trắng chạy lằng nhằng (verbose text) mỗi khi mở máy? Đây là những thứ bạn cần chỉnh:

## Dọn dẹp macOS cho gọn

**`Misc -> Debug`**

* Đặt `AppleDebug` thành False: Cái này sẽ tắt tính năng gỡ lỗi boot.efi (trình nạp khởi động của Apple) ngay khi vừa bắt đầu khởi động.

**`NVRAM -> Add -> 7C436110-AB2A-4BBB-A880-FE41995C9F82`**:

* Xoá `-v` khỏi boot-args trong file config.plist của bạn để tắt chế độ hiển thị dòng lệnh.

**`NVRAM -> Add -> 4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14`**:

* UIScale
  * `01`: Độ phân giải tiêu chuẩn.
  * `02`: Kích hoạt HiDPI (thường bắt buộc phải có để FileVault (mã hóa ổ đĩa) hiển thị chuẩn trên mấy màn hình kích thước nhỏ mà có độ phân giải cao)

**`UEFI -> Output`**:

* `TextRenderer` đặt thành `BuiltinGraphics` (Trình kết xuất văn bản bằng đồ họa tích hợp).
* `Resolution` (Độ phân giải): đặt là `Max` để có kết quả hiển thị tốt nhất
  * Ngoài ra bạn có thể tự ghi độ phân giải mong muốn theo cấu trúc: `RộngxCao@ĐộSâuMàu (dạng như 1920x1080@32) hoặc chỉ có RộngxCao (dạng như 1920x1080)`
* `ProvideConsoleGop` đặt thành True

Nếu vẫn còn "cấn", bạn có thể xem thêm file [Configuration.pdf](https://github.com/acidanthera/OpenCorePkg/blob/master/Docs/Configuration.pdf) để biết hết các cài đặt có thể chỉnh.

## Dọn dẹp OpenCore

Nếu lúc cài đặt bạn làm theo sát hướng dẫn thì khả năng cao là bạn đang dùng bản OpenCore Debug (bản gỡ lỗi). Mỗi lần khởi động nó sẽ tự đẻ ra một file .txt. Để dọn dẹp mấy cái thông báo dư thừa này và tắt tính năng tự tạo file .txt đó, bạn làm như sau:

**Trong file config.plist**:

* `Misc -> Debug -> Target`: 3
  * `Target` là con số quyết định việc log (ghi nhật ký) cái gì và ghi như thế nào. Bạn có thể xem thêm ở mục [Gỡ lỗi OpenCore](https://baokhanhwithfriends.github.io/Huong-dan-cai-dat-OpenCore/troubleshooting/debug.html) for more values
  
**Trong thư mục EFI của bạn**:

* Thay thế các file sau bằng [phiên bản chính thức](https://github.com/acidanthera/OpenCorePkg/releases)(nếu trước đó bạn đang xài bản DEBUG):
  * EFI/BOOT/
    * `BOOTx64.efi`
  * EFI/OC/Drivers/
    * `OpenRuntime.efi`
  * EFI/OC/
    * `OpenCore.efi`
