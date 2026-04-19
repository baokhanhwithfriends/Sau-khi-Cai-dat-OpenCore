# Sửa lỗi hiển thị Thông số Pin

Nhờ có [ECEnabler.kext](https://github.com/1Revenger1/ECEnabler/releases/latest), việc chỉnh sửa ACPI không còn là bắt buộc để hiển thị phần trăm pin nữa. Nhưng nếu bạn muốn nhiều thứ hơn là chỉ xem phần trăm (ví dụ: kiểm tra số chu kỳ sạc (cycle count), nhiệt độ, hoặc máy bạn có 2 viên pin) thì bạn vẫn phải ngồi lại tạo patch ACPI – xem mấy nguồn bài viết bên dưới nhé.

* Nếu đã cài ECEnabler mà pin vẫn chưa hiện dung lượng còn lại, hãy kiểm tra lại xem bạn đã bật plugin [SMCBatteryManager](https://github.com/Acidanthera/VirtualSMC/releases/latest) của VirtualSMC trong cấu hình OpenCore chưa nha.

* Một số thiết bị như Surface 3, Surface Pro 5, Surface Book 2, và Surface Laptop (cùng các dòng Surface đời sau) sử dụng bộ điều khiển nhúng (Embedded Controllers) riêng biệt hoặc phần cứng tương đương thay vì chuẩn ACPI thông thường, nên nếu không có kext dành riêng cho dòng máy đó thì pin sẽ không bao giờ hiện được đâu.

* Một số bạn đọc sẽ nhận thấy hình như % pin đo được giữa macOS và Windows không giống nhau mà chênh nhau vài %, đây là bình thường nhé! Apple thiết kế macOS giữ % khi máy đầy 100% tương đối lâu sau đó mới sụt % pin xuống (Đối với MacBook cũng tương tự như vậy), do cách đo đó nên % pin sẽ có chênh lệch giữa Windows và macOS.

::: details Tài liệu vá lỗi hiện thông tin Pin

* Lưu ý (Note): Nếu bạn dùng kext ECEnabler, bạn không cần phải chia nhỏ các trường EC (EC fields) như mấy hướng dẫn bên dưới. Bạn cứ việc dùng tên trường trực tiếp trong DSDT thay vì qua mấy hàm tiện ích (dạng như `B1B2`, `B1B4`, `RE1B` hoặc `RECB`).

## Máy tính có 2 Pin

Vì macOS không hỗ trợ tốt các máy có 2 viên pin (do không có con MacBook nào có 2 cục pin hết), bạn buộc phải "gộp" chúng lại làm một trong ACPI.

Tham khảo tài liệu của VirtualSMC để biết cách xử lý laptop có 2 pin: [Đường link](https://github.com/acidanthera/VirtualSMC/blob/master/Docs/Dual%20Battery%20Support.md)

## Số chu kỳ sạc

Một số hãng laptop như HP có cung cấp sẵn thông tin số chu kỳ sạc. Tuy nhiên, vi chương trình của họ hoặc là không triển khai phần này, hoặc là giấu nó đi không cho phương thức `_BIX` có trong ACPI để hệ điều hành truy cập. In the past, Trước đây, ACPIBatteryManager của Rehabman có dùng một cái "mẹo" (hack) phương thức `_BIX` để hỗ trợ, nhưng với SMCBatteryManager thì cái mẹo này không còn xài được nữa.

Tham khảo tài liệu VirtualSMC để biết cách chuyển từ cái mẹo cũ sang cách triển khai phương thức `_BIX` chuẩn chỉnh: [Link](https://github.com/acidanthera/VirtualSMC/blob/master/Docs/Transition%20from%20zprood%27s%20cycle%20count%20hack.md)

Tài liệu này cũng rất hữu ích cho mấy anh em lần đầu vọc vạch làm số chu kỳ sạc luôn.

## Thông tin Pin bổ sung

Mặc dù nhiều laptop có cung cấp thêm thông tin (như ngày sản xuất, nhiệt độ pin) trong các trường EC, nhưng các phương thức ACPI truyền thống như `_BIF`, `_BIX` và `_BST` lại không hỗ trợ gửi mấy gói tin này qua. Vì vậy, SMCBatteryManager hỗ trợ thêm 2 phương thức là `CBIS` và `CBSS` để đưa thông tin này vào macOS.

Tham khảo tài liệu VirtualSMC về cách triển khai các phương thức này tại đây: [Đường link](https://github.com/acidanthera/VirtualSMC/blob/master/Docs/Battery%20Information%20Supplement.md)

:::

::: details Tài liệu vá kiểu cũ

* Lưu ý (Note): Các hướng dẫn của Rehabman bảo dùng ACPIBatteryManager, nhưng bạn phải dùng SMCBatteryManager thay thế nhé.

## Bản vá DSDT

Mặc dù việc nạp file DSDT tùy chỉnh nên hạn chế để tránh gây lỗi cho Windows hoặc khi cập nhật firmware, nhưng nó là điểm khởi đầu rất tốt vì khá dễ hiểu và dễ tự làm:

**[Rehabman's how to patch DSDT for working battery status](https://www.tonymacx86.com/threads/guide-how-to-patch-dsdt-for-working-battery-status.116102/)**

* Lưu ý (Note): Khi nạp lại DSDT, nó phải nằm ở vị trí đầu tiên trong danh sách ACPI -> Add của file config.plist. Và nhớ là file DSDT đã vá phải được bỏ vào thư mục EFI/OC/ACPI nữa nha.

* Lưu ý 2 (Note 2): Tránh dùng bản MaciASL và iASL của Rehabman vì tụi nó "cổ lai hy" lắm rồi, bỏ lâu không ai ngó ngàng tới. Bạn nên lấy bản mới của Acidanthera tại đây: [MaciASL](https://github.com/acidanthera/MaciASL/releases)

## Vá nóng Pin

Sau khi bạn đã vá DSDT và thấy pin hiện lên ngon lành trong macOS, giờ là lúc nâng cấp lên "vá nóng" (hot-patch). Khác với vá DSDT thông thường, vá nóng sẽ diễn ra ngay lúc máy đang chạy, giúp bạn thoải mái cập nhật firmware mà không lo bị lỗi:

**[Rehabman's Guide to Using Clover to "hotpatch" ACPI](https://www.tonymacx86.com/threads/guide-using-clover-to-hotpatch-acpi.200137/)**

* Lưu ý (Note): Cụ thể là ở bài viết số #2 sẽ nói về vá nóng cho pin.

:::
