# Vá chuẩn kết nối màn hình

* Hình ảnh và thông tin dựa trên bài viết [Hướng dẫn Hackintosh Vanilla của CorpNewt](https://hackintosh.gitbook.io/-r-hackintosh-vanilla-desktop-guide/config.plist-per-hardware/coffee-lake#pink-purple-tint)

Phần này dành cho các dân chơi Hackintosh bị lỗi màn hình đen thui hoặc màu sắc hiển thị sai bét nhè (thường là cổng HDMI). Nguyên nhân là do driver Apple được lập trình để nạp cấu hình chuẩn kết nối màn hình theo ý họ lên trên phần cứng của bạn (VD: màn hình của bạn có chuẩn kết nối HDMI nhưng macOS nạp cấu hình DisplayPort gây ra lỗi). Để xử lý, chúng ta sẽ vá lại các loại kết nối (connector types) của Apple để nó "tôn trọng" phần cứng của chúng ta hơn.

Ví dụ, hãy lấy một cái máy tính xài UHD 630 đang cắm màn hình HDMI. Máy đã cài đặt ngon lành cành đào nhưng màn hình HDMI đang bị ám màu hồng mộng mơ hoặc tím lịm tìm sim (Pink/Purple tint).

Giờ chúng ta cần lôi cổ cái [IOReg](https://github.com/khronokernel/IORegistryClone/blob/master/ioreg-302.zip) và tìm mục `iGPU`:

![](../../images/gpu-patching/igpu-entry.png)

Tiếp theo, xóa cái khung tìm kiếm đi để chúng ta có thể thấy các mục con (children) của thiết bị iGPU:

![](../../images/gpu-patching/igpu-children.png)

Như bạn thấy trong hình trên, chúng ta có vài mục framebuffer được liệt kê. Đây đều là các "nhân cách" hiển thị (display personalities) có trong framebuffer, và mỗi cái có cài đặt riêng.

Với chúng ta, cái cần quan tâm là phần nào có mục con là `display0` vì đây chính là thứ đang "điều khiển" trực tiếp cái màn hình vật lý. Trong ví dụ này, chúng ta thấy nó là `AppleIntelFramebuffer@1`. Khi chọn vào nó, bạn nhìn sang khung bên trái sẽ thấy thuộc tính  `connector-type` có giá trị là `<00 04 00 00>`. Và khi chúng ta đối chiếu với danh sách bên dưới:

```
<02 00 00 00>        LVDS và eDP       - Màn hình Laptop
<10 00 00 00>        VGA               - Không còn hỗ trợ chính thức trên bản 10.8 trở đi
<00 04 00 00>        DisplayPort       - Cổng xuất hình USB-C thực chất là giao thức DP
<01 00 00 00>        DUMMY             - Sử dụng khi không có cổng vật lý được cắm vô
<00 08 00 00>        HDMI
<80 00 00 00>        S-Video
<04 00 00 00>        DVI (Dual Link)
<00 02 00 00>        DVI (Single Link)
```

* Lưu ý: Cổng VGA trên máy tính đời Skylake và mới hơn thực chất có giao thức bên trong là DisplayPort thay vì VGA nên macOS vẫn hỗ trợ. Bạn vui lòng dùng loại kết nối DisplayPort cho mấy cái máy tính có cổng này.

Soi kỹ hơn chút, chúng ta thấy cổng HDMI thực tế đang được liệt kê là DisplayPort (trớt quớt). Đây chính là lúc cơ chế vá lỗi của WhateverGreen tỏa sáng.

Vì cái cổng đang bị nhận diện sai chuẩn kết nối nằm ở AppleIntelFramebuffer@1, nên đây là port 1 (cổng số 1). Tiếp theo chúng ta sẽ bật cơ chế vá lỗi của WhateverGreen cho con1 và sau đó set loại kết nối thành HDMI. Để làm điều này, chúng ta thiết lập các Thuộc tính sau dưới mục `DeviceProperties -> Add -> PciRoot(0x0)/Pci(0x2,0x0)`:

* `framebuffer-patch-enable = 01000000`
  * Kích hoạt cơ chế vá lỗi của WhateverGreen.
* `framebuffer-conX-enable = 01000000`
  * Kích hoạt cơ chế vá lỗi của WhateverGreen trên cổng conX. X là thứ tự của cổng.
* `framebuffer-conX-type = 00080000`
  * Chuyển cổng đó thành HDMI (`<00 08 00 00>`). Nếu máy của bạn là chuẩn kết nối khác thì bạn đổi cặp byte ở trên thành cái tương ứng với cổng kết nối màn hình trên máy tính của bạn

Lưu ý: Nhớ thay thế `conX` trong cả hai bản vá thành `con1` để phản ánh đúng cái cổng chúng ta muốn sửa, sau đó điền giá trị như liệt kê ở trên.

![](../../images/gpu-patching/connector-type-patch.png)
