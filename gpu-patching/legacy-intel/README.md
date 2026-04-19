# Thiết lập cho dòng iGPU Intel đời cũ

Phần này hỗ trợ các mẫu GPU sau:

* GMA 900 (10.4 và 10.5)
  * Hỗ trợ một phần trên 10.6 và 10.7, tuy nhiên thường xuyên gặp lỗi acceleration (tăng tốc đồ họa).
* GMA 950 (10.4-10.7)
  * GMA 3150 có thể được spoof (giả mạo) để hỗ trợ, tuy nhiên sẽ mất khả năng tăng tốc phần cứng chuẩn.
* GMA X3100(10.5-10.7)
  * Lưu ý là chỉ hỗ trợ các model mobile (laptop), ví dụ như 965 Express Chipset Family. Model cùng dòng có trên máy tính bàn không được hỗ trợ

Lưu ý nhẹ là trang này giống cái kho chứa thông tin hơn, tụi mình sẽ không đi quá sâu vào chi tiết thiết lập đâu, mặc dù có kế hoạch mở rộng trang này sau. Thông tin được dựa trên [Clover's InjectIntel](https://github.com/CloverHackyColor/CloverBootloader/blob/2961827dce9c0ab26345c00fb5a9c581f96c0d6b/rEFIt_UEFI/Platform/gma.cpp)

## Điều kiện tiên quyết

Xui cái là hỗ trợ GMA trên PC hơi bị khoai, và vì thế chúng ta cần ép chạy không gian nhân 32-Bit (32-Bit kernelspace) vì driver GMA 64-Bit nổi tiếng với mấy cái lỗi rác hình GPU dị dị và lỗi ngủ mà Apple mãi không chịu sửa. Để thực hiện, ta cần:

* Bảo đảm tất cả kext của bạn là 32-Bit hoặc FAT (hỗ trợ cả 32 và 64).
  * Chạy lệnh `lipo -archs` trên file binary của kext để kiểm tra.
  * Mấy cái kext phổ biến được lưu trữ ở đây: [Legacy-Kexts](https://github.com/khronokernel/Legacy-Kexts)
* Bảo đảm bạn đang khởi động kernel 32-Bit.
  * Set `Kernel -> Scheme -> KernelArch` to `i386`

Giờ thì bắt tay vào thiết lập thôi:

* [Thiết lập GMA 950](#thiet-lap-gma-950)
  * Hỗ trợ card màn hình onboard GMA 900, 950 và 3150
* [Thiết lập GMA X3100](#gma-x3100-setup)
  * Chỉ hỗ trợ card màn hình onboard GMA X3100 trên các dòng thiết bị mobile (laptop)
* [Khắc phục sự cố](#khac-phuc-su-co)
  * [Riêng Laptop Dell](#rieng-laptop-dell)
  * [Lỗi Kernel Panic sau khi vào màn hình chính 30 giây](#loi-kernel-panic-sau-khi-vao-man-hinh-chinh-30-giay)

## Thiết lập GMA 950

* Các hệ điều hành hỗ trợ: 10.4 - 10.7

Phần này dành cho bạn đọc có GMA 900 và 950, cũng hỗ trợ một phần cho dòng GMA 3150. Lưu ý là GMA 900 chỉ được hỗ trợ ngon lành trên 10.4 và 10.5 thôi nha.

Bên trong `Info.plist` của `AppleIntelGMA950.kext`, các Device ID sau được hỗ trợ:

```md
# Các giá trị được trích xuất từ bộ cài OS X 10.7.0
0x2582 - GMA 900 - Grantsdale - 945GM/GMS/940GML
0x2592 - GMA 900 - Alviso     - 945G
0x2772 - GMA 950 - Lakeport   - 915GM/GMS/910GML
0x27A2 - GMA 950 - Calistoga  - 82915G/GV/910GL
```

Nếu iGPU của bạn thuộc một trong các thế hệ chip trên, nhưng Device ID không có trong danh sách thì bạn có thể dễ dàng thêm một cái fake device-id (ID giả):

```md
# ID giả cho GMA 950(Calistoga)
config.plist:
|-DeviceProperties
 |- Add
  |- PciRoot(0x0)/Pci(0x2,0x0)
   |- device-id | Data | A2270000
```

Để xem danh sách đầy đủ các dòng GPU được hỗ trợ, xem bên dưới:

::: details Các dòng thiết bị GMA

Thông tin lấy từ GMA.c của Clover:

```md
# Grantsdale
0x2582 - GMA 900 - 945GM/GMS/940GML
0x258A - GMA 900 - E7221
0x2782 - GMA 900 - 82915G

# Alviso
0x2592 - GMA 900 - 915GM/GMS/910GML
0x2792 - GMA 900 - 915GM/GMS/910GML

# Lakeport
0x2772 - GMA 950 - 915GM/GMS/910GML
0x2776 - GMA 950 - 915GM/GMS/910GML

# Calistoga
0x27A2 - GMA 950 - 82915G/GV/910GL
0x27A6 - GMA 950 - 945GM/GMS/GME, 943/940GML
0x27AE - GMA 950 - 945GSE
```

:::

### Nạp thuộc tính

Để bảo đảm tăng tốc phần cứng (acceleration) ngon lành với OpenCore, mở `DeviceProperties -> Add`. Tạo một mục con mới tên là `PciRoot(0x0)/Pci(0x2,0x0)` và chúng ta sẽ bổ sung thêm các thuộc tính cần thiết để card đồ họa có thể chạy trơn tru:

Với máy bàn (Desktops) cần rất ít thuộc tính, đa số trường hợp có thể khởi động Mac OS X mà không cần nạp gì thêm cả:

* Máy bàn:

```
| model         | String | GMA 950  | // Thêm cái này chủ yếu để làm màu
| AAPL,HasPanel | Data   | 00000000 |
```

* Laptop (máy tính xách tay):

```
| model                     | String | GMA 950  | // Thêm cái này chủ yếu để làm màu
| AAPL,HasPanel             |  Data  | 01000000 |
| AAPL01,BacklightIntensity |  Data  | 3F000008 |
| AAPL01,BootDisplay        |  Data  | 01000000 |
| AAPL01,DataJustify        |  Data  | 01000000 |
| AAPL01,DualLink           |  Data  | 00       |

* Chỉnh giá trị AAPL01,DualLink thành 01 nếu màn hình laptop của bạn có độ phân giải cao hơn 1366x768.
```

Để xem danh sách đầy đủ những gì Clover nạp vào, xem bên dưới:

::: details Các thuộc tính InjectIntel của Clover

Các thuộc tính bên dưới là những gì Clover sẽ nạp cho iGPU dòng GMA 900/950:

```
| built-in                  | Data | 01       |
| AAPL,HasPanel             | Data | 01000000 |
| AAPL01,BacklightIntensity | Data | 3F000008 |
| AAPL01,BootDisplay        | Data | 01000000 |
| AAPL01,DataJustify        | Data | 01000000 |
| AAPL01,Dither             | Data | 00000000 |
| AAPL01,Interlace          | Data | 00000000 |
| AAPL01,Inverter           | Data | 00000000 |
| AAPL01,InverterCurrent    | Data | 00000000 |
| AAPL01,LinkFormat         | Data | 00000000 |
| AAPL01,LinkType           | Data | 00000000 |
| AAPL01,Pipe               | Data | 01000000 |
| AAPL01,Refresh            | Data | 3B000000 |
| AAPL01,Stretch            | Data | 00000000 |
| AAPL01,T1                 | Data | 00000000 |
| AAPL01,T2                 | Data | 01000000 |
| AAPL01,T3                 | Data | C8000000 |
| AAPL01,T4                 | Data | C8010000 |
| AAPL01,T5                 | Data | 01000000 |
| AAPL01,T6                 | Data | 00000000 |
| AAPL01,T7                 | Data | 90100000 |
```

:::

Với người dùng GMA 3150, bạn cũng sẽ cần thêm bản vá này:

::: details Bản vá cho GMA 3150

Dưới mục Kernel -> Patch, bổ sung thêm cái này vào:

```
Comment    = GMA 3150 Cursor corruption fix
Enabled    = True
Identifier = com.apple.driver.AppleIntelIntegratedFramebuffer
Find       = 8b550883bab0000000017e36890424e832bbffff
Replace    = b800000002909090909090909090eb0400000000
MaxKernel  = 11.99.99
MinKernel  = 8.00.00
```

Nguồn: [GMA.c](https://github.com/CloverHackyColor/CloverBootloader/blob/2961827dce9c0ab26345c00fb5a9c581f96c0d6b/rEFIt_UEFI/Platform/gma.cpp#L1735L1739)

:::

## Thiết lập GMA X3100

* Các hệ điều hành hỗ trợ: 10.5 - 10.7

Bên trong `Info.plist` của `AppleIntelGMAX3100.kext`, các Device ID sau được hỗ trợ:

```md
# Các giá trị được trích xuất từ bộ cài OS X 10.7.0
0x2a02 - GMA X3100 - Crestline - GM965/GL960
```

Nếu iGPU của bạn thuộc dòng Crestline, nhưng Device ID không có thì cứ fake ID thôi:

```md
# ID giả cho GMA X3100(Crestline)
config.plist:
|-DeviceProperties
 |- Add
  |- PciRoot(0x0)/Pci(0x2,0x0)
   |- device-id | Data | 022A0000
```

Để xem danh sách đầy đủ các dòng GPU được hỗ trợ, xem bên dưới:

::: details Các dòng thiết bị GMA

Thông tin lấy từ GMA.c của Clover:

```md
# Calistoga
0x2A02 - GMA X3100 - GM965/GL960
0x2A03 - GMA X3100 - GM965/GL960
0x2A12 - GMA X3100 - GME965/GLE960
0x2A13 - GMA X3100 - GME965/GLE960
```

:::

### Nạp thuộc tính

Để bảo đảm tăng tốc phần cứng (acceleration) ngon lành với OpenCore, mở `DeviceProperties -> Add`. Tạo một mục con mới tên là `PciRoot(0x0)/Pci(0x2,0x0)` và chúng ta sẽ bổ sung thêm các thuộc tính cần thiết để card đồ họa có thể chạy trơn tru:

Với X3100, đa số trường hợp có thể khởi động Mac OS X mà không cần nạp gì thêm cả:

```
| model                     | String | GMA X3100 | // Thêm cái này chủ yếu để làm màu
| AAPL,HasPanel             |  Data  | 01000000  |
| AAPL,SelfRefreshSupported |  Data  | 01000000  | // Tùy chọn
| AAPL,aux-power-connected  |  Data  | 01000000  | // Tùy chọn
| AAPL,backlight-control    |  Data  | 01000008  | // Tùy chọn
| AAPL01,BacklightIntensity |  Data  | 38000008  |
| AAPL01,BootDisplay        |  Data  | 01000000  |
| AAPL01,DataJustify        |  Data  | 01000000  |
| AAPL01,DualLink           |  Data  | 00        |

* Chỉnh giá trị AAPL01,DualLink thành 01 nếu màn hình laptop của bạn có độ phân giải cao hơn 1366x768.
```

Để xem danh sách đầy đủ những gì Clover nạp vào, xem bên dưới:

::: details Các thuộc tính InjectIntel của Clover

Các thuộc tính bên dưới là những gì Clover sẽ nạp cho iGPU dòng GMA 900/950:

```
| built-in                       | Data | 01       |
| AAPL,HasPanel                  | Data | 01000000 |
| AAPL,SelfRefreshSupported      | Data | 01000000 |
| AAPL,aux-power-connected       | Data | 01000000 |
| AAPL,backlight-control         | Data | 01000008 |
| AAPL00,blackscreen-preferences | Data | 00000008 |
| AAPL01,BootDisplay             | Data | 01000000 |
| AAPL01,BacklightIntensity      | Data | 38000008 |
| AAPL01,blackscreen-preferences | Data | 00000000 |
| AAPL01,DataJustify             | Data | 01000000 |
| AAPL01,Dither                  | Data | 00000000 |
| AAPL01,Interlace               | Data | 00000000 |
| AAPL01,Inverter                | Data | 00000000 |
| AAPL01,InverterCurrent         | Data | 08520000 |
| AAPL01,LinkFormat              | Data | 00000000 |
| AAPL01,LinkType                | Data | 00000000 |
| AAPL01,Pipe                    | Data | 01000000 |
| AAPL01,Refresh                 | Data | 3D000000 |
| AAPL01,Stretch                 | Data | 00000000 |
| AAPL01,T1                      | Data | 00000000 |
| AAPL01,T2                      | Data | 01000000 |
| AAPL01,T3                      | Data | C8000000 |
| AAPL01,T4                      | Data | C8010000 |
| AAPL01,T5                      | Data | 01000000 |
| AAPL01,T6                      | Data | 00000000 |
| AAPL01,T7                      | Data | 90100000 |
```

:::

## Khắc phục sự cố

### Riêng Laptop Dell

Một vấn đề khá ức chế với laptop Dell dùng iGPU GMA là chúng thường xuyên bị đen màn hình khi khởi động. Nguyên nhân là do thiết bị `DVI` được khai báo trong ACPI, nên chúng ta cần vá lại nó để nó "chơi đẹp" với macOS.

Ví dụ cho bản vá SSDT:

```c
DefinitionBlock ("", "SSDT", 2, "DRTNIA", "SsdtDvi", 0x00001000)
{
    External (_SB_.PCI0.SBRG.GFX0.DVI_, DeviceObj)

    Scope (\_SB.PCI0.SBRG.GFX0.DVI)
    {
        Method (_STA, 0, NotSerialized)  // _STA: Status
        {
            If (_OSI ("Darwin"))
            {
                Return (0)
            }
            Else
            {
                Return (0x0F)
            }
        }
    }
```

### Lỗi Kernel Panic sau khi vào màn hình chính 30 giây

Một lỗi dị khác với 10.6 và cũ hơn là giá trị `_UID` của PciRoot **bắt buộc** phải là Zero (Số 0) nếu không thì sẽ ăn ngay cái kernel panic. Ví dụ về mục UID lởm:

```c
Device (PCI0)  {
 Name (_HID, EisaId ("PNP0A08")) // Lấy PNP0A08 để tìm PciRoot của bạn
 Name (_CID, EisaId ("PNP0A03"))
 Name (_ADR, One)
 Name (_UID, Zero)               // Cần phải vá thành Zero - Số 0
```
