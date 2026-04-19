# Giả lập NVRAM

::: danger CẢNH BÁO

Phần này có thể chưa cập nhật hoàn toàn cho các bản OpenCore mới nhất (từ 0.8.3 trở đi), bạn nên kiểm tra kỹ phiên bản mình đang sử dụng nhé.

:::

NVRAM là nơi lưu trữ các biến hệ thống (như độ sáng màn hình, âm lượng, ổ đĩa khởi động trong macOS...). Một số dòng máy như X99 hoặc X299 thường có NVRAM được lập trình theo cách không tương thích với macOS, nên mình phải giả lập nó

* X99
* X299

Đối với bạn đọc đang sử dụng các dòng bo mạch chủ B360, B365, H310, H370 và Z390, hãy bảo đảm bạn đã cài đặt [SSDT-PMC](https://dortania.github.io/Getting-Started-With-ACPI/) cả trong EFI/OC/ACPI và config.plist -> ACPI -> Add. Để biết thêm thông tin về cách tạo và biên dịch SSDT, vui lòng đọc [**Khởi đầu với ACPI**](https://baokhanhwithfriends.github.io/Khoi-dau-voi-ACPI/)

## Dọn dẹp tàn dư của Clover

Có thể một số người không để ý, nhưng Clover có thể đã cài đặt các tập lệnh RC vào macOS để mô phỏng NVRAM đúng cách. Đây là một vấn đề vì nó xung đột với phương pháp mô phỏng của OpenCore. Nếu trước đó bạn có xài Clover, hãy vô xóa sạch mấy file này để tránh "đánh nhau" với OpenCore:

Các tập tin cần xóa:

* `/Volumes/EFI/EFI/CLOVER/drivers64UEFI/EmuVariableUefi-64.efi`
* `/Volumes/EFI/nvram.plist`
* `/etc/rc.clover.lib`
* `/etc/rc.boot.d/10.save_and_rotate_boot_log.local`
* `/etc/rc.boot.d/20.mount_ESP.local`
* `/etc/rc.boot.d/70.disable_sleep_proxy_client.local.disabled`
* `/etc/rc.shutdown.d/80.save_nvram_plist.local​`

Nếu các thư mục trống thì hãy xóa tụi nó luôn:

* `/etc/rc.boot.d`
* `/etc/rc.shutdown.d​`

## Kiểm tra xem NVRAM có chạy không

Để bắt đầu, hãy mở cửa sổ dòng lệnh và chạy lệnh sau, lệnh này sẽ thiết lập một biến có tên `test` trong NVRAM của bạn thành ngày giờ hiện tại:

```sh
sudo nvram myvar="$(date)"
```

Sau đó khởi động lại máy rồi gõ:

```sh
nvram myvar
```

Nếu không có gì được trả về thì NVRAM của bạn "hẻo". Nếu có một dòng chứa `myvar` và sau đó là ngày hiện tại, thì NVRAM của bạn đang hoạt động tốt.

## Cách thiết lập giả lập NVRAM (với tệp `nvram.plist`)

Nếu bạn không có NVRAM nguyên bản (native), đừng lo lắng. Chúng ta có thể tạo ra NVRAM mô phỏng bằng cách sử dụng một tập lệnh để lưu nội dung NVRAM vào một tệp plist trong quá trình tắt máy, sau đó OpenCore sẽ nạp tệp này khi khởi động lại.

Để kích hoạt mô phỏng NVRAM, bạn cần thiết lập như sau:

Trong tệp config.plist của bạn:

* **Booter -> Quirks**:
  * `DisableVariableWrite`: đặt thành `NO`
* **Misc -> Security**:
  * `ExposeSensitiveData`: đặt thành giá trị ít nhất là `0x1`
* **NVRAM**:
  * `LegacyOverwrite` đặt thành `YES`
  * `LegacySchema`: Các biến NVRAM được thiết lập (OpenCore so sánh các biến này với các biến có trong `nvram.plist`)
  * `WriteFlash`: đặt thành `YES`

Trong thư mục EFI:

* Phải có driver `OpenVariableRuntimeDxe.efi`
* Phải có driver `OpenRuntime.efi` (Cái này cần thiết để chế độ ngủ, tắt máy và các dịch vụ khác hoạt động đúng cách)

Make sure to snapshot after to make sure the drivers are listed in your config.plist. Afterwards, make sure that both `OpenVariableRuntimeDxe.efi` and `OpenRuntime.efi` have `LoadEarly` set to `YES`, and that `OpenVariableRuntimeDxe.efi` is placed _before_ `OpenRuntime.efi` in your config.
Hãy nhớ chạy snapshot sau đó để bảo đảm rằng các trình điều khiển đã được khai báo đầy đủ trong config.plist của bạn. Sau đó, hãy chắc chắn rằng cả `OpenVariableRuntimeDxe.efi` và `OpenRuntime.efi` đều có `LoadEarly` được đặt thành `YES` và `OpenVariableRuntimeDxe.efi` được đặt _trước_ `OpenRuntime.efi` trong cấu hình của bạn.

Bây giờ hãy tải thư mục [LogoutHook](https://github.com/acidanthera/OpenCorePkg/releases) (bên trong thư mục `Utilities`) và đặt nó ở một nơi an toàn (ví dụ: trong thư mục người dùng của bạn, như hình bên dưới):

`/Users/$(whoami)/LogoutHook/`

Mở cửa sổ terminal và chạy các lệnh sau (từng lệnh một):

```bash
cd /Users/$(whoami)/LogoutHook/
./Launchd.command install 
```

Vậy là xong, từ nay máy bạn sẽ có NVRAM "pha-ke" chạy mượt mà như hàng thiệt!
