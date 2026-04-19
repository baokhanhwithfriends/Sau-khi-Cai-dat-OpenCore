# Chuyển OpenCore từ USB sang ổ cứng macOS

## Trích xuất OpenCore từ USB

Để bắt đầu, việc đầu tiên là chúng ta phải "lôi" OpenCore từ bộ cài USB ra đã. Để làm việc này, chúng ta sẽ sử dụng một công cụ nhỏ nhưng có võ của thánh CorpNewt có tên là [MountEFI](https://github.com/corpnewt/MountEFI)

Trong ví dụ này, cứ giả dụ cái USB của bạn tên là `Install macOS Catalina`:

![](../images/post-install/oc2hdd-md/usb-mount.png)

Một khi cái EFI đã được mount (gắn kết), chúng ta sẽ sao chép lấy thư mục EFI trong đó và dán vào một chỗ an toàn (ví dụ như Desktop). Sau đó, chúng ta cần **ngắt kết nối phân vùng EFI của USB** ngay và luôn, vì để nhiều cái phân vùng EFI mount cùng lúc có thể làm macOS bị "ngáo" đó, tốt nhất là mỗi lần chỉ mount 1 cái EFI thôi (bạn chỉ cần eject cái phân vùng EFI của USB thôi, cái USB thì cứ cắm đó cũng được).

**Lưu ý**: Các bộ cài được tạo bằng MakeInstall.bat của gibMacOS trên Windows sẽ mặc định sử dụng partition map (bảng phân vùng) chuẩn Master Boot Record (MBR), có nghĩa là nó không có phân vùng EFI riêng đâu, mà thay vào đó là phân vùng `BOOT` sẽ tự động mount (gắn) mặc định trong macOS.

![](../images/post-install/oc2hdd-md/hdd-mount.png)

Xong xuôi vụ đó rồi, giờ mount cái ổ cứng macOS của chúng ta lên. Với macOS Catalina, macOS thực ra được chia làm 2 volume (ổ đĩa): System Partition (Phân vùng hệ thống) và User Partition (Phân vùng người dùng). Cái này có nghĩa là MountEFI có thể báo cáo nhiều ổ đĩa trong danh sách chọn, nhưng mỗi phân vùng đó vẫn xài chung một cái EFI thôi (Chuẩn UEFI quy định chỉ được phép có 1 phân vùng EFI trên mỗi ổ cứng vật lý). Bạn có thể nhận biết nó có cùng ổ cứng không thông qua cái mã disk**X**sY (Y chỉ là số thứ tự phân vùng thôi, quan trọng là cái X).

![](../images/post-install/oc2hdd-md/hdd-clean.png)

Khi bạn mount (gắn) cái EFI của ổ cứng chính, bạn có thể sẽ được chào đón bằng một thư mục tên là `APPLE`, cái này sử dụng để cập nhật firmware (phần mềm điều khiển) trên máy Mac thật nhưng không có tác dụng gì với phần cứng của chúng ta cả. Bạn cứ thẳng tay xóa sạch sành sanh mọi thứ trên phân vùng EFI đó và thay thế bằng cái thư mục EFI bạn vừa copy được từ USB lúc nãy.

## Lưu ý đặc biệt cho bạn đọc sử dụng máy tính chuẩn Legacy

Khi chuyển nhà cho EFI của bạn, vẫn còn mấy cái boot sectors (sector khởi động) cần phải ghi vào ổ cứng thì cái BIOS non-UEFI (BIOS đời cũ) của bạn mới tìm thấy nó và khởi động được. Nên là đừng quên chạy lại cái [`BootInstallARCH.tool`](https://dortania.github.io/OpenCore-Install-Guide/installer-guide/mac-install.html#legacy-setup) trên ổ cứng macOS của bạn nhé.
