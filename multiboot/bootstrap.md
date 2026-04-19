# Thiết lập tùy chọn trình khởi chạy LauncherOption 

* Lưu ý: Từ OpenCore 0.6.6, file Bootstrap.efi đã được thay thế bằng LauncherOption: [Cập nhật Bootstrap trong bản 0.6.6](#cap-nhat-bootstrap-trong-ban-0-6-6)

Với OpenCore 0.6.6 trở đi, chúng ta có thể khởi động thẳng OpenCore từ phần sụn (firmware) của máy mà không cần qua trung gian (như Bootstrap.efi hay BOOTx64.efi). Việc này giúp thêm OpenCore vào menu boot của mainboard một cách chính thống, ngăn mấy ông Windows hay Linux "ngứa tay" ghi đè lên đường dẫn `EFI/BOOT/BOOTx64.efi` mỗi khi cập nhật hệ điều hành, làm hư khả năng boot vào OpenCore.

## Điều kiện tiên quyết

![](../images/bootstrap-md/config.png)

* [OpenCore phiên bản 0.6.6 hoặc mới hơn](https://github.com/acidanthera/OpenCorePkg/releases)
  * Với phiên bản 0.6.5 hoặc cũ hơn đề nghị bạn nâng cấp lên, đọc tại đây: [Cập nhật Bootstrap trong bản 0.6.6](#cap-nhat-bootstrap-trong-ban-0-6-6)
* Thiết lập trong file config.plist:
  * `Misc -> Boot -> LauncherOption` = `Full`
    * Xài giá trị `Short` cho các dòng mainboard Insyde (thường thấy trên laptop).
  * `UEFI -> Quirks -> RequestBootVarRouting` = `True`
* [OpenShell](https://github.com/acidanthera/OpenCorePkg/releases)
  * Đã được tích hợp vô OpenCore
  * Nhớ thêm nó vào cả thư mục EFI/OC/Tools và mục `Misc -> Tools` trong file cấu hình
  * Cái này chủ yếu dùng để "cứu net" khi có sự cố thôi

## Khởi động

Nếu mọi thứ đã chuẩn, lần khởi động đầu tiên OpenCore sẽ tự tạo một tùy chọn boot mới trong BIOS (trỏ thẳng tới `EFI/OC/OpenCore.efi`) Các lần boot sau nó sẽ tự kiểm tra và cập nhật để đảm bảo tùy chọn này luôn tồn tại. Giờ bạn có thể xóa luôn file BOOTx64.efi đi cho sạch ổ đĩa mà không lo `EFI/BOOT/BOOTx64.efi` bị các hệ điều hành khác "cướp quyền" khởi động.

## Khắc phục sự cố

Nếu khởi động lại mà không thấy tùy chọn boot mới nào, hãy kiểm tra kỹ lại các điều kiện cần ở trên. Dưới đây là hướng dẫn nhanh nếu LauncherOption không tự chạy hoặc bạn muốn làm thủ công.

* [Kiểm tra việc áp dụng LauncherOption](#kiem-tra-viec-ap-dung-launcheroption)
* [Xóa LauncherOption khỏi BIOS](#xoa-launcheroption-khoi-bios)

### Kiểm tra việc áp dụng LauncherOption

Để xác nhận, bạn bật tính năng ghi log của OpenCore (xem [OpenCore Debugging](https://dortania.github.io/OpenCore-Install-Guide/troubleshooting/debug.html)) và tìm mấy dòng giống vầy:

```
OCB: Have existing option 1, valid 1
OCB: Boot order has first option as the default option
```

### Xóa LauncherOption khỏi BIOS 

Vì LauncherOption là một mục được bảo vệ khi bạn Reset NVRAM, nên bạn phải tắt `LauncherOption` đi trước khi muốn xóa hẳn:

* `Misc -> Security -> AllowNvramReset -> True`
* `Misc -> Boot -> LauncherOption -> Disabled`

Chỉnh xong thì reboot vào menu OpenCore, chọn mục `Reset NVRAM` để dọn sạch bộ nhớ, lúc này mục LauncherOption cũng sẽ biến mất.

## Cập nhật Bootstrap trong bản 0.6.6

Khi lên đời 0.6.6, bạn sẽ thấy file `Bootstrap.efi` Đó là vì OpenCore giờ đã là một ứng dụng UEFI thực thụ chứ không còn là một driver (trình điều khiển) nữa. Điều này có nghĩa là máy có thể nạp trực tiếp `OpenCore.efi` mà không cần "ông mồi" Bootstrap.efi nữa.

### Nếu trước đó bạn KHÔNG mở Bootstrap

Nếu Bootstrap bị vô hiệu hóa trước khi cập nhật lên phiên bản 0.6.6, bạn không cần thực hiện bất kỳ thay đổi nào, chỉ cần thay file mới vào là xong như thường lệ. Nếu sau đó bạn muốn thử `LauncherOption`, bạn có thể thử mà không gặp vấn đề gì.

### Nếu trước đó bạn CÓ mở Bootstrap

Nếu Bootstrap được mở trước khi cập nhật lên phiên bản 0.6.6 và firmware của bo mạch chủ tự động phát hiện `EFI/BOOT/BOOTx64.efi`, bạn có thể thực hiện các bước sau trước khi cập nhật:

1. Đặt `Misc -> Security -> AllowNvramReset` thành `True` và `Misc -> Security -> BootProtect` thành `None`, sau đó đặt lại NVRAM (bên ngoài hoặc trong OpenCore) và khởi động lại. Việc này giúp xóa sạch dấu vết của Bootstrap cũ.
2. Cập nhật thiết lập OpenCore như bình thường, đảm bảo bạn sao chép BOOTx64.efi từ gói OpenCore vào `EFI/BOOT/BOOTx64.efi` và đặt `Misc -> Boot -> LauncherOption` trong config.plist thành `Full` (hoặc `Short` nếu trước đó sử dụng `BootstrapShort`).
3. Khởi động lại máy tính.

Lần khởi động đầu tiên, bạn cần khởi động từ `EFI/BOOT/BOOTx64.efi`, nhưng ở những lần khởi động tiếp theo, bạn sẽ thấy mục LauncherOption được tạo bởi OpenCore khi khởi động trực tiếp từ `OpenCore.efi`.

Nếu firmware của bạn không tự động nhận diện `EFI/BOOT/BOOTx64.efi` hoặc vì bất kỳ lý do nào mà bạn không thể đặt trình khởi chạy của OpenCore vào đó, bạn có nhiều lựa chọn khác:

* Sao chép file `OpenShell.efi` vào USB, đổi tên và di chuyển đến thư mục `EFI/BOOT/BOOTx64.efi`, sau đó làm theo các bước trên, nhưng thay vì chọn `BOOTx64.efi` từ menu khởi động, hãy khởi động từ USB và chạy OpenCore trực tiếp từ đó.
* Thêm thư mục `EFI/OC/Bootstrap` và sao chép rồi đổi tên tệp BOOTx64.efi từ gói OpenCore thành `EFI/OC/Bootstrap/Bootstrap.efi`. Sau đó, sau khi cập nhật thiết lập OpenCore, hãy đặt `Misc -> Boot -> LauncherOption` thành tùy chọn phù hợp (`Full` hoặc `Short` nếu trước đó sử dụng `BootstrapShort`) và khởi động OpenCore bằng mục hiện có được tạo bởi Bootstrap. Sau lần khởi động đầu tiên, bạn sẽ thấy một mục khởi động OpenCore mới được thêm vào. Sau đó, bạn có thể đặt lại NVRAM trong OpenCore (bảo đảm giữ `LauncherOption` đang mở để không xóa mục mới) để loại bỏ mục khởi động Bootstrap cũ.

Bảng tra cứu nhanh khi chuyển đổi:

| 0.5.8 - 0.6.5 | 0.6.6+ |
| :--- | :--- |
| Misc -> Security -> BootProtect | Misc -> Boot -> LauncherOption |
| Bootstrap | Full |
| BootstrapShort | Short |
