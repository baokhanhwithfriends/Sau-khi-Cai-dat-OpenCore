# Vá lỗi không xuất được hình nâng cao (vá Bus ID)

Phần này dành cho mấy bác không thể nào xuất hình được qua một số cổng nhất định bất kể đã vá loại kết nối (connector-type) hay đổi qua bất cứ SMBIOS gì, lý do là Apple đã "cứng đầu" gán cứng (hardcoded) các BusID đầu ra theo cách không giống ai, chả ăn nhập gì với phần cứng PC của bạn hết. Để giải quyết, chúng ta sẽ phải tự tay vá thủ công mấy cái Bus ID này để ép nó hỗ trợ phần cứng của mình.

Trang này sẽ hơi nặng về kỹ thuật một chút vì tụi mình mặc định là bạn đã đọc qua mấy trang trước và nắm khá vững về WhateverGreen rồi nhé.

* [Vá loại chuẩn kết nối màn hình](./connector.md)
* [Vá yêu cầu VRAM của macOS)](./vram.md)

## Mổ xẻ Framebuffer

Để bắt đầu, giả sử chúng ta đang có main Z390 với card màn hình onboard UHD 630. Hệ thống này chỉ dùng iGPU trong macOS và đang gặp vấn đề khi xuất hình qua một số cổng và đang sử dụng framebuffer `0x3E9B0007`.

Khi chúng ta soi cái framebuffer này trong [hướng dẫn của WhateverGreen](https://github.com/acidanthera/WhateverGreen/blob/master/Manual/FAQ.IntelHD.en.md), chúng ta thấy như sau:

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

Giờ hãy phân tích sâu xuống thông tin BusID, vì đây là cái chúng ta sẽ vá:

```
[1] busId: 0x05, pipe: 9, type: 0x00000400, flags: 0x000003C7 - DP
[2] busId: 0x04, pipe: 10, type: 0x00000400, flags: 0x000003C7 - DP
[3] busId: 0x06, pipe: 8, type: 0x00000400, flags: 0x000003C7 - DP
01050900 00040000 C7030000
02040A00 00040000 C7030000
03060800 00040000 C7030000
```

Ở đây chúng ta thấy nhân cách framebuffer này có 3 cái Bus ID được liệt kê, hãy thử chia nhỏ chúng ra cho dễ hiểu. Lấy mục số 1 làm ví dụ:

```
[1] busId: 0x05, pipe: 9, type: 0x00000400, flags: 0x000003C7 - DP
01050900 00040000 C7030000
```

| Bit | Name (Tên) | Value (Giá trị) |
| :--- | :--- | :--- |
| Bit 1 | Port (Cổng) | `01` |
| Bit 2 | Bus ID | `05` |
| Bit 3-4 | Pipe Number (Số hiệu ống dẫn) | `0900` |
| Bit 5-8 | Connector Type (Loại kết nối) | `00040000` |
| Bit 9-12 | Flag (Cờ) | `C7030000` |

Vài thứ cần khắc cốt ghi tâm:

* BusID là giá trị duy nhất và không thể dùng chung cho nhiều mục.
* Giá trị Connector-type (Loại kết nối) giống như đã bàn ở [trang hướng dẫn vá Connector-type ](./connector.md)

## Lập sơ đồ cổng xuất hình

Ở đây chúng ta có 2 trường hợp:

* [Lập sơ đồ ngay trong macOS](#mapping-withinb-macos)
  * Bạn có thể khởi động vào macOS và xài được ít nhất 1 màn hình.
* [Lập sơ đồ khi không vô được macOS](#mapping-without-macos)
  * Màn hình đen thui lui trên tất cả các cổng.
  
### Lập sơ đồ ngay trong macOS

Map cổng video trong macOS khá dễ, vì chúng ta có thể giả định rằng ít nhất một trong các cổng của mình đã được map đúng trong framebuffer (thì mới lên hình được chứ).

Ví dụ này, chúng ta sẽ giải thích cách sửa lỗi [Cắm nóng HDMI cho bạn đọc đang sử dụng Kaby Lake](https://baokhanhwithfriends.github.io/Huong-dan-cai-dat-OpenCore/config-laptop.plist/kaby-lake.html#deviceproperties). Để bắt đầu, hãy nhìn vào framebuffer `0x591B0000`:

```
ID: 591B0000, STOLEN: 38 MB, FBMEM: 21 MB, VRAM: 1536 MB, Flags: 0x0000130B
TOTAL STOLEN: 39 MB, TOTAL CURSOR: 1 MB (1572864 bytes), MAX STOLEN: 136 MB, MAX OVERALL: 137 MB (144191488 bytes)
Model name: Intel HD Graphics KBL CRB
Camellia: CamelliaDisabled (0), Freq: 1388 Hz, FreqMax: 1388 Hz
Mobile: 1, PipeCount: 3, PortCount: 3, FBMemoryCount: 3
[0] busId: 0x00, pipe: 8, type: 0x00000002, flags: 0x00000098 - ConnectorLVDS
[2] busId: 0x04, pipe: 10, type: 0x00000800, flags: 0x00000187 - ConnectorHDMI
[3] busId: 0x06, pipe: 10, type: 0x00000400, flags: 0x00000187 - ConnectorDP
00000800 02000000 98000000
02040A00 00080000 87010000
03060A00 00040000 87010000
```

Ở đây chúng ta thấy mục số 2 là cổng HDMI, tuy nhiên trên laptop Kaby lake thật thì việc cắm nóng (hot plug) rất hay gây ra kernel panic (lỗi màn hình chết chóc). Nguyên nhân là do bus ID và port không khớp hoàn hảo với phần cứng.

Để giải quyết, chúng ta sẽ muốn vá nó thành cái gì đó hợp lý hơn (ví dụ: `0204` thành `0105`, cặp này đã được kiểm chứng là hoạt động ngon)

Có 2 cách để vá:

* [Thay thế toàn bộ mục](#thay-the-toan-bo-muc)
* [Thay thế từng phần của mục](#thay-the-tung-phan-cua-muc)

#### Thay thế toàn bộ mục

Để thay thế cả cụm, đầu tiên chúng ta cần xác định vị trí mục của mình và đảm bảo nó được đánh số đúng. Apple đánh số bắt đầu từ 0 và tăng dần:

* con0
* con1
* con2

Vì mục số 2 (entry 2) là cái thứ hai trong danh sách (danh sách trên có [0], [2], [3] - *lưu ý: thứ tự trong danh sách framebuffer có thể nhảy cóc, nhưng thứ tự connector trong config thường tính theo vị trí xuất hiện: cái đầu là con0, cái hai là con1*), chúng ta sẽ sử dụng con1:

* framebuffer-con2-enable

Tiếp theo hãy tạo bản vá, chúng ta biết rằng port cần được vá thành `01` và BusID đổi thành `05`:

* <code>**0105**0A00 00080000 87010000</code>

Và cuối cùng, chúng ta có các bản vá sau:

```
framebuffer-patch-enable | Data | `01000000`
framebuffer-con2-enable  | Data | `01000000`
framebuffer-con2-alldata | Data | `01050A00 00080000 87010000`
```

#### Thay thế từng phần của mục

To replace sections of the entry, we'll first want to locate our entry and ensure it's enumerated correctly. This is because Apple's has entries starting at 0 and progresses through that:

Để thay thế từng phần, cũng như trên, đầu tiên xác định vị trí của mục và bảo đảm nó được đánh số chính xác. Cái này là do hệ thống của Apple có các mục nhập bắt đầu từ 0 và tăng dần đến số đó:

* `con0`
* `con1`
* `con2`

Mục số 2 là cái thứ hai trong danh sách, nên dùng con1:

* `framebuffer-con1-enable`

Tiếp theo tạo bản vá, chúng ta đã biết cần đổi port thành 01 và BusID thành 05:

* framebuffer-con2-index = `01`
* framebuffer-con2-busid = `05`

Và cuối cùng, ta có các bản vá:

```
framebuffer-patch-enable | Data | `01000000`
framebuffer-con2-enable  | Data | `01000000`
framebuffer-con2-index   | Data | `01`
framebuffer-con2-busid   | Data | `05`
```

### Ánh xạ khi không vào được macOS

Map cổng xuất hình kiểu này cũng đơn giản thôi, *tuy nhiên* nó tốn thời gian bà cố luôn vì bạn phải thử từng giá trị BusID một cho đến khi xuất được hình.

Ví dụ này, chúng ta lại sử dụng framebuffer 0x3E9B0007.

```
[1] busId: 0x05, pipe: 9, type: 0x00000400, flags: 0x000003C7 - DP
[2] busId: 0x04, pipe: 10, type: 0x00000400, flags: 0x000003C7 - DP
[3] busId: 0x06, pipe: 8, type: 0x00000400, flags: 0x000003C7 - DP
01050900 00040000 C7030000
02040A00 00040000 C7030000
03060800 00040000 C7030000
```

Để bắt đầu, chúng ta sẽ thử đi qua các BusID của mục số 1 (entry 1) với hy vọng tìm được giá trị chân ái.

##### 1. Cắm màn hình HDMI vào máy

##### 2. Thiết lập Port 1 thành loại kết nối HDMI

* <code>01xx0900 **00080000** C7030000</code>

::: details Các loại kết nối được hỗ trợ

Các loại kết nối phổ biến được hỗ trợ trong macOS:

```
<02 00 00 00>        LVDS và eDP       - Màn hình Laptop
<10 00 00 00>        VGA               - Không hỗ trợ từ 10.8 trở lên
<00 04 00 00>        DisplayPort       - Cổng xuất hình USB-C thực chất là DP
<01 00 00 00>        DUMMY             - Xài khi không có cổng vật lý
<00 08 00 00>        HDMI
<80 00 00 00>        S-Video
<04 00 00 00>        DVI (Dual Link)
<00 02 00 00>        DVI (Single Link)
```

Nhắc nhẹ là cổng VGA trên Skylake và mới hơn thực chất bên trong là kết nối DisplayPort, nên hãy dùng loại kết nối đó thay thế.

:::

##### 3. Vô hiệu hóa cổng 2 và 3 bằng busid=00

* <code>02**00**0A00 00040000 C7030000</code>
* <code>03**00**0800 00040000 C7030000</code>

##### 4. Thử lần lượt các busid cho Port 1 nếu cái trước đó không chạy. Busid tối đa trên hầu hết các nền tảng thường là 0x06.

* <code>01**01**0900 00080000 C7030000</code>
* <code>01**02**0900 00080000 C7030000</code>
* <code>01**03**0900 00080000 C7030000</code>
* v.v

Nếu thử hết mà vẫn đen thui, set busid của port 1 về 00 và bắt đầu thử tiếp busid cho port 2, cứ thế mà làm.

* port 1 = <code>01000900 00040000 C7030000</code>
* port 2 = <code>02**xx**0A00 00080000 C7030000</code>
* port 3 = <code>03000800 00040000 C7030000</code>

#### Thêm bản vá vào config.plist

Giờ bạn sẽ cần thêm mấy cái bản vá sau vào `DeviceProperteies -> Add -> PciRoot(0x0)/Pci(0x2,0x0)`:

```
framebuffer-patch-enable | Data | `01000000`
framebuffer-con0-enable  | Data | `01000000`
framebuffer-con1-enable  | Data | `01000000`
framebuffer-con2-enable  | Data | `01000000`
framebuffer-con0-alldata | Data | port 1 (ie. `01010900 00080000 C7030000`)
framebuffer-con1-alldata | Data | port 2 (ie. `02000A00 00040000 C7030000`)
framebuffer-con2-alldata | Data | port 3 (ie. `03000800 00040000 C7030000`)
```

Lưu ý rằng:

* port 1 sẽ được gán nhãn là `con0`
* BusID của port 1 được set là `01`
* BusID của port 2 và 3 được set là `00`, để tắt tụi nó đi.

Khi làm xong, bạn sẽ có cái gì đó trông na ná thế này:

![](../../images/gpu-patching/path-done.png)

Và như đã nói trước đó, nếu combo này không chạy, hãy tăng BusID của port 1 lên, nếu vẫn không chạy thì tắt BusID của port 1 đi và thử sang port 2, cứ thế mà chiến.
