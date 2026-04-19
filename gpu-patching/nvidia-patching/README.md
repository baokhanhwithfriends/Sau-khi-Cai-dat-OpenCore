# Vá lỗi cho card màn hình Nvidia đời cũ

* Xin lưu ý trang này giống như một cái kho chứa thông tin thô hơn, tụi mình sẽ không đi quá sâu vào chi tiết thiết lập mặc dù có kế hoạch mở rộng trang này sau này.

Với mấy cái GPU Nvidia đời cũ (Legacy), macOS gặp khó khăn trong việc kích hoạt tăng tốc phần cứng (acceleration) do thiếu nhiều thuộc tính. Để lách qua cái này, chúng ta có thể nạp (inject) các thuộc tính vào IOService để macOS dễ dàng hiểu được.

Để bắt đầu, chúng ta giả định những điều sau phải được đáp ứng:

* macOS đã được cài đặt theo cách nào đó.
  * Chúng ta cần cài macOS rồi mới xác định được một số thuộc tính nhất định
* GPU của bạn thuộc dòng Fermi hoặc cũ hơn.
  * Kiến trúc Kepler và mới hơn **không nên và càng không cần** nạp Thuộc tính Thiết bị (Device Property) kiểu này.
* Lilu and WhateverGreen đã được nạp.
  * Kiểm tra chạy chưa bằng lệnh `kextstat | grep -E "Lilu|WhateverGreen"`
  
### Tìm đường dẫn GPU

Đầu tiên lôi cổ [gfxutil](https://github.com/acidanthera/gfxutil/releases) ra và chạy lệnh sau:

```
đường/dẫn/tới/gfxutil -f display
```

Nó sẽ nhả ra một dòng dạng như vầy:

```
67:00.0 10DE:0A20 /PC02@0/BR2A@0/GFX0@0/ = PciRoot(0x2)/Pci(0x0,0x0)/Pci(0x0,0x0)
```

Cái chúng ta quan tâm là phần PciRoot, vì đây là nơi GPU của chúng ta tọa lạc và là nơi chúng ta sẽ bơm thuộc tính vào:

```
PciRoot(0x2)/Pci(0x0,0x0)/Pci(0x0,0x0)
```

### Xây dựng DeviceProperties

Với card màn hình Nvidia, thực ra không cần bổ sung quá nhiều thuộc tính để thiết lập đâu. Mấy cái chính được khuyến nghị phải thêm là:

| Property (Thuộc tính) | Value (Giá trị) | Comment (Ghi chú) |
| :--- | :--- | :--- |
| model | VD: GeForce GT 220 | Tên model card màn hình, để làm màu là chính |
| device_type | NVDA,Parent | Luôn đặt là `NVDA,Parent` |
| VRAM,totalsize | VD: 0000004000000000 | Cái này thiết lập dung lượng VRAM |
| rom-revision | Dortania | Thuộc tính này bắt buộc phải có, nhưng bạn muốn để giá trị là gì cũng được |
| NVCAP | VD: 0500000000000F00000000000000000F00000000 | Thiết lập thuộc tính hiển thị xài bởi macOS, xem thêm bên dưới |
| @0,compatible | NVDA,NVMac | Luôn đặt là `NVDA,NVMac` |
| @0,device_type | display | Luôn đặt là `display` |
| @0,name | NVDA,Display-A | Luôn đặt là `NVDA,Display-A` |
| @1,compatible | NVDA,NVMac | Luôn đặt là `NVDA,NVMac` |
| @1,device_type | display | Luôn đặt là `display` |
| @1,name | NVDA,Display-B | Luôn đặt là `NVDA,Display-B` |

Và giờ đi tính toán vài thuộc tính cụ thể:

* [Thuộc tính model](#thuoc-tinh-model)
* [Thuộc tính VRAM,totalsize](#thuoc-tinh-vram-totalsize)
* [Thuộc tính rom-revision](#thuoc-tinh-rom-revision)
* [Thuộc tính NVCAP](#thuoc-tinh-nvcap)

### Thuộc tính model

Về kỹ thuật thì chỉ để làm đẹp, nhưng macOS yêu cầu phải có mục này nên chúng ta cứ cung cấp cho nó zừa lòng. Định dạng như sau:

```md
GeForce [Tên dòng sản phẩm]
# Ví dụ
GeForce GT 220
```

### Thuộc tính VRAM,totalsize

Lượng VRAM có trên card của bạn, tính bằng hệ thập lục phân (hexadecimal).

Ví dụ, hãy chuyển đổi 1024MB sang hex:

```md
# Chuyển đổi 1024MB Megabytes sang Bytes
echo '1024 * 1024 * 1024' | bc
 1073741824

# Chuyển từ thập phân sang thập lục phân
echo 'obase=16; ibase=10; 1073741824' | bc
 40000000

# Đảo ngược Hex (Hexswap) để nạp cho đúng
# tức là: đảo theo cặp
40000000 -> 40 00 00 00 -> 00 00 00 40

# Đệm giá trị cho đủ 8 byte bằng cách thêm 00 vào cuối
00 00 00 40 00 00 00 00

# Và bạn đã xong được cái của nợ này
VRAM,totalsize = 0000004000000000
```

### Thuộc tính rom-revision

Đơn giản là giá trị nào cũng được, nhưng thuộc tính này phải tồn tại vì một số loại GPU sẽ không khởi tạo được nếu thiếu nó (ví dụ: GT 220).

```
rom-revision = Dortania
```

### Thuộc tính NVCAP

Đây là phần vui nhất nè, vì chúng ta phải tính toán giá trị NVCAP. Ơn giời là thánh 1Revenger1 đã tạo ra một công cụ để tự động hóa quy trình này: [Máy tính NVCAP](https://github.com/1Revenger1/NVCAP-Calculator/releases)

Để dùng chương trình này, tải VBIOS của card bạn về ([TechPowerUp lưu trữ hầu hết tất cả bản VBIOS của mọi dòng card màn hình](https://www.techpowerup.com/vgabios/)) và chạy NVCAP-Calculator trong terminal.

Chạy lên bạn sẽ thấy như sau:

![](../../images/gpu-patching/nvidia/nvcap-start.jpg)

Ném file VBIOS vào rồi nhấn Enter. Khi nó đưa bạn đến menu chính, chọn số 2 để vào trang tính toán NVCAP.

![](../../images/gpu-patching/nvidia/nvcap-initial-nvcap.jpg)

Ở đây bạn có thể thấy các cổng kết nối mà NVCAP-Calculator tìm được. Mỗi Màn hình có thể đại diện cho nhiều mục DCB, ví dụ như DVI (thường được biểu diễn là hai mục) hoặc các mục DCB trùng lặp. Mục tiêu ở đây là gán mỗi màn hình cho một cái Head (Đầu xuất hình). Mỗi head chỉ có thể xuất ra một màn hình cùng một lúc. Ví dụ, nếu bạn dùng 2 cổng DVI, mỗi cổng nên nằm trên một head riêng để hỗ trợ màn hình kép (dual monitor) chuẩn chỉnh.

Lưu ý là một số màn hình có thể được gán tự động. Màn hình LVDS (laptop) sẽ tự động được đặt vào head riêng của nó, màn hình TV sẽ tự động vào head TV.

Để bắt đầu gán màn hình, nhấn `1`. Để gán một màn hình vào một head, bạn gõ số của màn hình rồi đến số của head. Ví dụ, gõ `1 1` sẽ cho kết quả:

![](../../images/gpu-patching/nvidia/nvcap-assign-entry.jpg)

Bạn có thể gõ `1 1` lần nữa để gỡ màn hình khỏi head đó. Khi gán xong xuôi, nó sẽ trông na ná thế này:

![](../../images/gpu-patching/nvidia/nvcap-complete-displays.jpg)

Xong phần màn hình thì nhấn `q` để quay lại các cài đặt NVCAP khác. Bạn nên thiết lập phần còn lại của NVCAP như sau:

| NVCAP Value (Giá trị NVCAP) | Details (Chi tiết) | Example Command (Lệnh ví dụ) |
| :---------: | :------ | :-------------- |
| Version | `04` cho dòng 7 series và cũ hơn, `05` cho dòng 8 series và mới hơn | `3` rồi `4` |
| Composite | `01` cho S-Video, `00` cho loại khác | `4` để bật/tắt |
| Script based Power/Backlight | `00` chỉ hữu dụng cho MacBook Pro thiệt | `3` để bật/tắt |
| Field F (Unknown) | `0F` cho dòng 300 series và mới hơn, còn lại là `07` | `6` rồi `0x0f` |

Xong hết thì gõ `c` để tính toán giá trị NVCAP.

![](../../images/gpu-patching/nvidia/nvcap-calculated.jpg)

Tèn ten, bạn đã có giá trị NVCAP của mình!

```
NVCAP: 
05000000 00000300 0c000000 0000000f 00000000
```

Cho những ai muốn biết chi tiết cách tính NVCAP thủ công:

::: details Bảng NVCAP

Info based off of [WhateverGreen's NVCAP.bt file](https://github.com/acidanthera/WhateverGreen/blob/master/Manual/NVCAP.bt)

| NVCAP Bit | Name (Tên) | Comment (Ghi chú) |
| :--- | :--- | :--- |
| Byte 1 | NVCAP Version | `04` cho 7 series và cũ hơn, `05` cho 8 series và mới hơn |
| Byte 2 | Laptop with Lid | `01` nếu có nắp gập, `00` nếu không có |
| Byte 3 | Composite | `01` cho S-Video, `00` nếu không có |
| Byte 4 | Backlight | `01` cho Tesla V1 có điều khiển đèn nền (màn hình laptop, AIO), ngược lại, nếu không có thì chọn `00` cho GPU mới hơn bất kể loại màn hình |
| Bytes 5+6   | TVDCBMask    | `00 00`, liên quan đến mục DCB 5 |
| Bytes 7+8   | Head0DCBMask | `00 00`, xem bên dưới |
| Bytes 9+10  | Head1DCBMask | `00 00`, xem bên dưới |
| Bytes 11+12 | Head2DCBMask | `00 00`, không áp dụng cho Fermi và cũ hơn |
| Bytes 13+14 | Head3DCBMask | `00 00`, không áp dụng cho Fermi và cũ hơn |
| Byte 15 | ScriptBasedPowerAndBacklight| `00`, chỉ liên quan đến MacBook Pro đồ thiệt |
| Byte 16 | Unknown | `0F` cho 300 series và mới hơn, ngược lại `07` |
| Byte 17 | EDID | `00` |
| Byte 18 | Reserved | `00` |
| Byte 19 | Reserved | `00` |
| Byte 20 | Reserved | `00` |

:::

### Tổng kết 

Giờ đã có đủ các thuộc tính trong tay, gom tụi nó lại rồi nhét vào config.plist thôi:

```
PciRoot(0x2)/Pci(0x0,0x0)/Pci(0x0,0x0)

model          | String | GeForce GT 220
device_type    | String | NVDA,Parent
VRAM,totalsize |  Data  | 0000004000000000
rom-revision   | String | Dortania
NVCAP          |  Data  | 05000000 00000300 0c000000 0000000f 00000000
@0,compatible  | String | NVDA,NVMac
@0,device_type | String | display
@0,name        | String | NVDA,Display-A
@1,compatible  | String | NVDA,NVMac
@1,device_type | String | display
@1,name        | String | NVDA,Display-B
```

Mở config.plist, vào `DeviceProperties -> Add`, tạo một mục con mới với tên là đường dẫn GPU của bạn (cái lấy từ gfxutil hồi nãy á). Sau đó, thêm các thuộc tính trên làm con của cái PciRoot đó. Kết quả cuối cùng sẽ trông giống thế này:

![](../../images/gpu-patching/nvidia/deviceproperties.png)
