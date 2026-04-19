# Sửa lỗi nguồn USB

Với các SMBIOS Skylake và đời mới hơn, Apple không còn cung cấp các thiết lập nguồn điện USB thông qua IOUSBHostFamily (Trình quản lý họ USB) nữa. Điều này có nghĩa là chúng ta phải "học tập" phương pháp mà máy Mac thật sử dụng và cung cấp cho macOS một thiết bị USBX. Cái này sẽ thiết lập các giá trị điện năng cho cả lúc thức và lúc ngủ cho tất cả các cổng USB của bạn, và có thể giúp "cứu" nhiều thiết bị ngốn điện cao như:

* Mics (Micro)
* DACs (Bộ giải mã âm thanh kỹ thuật số)
* Webcams (camera)
* Bluetooth Dongles (USB Bluetooth)

Các SMBIOS sau đây cần bổ sung USBX:

* iMac17,x và mới hơn
* MacPro7,1 và mới hơn
* iMacPro1,1 và mới hơn 
* Macmini8,1 và mới hơn 
* MacBook9,x và mới hơn
* MacBookAir8,x và mới hơn
* MacBookPro13,x và mới hơn

May phước là bạn có thể sử dụng một file được biên dịch sẵn cho USBX tại đây: [SSDT-USBX](https://github.com/dortania/OpenCore-Post-Install/blob/master/extra-files/SSDT-USBX.aml)
