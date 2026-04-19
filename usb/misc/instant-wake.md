# Sửa lỗi máy tự dậy ngay lập tức khi mới vô chế độ ngủ (lệnh gọi GPRW/UPRW/LANC)

Ý tưởng cũng na ná phần "Sửa lỗi Tắt máy/Khởi động lại", macOS sẽ tự dậy ngay lập tức (instant wake) nếu trạng thái USB hoặc nguồn điện thay đổi trong khi đang ngủ. Để trị bệnh này, chúng ta cần chuyển hướng (reroute) các lệnh gọi GPRW/UPRW/LANC sang một SSDT mới. Nhớ kiểm tra xem bạn có bị lỗi máy tự bật dậy không trước khi thử mấy chiêu dưới đây nhé.

Cách kiểm tra chuẩn nhất là dùng lệnh này:

```sh
pmset -g log | grep -e "Sleep.*due to" -e "Wake.*due to"
```

Và thường thì bạn sẽ nhận được kết quả kiểu như này:

* `Wake [CDNVA] due to GLAN: Using AC`
  * Thường do đang mở tính năng WakeOnLAN (Đánh thức qua mạng LAN), thử tắt tùy chọn này trong BIOS trước xem có hết bệnh không.
  * Nếu WOL (Wake On Lan) không phải vấn đề, bạn thử mấy bản vá bên dưới.
* `Wake [CDNVA] due to HDEF: Using AC`
  * Na ná cái lỗi GLAN ở trên.
* `Wake [CDNVA] due to XHC: Using AC`
  * Thường do đang mở WakeOnUSB (Đánh thức qua USB), thử tắt trong BIOS trước.
  * Khả năng cao là cần bản vá GPRW.
* `DarkWake from Normal Sleep [CDNPB] : due to RTC/Maintenance Using AC`
  * Thường do tính năng PowerNap gây ra.
* `Wake reason: RTC (Alarm)`
  * Thường do một ứng dụng nào đó đánh thức hệ thống, tắt ứng dụng đó trước khi cho máy ngủ là xong.

**Đừng có tham mà nhét hết mấy bản vá này cùng lúc nha**, phải soi cái DSDT của bạn xem bạn đang sử dụng lệnh gọi nào đã:

| SSDT | ACPI Patch (Bản vá ACPI) | Comments (Ghi chú) |
| :--- | :--- | :--- |
| [SSDT-GPRW](https://github.com/dortania/OpenCore-Post-Install/blob/master/extra-files/SSDT-GPRW.aml) | [GPRW to XPRW Patch](https://github.com/dortania/OpenCore-Post-Install/blob/master/extra-files/GPRW-Patch.plist) | Xài bản vá này nếu bạn tìm thấy lệnh gọi `Method (GPRW, 2` trong bảng ACPI  |
| [SSDT-UPRW](https://github.com/dortania/OpenCore-Post-Install/blob/master/extra-files/SSDT-UPRW.aml) | [UPRW to XPRW Patch](https://github.com/dortania/OpenCore-Post-Install/blob/master/extra-files/UPRW-Patch.plist) | Xài bản vá này nếu bạn tìm thấy lệnh gọi `Method (UPRW, 2` trong bảng ACPI |
| [SSDT-LANC](https://github.com/dortania/OpenCore-Post-Install/blob/master/extra-files/SSDT-LANC.aml) | [LANC to XPRW Patch](https://github.com/dortania/OpenCore-Post-Install/blob/master/extra-files/LANC-Patch.plist) | Xài bản vá này nếu bạn tìm thấy lệnh gọi `Device (LANC)` trong bảng ACPI |

Các bản vá ACPI và SSDT được cung cấp bởi các đại hiệp [Rehabman](https://www.tonymacx86.com/threads/guide-using-clover-to-hotpatch-acpi.200137/), [1Revenger1](https://github.com/1Revenger1) và [Fewtarius](https://github.com/dortania/laptop-guide)
