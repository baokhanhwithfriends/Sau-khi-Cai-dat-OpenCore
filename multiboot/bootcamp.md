# Cài đặt và sử dụng công cụ BootCamp

Một tính năng cực hay của OpenCore là giúp chúng ta né luôn cái BIOS rắc rối và chỉ dùng mục Startup Disk (Ổ đĩa khởi động) trong System Preferences để chọn hệ điều hành. Ngặt nỗi là khi boot qua Windows, mình hổng có cách nào để chọn boot ngược lại macOS một cách dễ dàng. Đó là lúc bộ công cụ BootCamp của Apple tỏa sáng.

* Lưu ý: Hướng dẫn này chỉ nói về việc cài driver BootCamp, không hướng dẫn cách tạo bộ cài Windows nha.
  * Ví dụ cách tạo bộ cài Windows: [Build a Bootable Windows ISO](https://www.freecodecamp.org/news/how-make-a-windows-10-usb-using-your-mac-build-a-bootable-iso-from-your-macs-terminal/)
  * Nhắc nhẹ: Windows **BẮT BUỘC** phải cài trên ổ đĩa định dạng GPT/GUID, OpenCore hổng chơi với mấy bản cài kiểu cũ (Legacy/MBR) đâu.
* Lưu ý 2: Nếu bạn dùng công cụ BootCamp từ phía macOS, nó có thể xóa file EFI/BOOT/BOOTx64.efi của bạn (file này cần để boot OpenCore). Mà OpenCore cũng hổng ưa MBR nên công cụ đó coi như vô dụng với mình.

## Chuẩn bị

Trước khi bắt tay vào làm, mình cần:

* Windows đã được cài đặt
  * BẮT BUỘC phải cài theo chuẩn UEFI/GPT
* [Công cụ Brigadier](https://github.com/corpnewt/brigadier)
  * Để tải driver BootCamp chính chủ từ Apple
* Thiết lập [LauncherOption](../multiboot/bootstrap.md)
  * Không bắt buộc nhưng có nó sẽ đỡ đau đầu nếu Windows ngu ngục lỡ tay xóa file boot của OpenCore.

## Tiến hành cài đặt

Cài cái này dễ lắm, bạn tải [Brigadier](https://github.com/corpnewt/brigadier) về. Nếu đang ở Windows thì chạy file `Brigadier.bat` trên Windows hoặc chạy `Brigadier.command` nếu đang sử dụng macOS. Nếu máy bạn đang giả lập dòng Mac (SMBIOS) mà gặp lỗi BootCamp, hoặc bạn muốn tải driver cho dòng Mac khác, chỉ cần thêm lệnh `--  model{SMBIOS}` vào đoạn cuối tên chươgn trình:

```sh
đường/dẫn/tới/Brigadier --model MacPro7,1
```

* **Lưu ý**: Mấy bản BootCamp cũ (bản 6.0) hổng có hỗ trợ định dạng APFS của Mac đâu, bạn cần chọn một phiên bản SMBIOS mới hơn có tích hợp sẵn tính năng này (ví dụ: iMac 19,1) hoặc sau khi cài đặt, hãy cập nhật phần mềm Bootcamp bằng Apple Software Update được cài sẵn. Xem bên dưới để biết thêm chi tiết về cách khắc phục sự cố: [Startup Disk (Trình chọn ổ đĩa khởi động trên Windows) không tìm thấy ổ đĩa APFS](#windows-startup-disk-cant-see-apfs-drives)

![](../images/bootcamp-md/extension.png)

Tải xong bạn sẽ thấy driver nằm ở:

* Windows:

```sh
\Users\{Tên_Người_Dùng}\bootcamp-{tên_file}\BootCamp
```

* macOS:

```sh
/Users/{Tên_Người_Dùng}/BootCamp-{tên_file}/WindowsSupport.dmg
```

Bạn đọc đang xài macOS để tải nhớ mở file .dmg này ra rồi chép thư mục bên trong vào chỗ nào mà Windows có thể đọc được nhé.

![](../images/bootcamp-md/done.png)

Tiếp theo, vào Windows rồi thì có 2 cách cài:

Cách 1: Vào thư mục `bootcamp-{tên_file}\BootCamp` và chạy file `Setup.exe`, cách này yêu cầu bạn phải giả lập đúng tên dòng máy (SystemProductName) thì nó mới cho cài.

![](../images/bootcamp-md/location.png)

Cách 2: Chạy file `bootcamp-{tên_file}\BootCamp\Drivers\Apple\BootCamp.msi` bằng quyền Quản trị (Administrator). Cách này "lách luật" cực hay vì nó bỏ qua bước kiểm tra dòng máy luôn.

![](../images/bootcamp-md/location_msi.png)

Cài xong là bạn có thể đổi hệ điều hành qua lại ngon lành! Sẽ có một icon BootCamp nhỏ xíu dưới thanh taskbar để bạn chọn ổ đĩa muốn boot vào lần tới.

* Lưu ý: Đối với những người không cần các trình điều khiển bổ sung mà BootCamp cung cấp, bạn có thể xóa những mục sau:
  * `$WinPEDriver$`: **KHÔNG ĐƯỢC** xóa thư mục gốc, chỉ xóa các trình điều khiển bên trong.
    * Bạn đọc xài card Wi-Fi tháo máy của Apple nên giữ lại những thứ sau:
      * `$WinPEDriver$/BroadcomWireless`
      * `$WinPEDriver$/BroadcomBluetooth`
      * `$WinPEDriver$/AppleBluetoothBroadcom`
  * `BootCamp/Drivers/...`
    * **KHÔNG ĐƯỢC** xoá `BootCamp/Drivers/Apple`
    * Bạn đọc xài card Wi-Fi tháo máy của Apple nên giữ lại cái này (nếu có):
      * `BootCamp/Drivers/Broadcom/BroadcomBluetooth`

## Xử lý sự cố

* [Không tìm thấy ổ đĩa Windows/BootCamp trong bảng chọn hệ điều hành](#khong-tim-thay-o-đia-windows-bootcamp-trong-bang-chon-he-đieu-hanh)
* [Lỗi "You can't change the startup disk to the selected disk" (Lỗi không đổi được ổ đĩa khởi động)](#loi-you-can-t-change-the-startup-disk-to-the-selected-disk-loi-khong-đoi-đuoc-o-đia-khoi-đong)
* [Booting Windows results in BlueScreen or Linux crashes](#booting-windows-results-in-bluescreen-or-Linux-crashes)
* [Booting Windows error: `OCB: StartImage failed - Already started`](#booting-windows-error-ocb-startimage-failed---already-started)
* [Windows Startup Disk can't see APFS drives](#windows-startup-disk-cant-see-apfs-drives)

## Không tìm thấy ổ đĩa Windows/BootCamp trong bảng chọn hệ điều hành

Nhắc lại lần nữa: OpenCore chỉ chơi với Windows chuẩn UEFI. Mấy cái bản Windows được cài bằng BootCamp Assistant trên Mac xịn thường được cài theo chuẩn cũ (Legacy), nên bạn phải tự tạo bộ cài UEFI (cứ Google là ra cả đống nha). Ngoài ra, định dạng ổ đĩa Master Boot Record (MBR) hay Hybrid (GPT lai MBR) cũng hỏng dùng được, bạn nên xài Disk Utility để format ổ đĩa theo chuẩn đồng nhất.

Để xử lý:

* Bảo đảm `Misc -> Security -> ScanPolicy` đã được đặt là `0` để cho phép hiển thị tất cả ổ đĩa trên máy có hệ điều hành

Nếu Windows và OpenCore nằm chung một ổ cứng, bạn có thể phải cần thêm dòng này vào

```
Misc -> BlessOverride -> \EFI\Microsoft\Boot\bootmgfw.efi
```

* **Lưu ý**: Từ bản 0.5.9 trở đi thì OpenCore tự nhận được rồi, hổng cần lo.

![](../images/win-md/blessoverride.png)

## Lỗi "You can't change the startup disk to the selected disk" (Lỗi không đổi được ổ đĩa khởi động)

Lỗi này thường do một số nguyên nhân sau:

* Bạn đang xài mấy trình đọc ghi NTFS bên thứ ba (như Paragon). 
* Cấu trúc phân vùng ổ Windows bị "lạ" so với tiêu chuẩn mà macOS muốn, ví dụ phân vùng EFI hổng nằm ở đầu tiên.

Để khắc phục sự cố thứ nhất, thử vô hiệu hóa hoặc gỡ cài đặt luôn mấy cái công cụ này.

Để khắc phục sự cố thứ hai, chúng ta cần kích hoạt cái cài đặt nâng cao sau:

* `PlatformInfo -> Generic -> AdviseFeatures -> True`

![](../images/bootcamp-md/error.png)

## Khởi động Windows gặp lỗi màn hình xanh chết chóc hoặc lỗi khi khởi động Linux.

Cái này thường do lỗi căn chỉnh bộ nhớ. Hãy chắc chắn là bạn đã mở `SyncRuntimePermissions` trên các dòng máy hỗ trợ bảng MAT. Kiểm tra nhật ký hệ thống xem phần mềm của bạn có hỗ trợ Bảng thuộc tính bộ nhớ (Memory Attribute Tables) hay không (thường là máy được sản xuất từ 2018 trở đi).

Với mainboard dòng Z390 trở lên, mở thêm `ProtectUefiServices` để bảo đảm các bản vá của OpenCore được áp dụng chuẩn xác

Nếu máy quá cũ (từ 2013 về trước), hãy thử mở `ProtectMemoryRegions`.

Mỗi hãng mainboard mỗi kiểu nên bạn cứ thử kết hợp 3 cái "quirk" này xem cái nào hợp với máy mình nhất hén.

Mã lỗi Windows thường gặp:

* `0xc000000d`

## Lỗi khi khởi động Windows: `OCB: StartImage failed - Already started`

Cái này là do OpenCore bị nhầm lẫn khi cố gắng khởi động Windows và vô tình nghĩ rằng nó đang khởi động OpenCore (trong khi đã chạy rồi mà!). Có thể tránh cái lỗi ngớ ngẩn này bằng cách di chuyển Windows sang ổ đĩa riêng *hoặc* bổ sung thêm đường dẫn ổ đĩa tùy chỉnh trong BlessOverride. Xem [Configuration.pdf](https://github.com/acidanthera/OpenCorePkg/blob/master/Docs/Configuration.pdf) và tham khảo mục [Không tìm thấy ổ đĩa Windows/BootCamp trong bảng chọn hệ điều hành](#khong-tim-thay-o-đia-windows-bootcamp-trong-bang-chon-he-đieu-hanh) để biết thêm chi tiết.

## Startup Disk của Boot Camp trên Windows không tìm thấy ổ đĩa APFS

* Trình điều khiển BootCamp đã lỗi thời (thường phiên bản 6.0 sẽ đi kèm với brigadier, tiện ích BootCamp trong macOS cung cấp phiên bản mới hơn như 6.1). Bạn có thể thử khắc phục sự cố này bằng cách cập nhật lên phiên bản mới nhất bằng trình cập nhật phần mềm của Apple (Apple Software Update) hoặc chọn SMBIOS mới hơn từ brigadier (ví dụ: `--model iMac19,1`) khi chạy brigadier.

Đối với trường hợp thứ hai, bạn cần chạy lệnh sau (thay thế `filename.msi` bằng tệp cài đặt BootCamp có đuôi msi):

```sh
msiexec.exe /x "c:\filename.msi"
```
