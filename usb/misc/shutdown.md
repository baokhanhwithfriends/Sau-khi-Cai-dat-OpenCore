# Sửa lỗi Tắt máy/Khởi động lại

Một cái tật kỳ quặc mà bạn có thể gặp trên macOS là khi bạn bấm Shutdown (Tắt máy), cái PC của bạn lại tự động Restart (Khởi động lại). Nguyên nhân sâu xa là do thiếu một lệnh gọi S5 để ngắt điện bộ điều khiển (controller). Dĩ nhiên là Windows và Linux có cài mấy cái mánh (hacks) để lách qua vụ này nhưng macOS thì "thanh cao" không có mấy bản sửa lỗi đó, thay vào đó chúng ta phải tự lăn xả làm việc chân tay (dirty work) và sửa lại mã ACPI của họ. Đừng lo, cái này không gây hại cho các hệ điều hành khác đâu.

Để sửa cái này chúng ta cần mấy món sau:

* [FixShutdown-USB-SSDT.dsl](https://github.com/dortania/OpenCore-Post-Install/blob/master/extra-files/FixShutdown-USB-SSDT.dsl)
* [_PTS to ZPTS Patch](https://github.com/dortania/OpenCore-Post-Install/blob/master/extra-files/FixShutdown-Patch.plist)
* Đường dẫn ACPI của Bộ điều khiển USB

Để tìm xem Bộ điều khiển USB nào cần sửa, hãy tìm từ khóa `_PRW` trong DSDT của bạn và xem Device (Thiết bị) nào được nhắc đến trong đó, thường thì nó sẽ có dạng như `SB.PCI0.XHC`.

Có được đường dẫn ACPI rồi, hãy chỉnh sửa file FixShutdown-USB-SSDT.dsl và biên dịch (compile) nó thành file .aml (Assembled - Đã lắp ráp). [MaciASL có thể giúp bạn vụ này](https://dortania.github.io/Getting-Started-With-ACPI/Manual/compile.html)
