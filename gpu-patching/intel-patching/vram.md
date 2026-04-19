# Vá bộ nhớ VRAM được yêu cầu

Phần này dành cho mấy bác có máy tính không cho mở khóa (unlock) BIOS để tăng lượng VRAM cấp phát cho iGPU, dẫn đến việc ăn ngay cái lỗi kernel panic (màn hình chết) khi vào macOS. Để lách qua vụ này, trước tiên chúng ta cần xác định lượng VRAM tối thiểu mà framebuffer yêu cầu, sau đó vá lại để bắt nó yêu cầu ít hơn, dễ hiểu hơn là bắt driver của Apple phải chạy với lượng bộ nhớ cố định mà BIOS cấp phát, cấm đòi hỏi thêm, tự xin thêm từ RAM.

Ví dụ, lấy một cái Framebuffer Haswell Lake thường được sử dụng trên máy bàn có iGPU Haswell: `0x0D220003`(`0300220D` khi đã đảo hex)

Giờ hãy nghía qua thông tin tương ứng trong [Hướng dẫn sử dụng WhateverGreen](https://github.com/acidanthera/WhateverGreen/blob/master/Manual/FAQ.IntelHD.en.md)(lưu ý là bạn phải bấm vào "Spoiler: Azul connectors")

```
ID: 0D220003, STOLEN: 32 MB, FBMEM: 19 MB, VRAM: 1536 MB, Flags: 0x00000402
TOTAL STOLEN: 52 MB, TOTAL CURSOR: 1 MB (1572864 bytes), MAX STOLEN: 116 MB, MAX OVERALL: 117 MB (123219968 bytes)
Camellia: CamelliaDisabled (0), Freq: 5273 Hz, FreqMax: 5273 Hz
Mobile: 0, PipeCount: 3, PortCount: 3, FBMemoryCount: 3
[1] busId: 0x05, pipe: 9, type: 0x00000400, flags: 0x00000087 - ConnectorDP
[2] busId: 0x04, pipe: 10, type: 0x00000400, flags: 0x00000087 - ConnectorDP
[3] busId: 0x06, pipe: 8, type: 0x00000400, flags: 0x00000011 - ConnectorDP
01050900 00040000 87000000
02040A00 00040000 87000000
03060800 00040000 11000000
```

Ở đây cái quan trọng là 2 dòng đầu:

```
ID: 0D220003, STOLEN: 32 MB, FBMEM: 19 MB, VRAM: 1536 MB, Flags: 0x00000402
TOTAL STOLEN: 52 MB, TOTAL CURSOR: 1 MB (1572864 bytes), MAX STOLEN: 116 MB, MAX OVERALL: 117 MB (123219968 bytes)
```

Mấy mục chính chúng ta quan tâm đây:

| Entry (Mục) | Value (Giá trị) | Comment (Ghi chú) |
| :--- | :--- | :--- |
| STOLEN | 32MB | Bộ nhớ dành riêng cho iGPU |
| FBMEM | 19MB | Bộ nhớ dành riêng cho framebuffer |
| TOTAL CURSOR | 1 MB | Bộ nhớ dành riêng cho con trỏ chuột |
| TOTAL STOLEN | 52 MB | Tổng hợp của mấy cái trên cộng lại |

Giờ giả dụ mainboard của bạn "keo kiệt" chỉ cấp 32MB cho iGPU, con số này quá ít so với những gì framebuffer yêu cầu. Vậy là khả năng cao bạn sẽ bị kernel panic khi hệ thống cố ghi vào một vùng bộ nhớ không tồn tại (không được cấp phát!).

Đó là lúc khả năng vá lỗi thần thánh của WhateverGreen phát huy tác dụng, ở đây chúng ta có thể thiết lập chính xác lượng bộ nhớ iGPU mà framebuffer yêu cầu bằng các thuộc tính sau:

| Value (Giá trị) | Comment (Ghi chú) |
| :--- | :--- |
| framebuffer-patch-enable | Cái này kích hoạt khả năng vá lỗi của WhateverGreen |
| framebuffer-stolenmem | Cái này thiết lập giá trị xài cho mục `STOLEN` |
| framebuffer-fbmem | Cái này thiết lập giá trị xài cho mục `FBMEM` |

## Tạo bản vá riêng cho máy bạn

Để hạ thấp yêu cầu VRAM xuống, chúng ta sẽ muốn set `STOLEN` thành 19MB và `FBMEM` thành 9MB. Tổng cộng lại sẽ giúp chúng ta lọt xuống dưới mức giới hạn 32MB.

Để làm việc này, chúng ta chạy mấy lệnh sau để chuyển đổi 9MB:

```md
# Chuyển đổi đơn vị 9MB Megabytes sang Bytes
echo '9 * 1024 * 1024' | bc
 9437184

# Chuyển từ thập phân sang thập lục phân (hexadecimal)
echo 'obase=16; ibase=10; 9437184' | bc
 900000

# Đảo ngược Hex (Hexswap) để nó có thể được nạp đúng cách
# tức là: đảo theo từng cặp
900000 -> 90 00 00 -> 00 00 90

# Đệm thêm số 0 vào cuối cho đủ 4 byte
00 00 90 00
```

Và khi chúng ta làm thế cho cả hai giá trị, ta được:

* 19MB = `00 00 30 01`
* 9MB = `00 00 90 00`

Và khi nhét nó vào các thuộc tính của WhateverGreen:

| Key | Type | Value
| :--- | :--- | :--- |
| framebuffer-patch-enable | Data | 01000000 |
| framebuffer-stolenmem | Data | 00003001 |
| framebuffer-fbmem | Data | 00009000 |

* Với `patch-enable`, 01000000 đơn giản có nghĩa là thông báo cho macOS biết cổng này có kích hoạt (Enabled).

## Áp dụng bản vá

Giờ có bản vá trong tay rồi, vào `DeviceProperties -> Add -> PciRoot(0x0)/Pci(0x2,0x0)` và bổ sung thêm các thuộc tính vào:

![](../../images/gpu-patching/vram.png)
