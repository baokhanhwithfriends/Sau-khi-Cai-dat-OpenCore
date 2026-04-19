# Vá lỗi card đồ họa (cơ bản)

Cái mục nhỏ xíu này dành cho mấy bác cần nhiều "thuốc" hơn là mấy bản vá framebuffer (bộ đệm khung hình) đơn giản và mấy cái tự động của WhateverGreen:

* [Chuyển đổi ID giả mạo từ Clover sang OpenCore](https://baokhanhwithfriends.github.io/Khoi-dau-voi-ACPI/Universal/spoof.html)
* [Vá lỗi BusID cho iGPU đời mainboard 300 series](#iGPU-BusID-Patching)

## Chuyển đổi ID giả mạo từ Clover sang OpenCore

Hướng dẫn đã chuyển nhà sang đây: [Đổi tên đường dẫn GPU](https://baokhanhwithfriends.github.io/Khoi-dau-voi-ACPI/Universal/spoof.html)

## Vá lỗi BusID cho iGPU

Phần này dành riêng cho mấy bạn đang sử dụng bo mạch chủ 300 series "hàng thiệt" (B360, B365, H310, H370, Z390) mà đang vật vã với việc cài đặt iGPU để xuất hình ra màn hình.

Để bắt đầu, mình đoán là các bạn đã làm xong mấy cái vá framebuffer cơ bản trong config theo [Phần Coffee Lake của hướng dẫn](https://dortania.github.io/OpenCore-Install-Guide/config.plist/coffee-lake.html) rồi nhé, trông nó sẽ na ná như thế này:

![](../images/extras/gpu-patches-md/prereq.png)

* **Lưu ý**: Với macOS 10.15.5, có vẻ như dân tình gặp khá nhiều lỗi màn hình đen khi xài `07009B3E`, nếu bạn cũng dính chấu thì thử đổi sang `00009B3E` xem sao.

Giờ thì súng đạn đã sẵn sàng, chúng ta bắt đầu soi vào việc vá busID. Kiểm tra các bản dump (kết xuất dữ liệu) tại [kho lưu trữ chính thức của WhateverGreen](https://github.com/acidanthera/WhateverGreen/blob/master/Manual/FAQ.IntelHD.en.md) cho ta thấy thông tin của ID `3E9B0007` (Máy bàn sử dụng UHD 630):

```
ID: 3E9B0007, STOLEN: 57 MB, FBMEM: 0 bytes, VRAM: 1536 MB, Flags: 0x00801302
TOTAL STOLEN: 58 MB, TOTAL CURSOR: 1 MB (1572864 bytes), MAX STOLEN: 172 MB, MAX OVERALL: 173 MB (181940224 bytes)
GPU Name: Intel UHD Graphics 630
Model Name(s):
Camelia: Disabled
Mobile: 0, PipeCount: 3, PortCount: 3, FBMemoryCount: 3
[1] busId: 0x05, pipe: 9, type: 0x00000400, flags: 0x000003C7 - DP
[2] busId: 0x04, pipe: 10, type: 0x00000400, flags: 0x000003C7 - DP
[3] busId: 0x06, pipe: 8, type: 0x00000400, flags: 0x000003C7 - DP
01050900 00040000 C7030000
02040A00 00040000 C7030000
03060800 00040000 C7030000
```

Nhìn cái đống ở trên chắc muốn trầm cảm luôn, nhưng tụi mình sẽ xé nhỏ nó ra cho dễ nuốt. Cái chúng ta quan tâm là chỗ này nè:

```
[1] busId: 0x05, pipe: 9, type: 0x00000400, flags: 0x000003C7 - DP
[2] busId: 0x04, pipe: 10, type: 0x00000400, flags: 0x000003C7 - DP
[3] busId: 0x06, pipe: 8, type: 0x00000400, flags: 0x000003C7 - DP
01050900 00040000 C7030000
02040A00 00040000 C7030000
03060800 00040000 C7030000
```

Mấy cái này là cổng kết nối iGPU mặc định của bạn đó, giờ đi vào cái cổng số 1 (port 1) và xem từng phần nó dùng để làm gì nha:

Cổng đầu tiên:

```
01050900 00040000 C7030000
```

Cổng (port) số: 01

* **01**050900 00040000 C7030000

Mã ID bus kết nối (busId): 0x05

* 01**05**0900 00040000 C7030000

Số thứ tự của đường dẫn dữ liệu (pipe number): 9 (dữ liệu dạng little endian):

* 0105**0900** 00040000 C7030000

Chuẩn kết nối: DisplayPort

* 01050900 **00040000** C7030000

Cờ hiệu (Flags) - Cái này để mặc định:

* 01050900 00040000 **C7030000**

Một số thứ cần ghi nhớ:

* Bạn không được sử dụng cùng một busId hai lần, có 2 cái giống nhau của 2 cổng là nó đánh nhau tơi bời (xung đột) đó.
* Số thứ tự của đường dẫn dữ liệu (Pipe number) và cờ hiệu (flags) không cần đổi.

Danh sách các loại chuẩn kết nối:

* `00 04 00 00` - DisplayPort
* `00 08 00 00` - HDMI
* `04 00 00 00` - DVI (tín hiệu kỹ thuật số)
* `02 00 00 00` - LVDS (dành cho laptop)
* `01 00 00 00` - Cổng giả tượng trưng cho có

### Ánh xạ cổng xuất hình

1. Cắm màn hình vào cổng HDMI.

2. Chỉnh Port 1 thành loại kết nối HDMI:

   * 01xx0900 **00080000** C7030000

3. Vô hiệu hóa cổng 2 và 3 bằng cách đặt busid=00:

   * 02**00**0A00 00040000 C7030000
   * 03**00**0800 00040000 C7030000

4. Bắt đầu thử lần lượt các busid cho Port 1 nếu cái trước đó không chạy (chuẩn rồi, bạn phải khởi động lại máy mòn mỏi luôn đấy - a shit ton of reboots). Busid tối đa trên hầu hết các nền tảng là 0x06.

   * 01**01**0900 00080000 C7030000
   * 01**02**0900 00080000 C7030000
   * 01**03**0900 00080000 C7030000
   * vân...vân

Nếu bạn đã thử hết mà vẫn tối thui, thì set busid của port 1 về 00 và bắt đầu chuyển sang thử busid cho port 2, cứ thế mà làm:

* 01000900 00040000 C7030000
* 02xx0A00 00080000 C7030000
* 03000800 00040000 C7030000

### Thêm vào config.plist

Thêm mấy bản vá này cũng đơn giản thôi mặc dù cần khai báo hơi nhiều dòng:

* framebuffer-con0-enable = `01000000`
* framebuffer-con1-enable = `01000000`
* framebuffer-con2-enable = `01000000`
* framebuffer-con0-alldata = Cổng số 1
* framebuffer-con1-alldata = Cổng số 2
* framebuffer-con2-alldata = Cổng số 3

Lưu ý là khi thêm bản vá, port 1 (cổng 1) sẽ tương ứng với con0 vì máy tính đếm từ số 0. Mấy giá trị này đều là kiểu dữ liệu (data types) khi nhập vào nhé.

Cấu hình hoàn chỉnh trông sẽ na ná thế này:

![](../images/extras/gpu-patches-md/path-done.png)

Nguồn gốc bài viết này được lấy từ hướng dẫn vá BusID cho iGPU [CorpNewt's Brain](https://github.com/corpnewt)
