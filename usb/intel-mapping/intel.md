# Lập bản đồ cổng USB cho máy Intel

### Hướng dẫn này đã cũ, đọc [README của USBMap](https://github.com/corpnewt/USBMap)   để biết thông tin cập nhật cho đến khi hướng dẫn này được viết lại

Mục lục:

* [Lập sơ đồ USB cho máy Intel](#Intel-usb-mapping)

Vậy là xong mấy cái thủ tục rườm rà, giờ chúng ta có thể đi vào phần chính. Và giờ là lúc chúng ta được đọc một trong những cuốn sách gối đầu giường yêu thích của tui trước khi đi ngủ: [Thông số kỹ thuật Giao diện nguồn và cấu hình nâng cao (ACPI)!](https://uefi.org/specs/ACPI/6.4/)

Nếu bạn chưa từng đọc qua cái này (mình cực lực khuyên bạn nên đọc, nó là một câu chuyện ly kỳ hấp dẫn đó), mình sẽ chỉ cho bạn phần cốt lõi của vấn đề cổng USB:

* Mục 9.14: _UPC (Khả năng của cổng USB)

Ở đây chúng ta được chào đón bởi tất cả các loại cổng USB có thể có trong ACPI:

| Type (Loại chân cắm) | Info (Thông tin) | Comments (Ghi chú) |
| :--- | :--- | :--- |
| 0 | USB 2.0 Type-A connector (Chân cắm kết nối chuẩn USB 2.0 loại A) | Đây là loại chân cắm mà macOS sẽ mặc định gán cho tất cả các cổng khi không có sơ đồ USB nào được nạp |
| 3 | USB 3.0 Type-A connector (Chân cắm kết nối chuẩn USB 3.0 loại A) | Cổng 3.0, 3.1 và 3.2 đều xài chung loại này |
| 8 | Type C connector - USB 2.0-only (Chân cắm kết nối USB 2.0 loại USB-C) | Thường thấy trên điện thoại
| 9 | Type C connector - USB 2.0 and USB 3.0 with Switch (Chân cắm kết nối USB 2.0 và 3.0 loại USB-C, hỗ trợ xoay ngược) | Xoay ngược thiết bị rồi cắm **không làm** thay đổi loại cổng được khai báo trong ACPI |
| 10 | Type C connector - USB 2.0 and USB 3.0 without Switch (Chân cắm kết nối USB 2.0 và 3.0 loại USB-C, không hỗ trợ xoay ngược) | Xoay ngược thiết bị rồi cắm **có làm** thay đổi loại cổng được khai báo trong ACPI, thường thấy trên các header 3.1/2 của bo mạch chủ |
| 255 | Proprietary connector (Chân cắm độc quyền) | Dành cho các cổng USB nội bộ (tức là không có cổng cắm vật lý cho người dùng cắm mà chỉ là chân kết nối + sử dụng giao thức kết nối USB) như Bluetooth, webcam của laptop v.v |

### Lập sơ đồ USB cho máy Intel

Việc lập sơ đồ USB trên Intel dễ ợt, chủ yếu là do ACPI của nó "tỉnh táo" hơn và có nhiều công cụ hỗ trợ cho nền tảng này hơn. Trong hướng dẫn này, chúng ta sẽ xài [công cụ USBmap](https://github.com/corpnewt/USBMap) đến từ thánh CorpNewt.

Giờ mở USBmap.command lên và chọn `D.  Discover Ports`:

![](../../images/post-install/usb-md/usb-map-start.png)
![](../../images/post-install/usb-md/mapping.png)

Giao diện của USBmap khá đơn giản và dễ hiểu nên mình sẽ không đi sâu vào chi tiết ở đây, file [README.md](https://github.com/corpnewt/USBMap) là đủ cho bạn rồi. Ý tưởng cơ bản là cắm một thiết bị vào, đặt cho nó cái tên để nhớ cổng đó là cổng nào, rút ra rồi thử cổng khác cho đến khi bạn có một danh sách đầy đủ các cổng bạn muốn giữ lại.

* **Lưu ý**: Mấy cái cổng USRx(VD: USR1, USR2) không phải là cổng USB thật, chúng cụ thể là [cổng USBR](https://software.Intel.com/content/www/us/en/develop/documentation/amt-developer-guide/top/storage-redirection.html) mà macOS không hỗ trợ (và đó là lý do máy Mac thiệt không có cái này). Mấy cái này có thể loại bỏ khỏi bản đồ USB của bạn.

Khi bạn đã cắm hết tất cả các cổng USB trên máy của mình, chọn `Press Q then [enter] to stop` (Nhấn Q rồi Enter để dừng) sau đó vào mục `P.  Edit Plist & Create SSDT/Kext` (Chỉnh sửa Plist & Tạo SSDT/Kext) từ menu chính.

Trong ví dụ này, tui sẽ chọn tất cả các cổng đã tìm thấy, nhớ là có cái giới hạn 15 cổng nha nên bạn **không thể** vượt quá nó đâu. USB Hub sẽ được tính là một cổng USB nên bạn có thể mở rộng từ đó nếu bị hạn chế cổng.

![](../../images/post-install/usb-md/255.png)

```text
T:1,3,4,5,6,7,16,17,19,21,22:3
```

Dòng trên sẽ thiết lập tất cả các cổng được liệt kê thành loại 3, tức là USB 3.0.

```text
T:9:255
```

Dòng này sẽ thiết lập Bluetooth của mình thành internal (nội bộ), cái này cực kỳ quan trọng vì macOS mong muốn Bluetooth luôn là thiết bị nội bộ.

![](../../images/post-install/usb-md/build-map.png)

Giờ chúng ta có thể chọn `K. Build USBMap.kext` và để nó tự tạo kext cho chúng ta.

**Lưu ý**: Đừng sử dụng SSDT-UIAC.aml **hoặc** USBInjectAll chung với USBmap.kext. Cái kext chúng ta vừa tạo nên chỉ xài mình nó, không nên kèm theo kext USB nào khác ngoại trừ XhciUnsupported nếu máy của bạn cần. Lý do là USBInjectAll không còn được cập nhật mới nữa và phiên bản USBmap.kext này hoạt động giống cách máy Mac thật nạp sơ đồ USB, nên nó "chuẩn Apple" nhất có thể để khớp với phong cách OpenCore hoạt động.

Giờ khởi động lại và chạy USBmap lần nữa, bạn sẽ thấy danh sách cổng trong sơ đồ chúng ta vừa tạo gọn gàng hơn nhiều:

![](../../images/post-install/usb-md/usb-done.png)
