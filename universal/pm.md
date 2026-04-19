# Sửa lỗi điều phối điện năng nâng cao

## Kích hoạt X86PlatformPlugin

Trước khi chúng ta có thể cấu hình điều phối điện năng theo ý thích (thay vì theo mặc định của Apple), việc đầu tiên là phải bảo đảm cái lõi XCPM (XNU CPU Power Management - Quản lý điện năng CPU của kernel) của Apple đã được nạp. Lưu ý là món này **chỉ hỗ trợ Haswell và các đời mới hơn**, mấy bác xài CPU Sandy, Ivy Bridge dòng phổ thông và AMD thì vui lòng ghé xuống chỗ này nghen:

* [Điều phối điện năng cho đời Sandy và Ivy Bridge](../universal/pm.md#đieu-phoi-đien-nang-cho-đoi-sandy-va-ivy-bridge)
* [Điều phối điện năng cho CPU AMD](../universal/pm.md#đieu-phoi-đien-nang-cho-cpu-amd)

::: details Lưu ý cho đời Ivy Bridge và Ivy Bridge-E

Apple đã "đem con bỏ chợ", ngừng hỗ trợ XCPM trên mấy dòng này từ hồi macOS Sierra, nên XCPM chỉ chạy được từ bản 10.8.5 đến 10.11.6 thôi. Bạn vẫn sẽ cần [ssdtPRgen](../universal/pm.md#đieu-phoi-đien-nang-cho-đoi-sandy-va-ivy-bridge).

Để kích hoạt XCPM trên 10.11 và cũ hơn cho mấy dòng này, đơn giản là bổ sung thêm `-xcpm` vào boot-args (tham số khởi động).

:::

Để bắt đầu (với đời Haswell và mới hơn), tải [IORegistryExplorer](https://github.com/khronokernel/IORegistryClone/blob/master/ioreg-302.zip) về và tìm từ khóa `AppleACPICPU` (Lưu ý là nếu bạn xài tính năng tìm kiếm, IORegistryExplorer sẽ không hiện các mục con của dịch vụ tìm thấy đâu. Nhớ xóa ô tìm kiếm đi sau khi đã tìm thấy mục cần tìm nhé):

Có XCPM           |  Chưa có XCPM
:-------------------------:|:-------------------------:
![](../images/post-install/pm-md/pm-working.png)  |  ![](../images/post-install/pm-md/pm-not-working.png)

Như bạn thấy ở hình bên trái, chúng ta có X86PlatformPlugin được đính kèm. Cái này có nghĩa là driver điều phối điện năng CPU của Apple đang chạy ngon lành (tên của CPU không quan trọng đâu). Nếu bạn thấy giống hình bên phải, thì chắc chắn là có vấn đề rồi. Bạn vui lòng kiểm tra lại mấy thứ sau:

* SSDT-PLUG.**aml** đã có mặt và được bật (Enabled) trong config.plist và thư mục EFI/OC/ACPI chưa.
  * Nếu bạn thiếu cái này, ghé qua [Khởi đầu với ACPI](https://dortania.github.io/Getting-Started-With-ACPI) để tìm hiểu cách tạo nhé.
* SSDT-PLUG đã được set cho luồng (thread) đầu tiên của CPU chưa. Bạn có thể kiểm tra bằng cách chọn CPU đầu tiên trong danh sách (`CP00` trong ví dụ của chúng ta) và đảm bảo bạn thấy dòng này trong phần thuộc tính:

::: tip MẸO

SSDT-PLUG không bắt buộc trên macOS 12.3 trở lên.

:::

```
plugin-type | Number | 0x1
```

::: details Lưu ý với dòng X99

XCPM không hỗ trợ Haswell-E và Broadwell-E một cách trực tiếp (native), chúng ta cần giả mạo (spoof) CPU ID thành một model có hỗ trợ XCPM:

* **Haswell-E**:

  * `Kernel -> Emulate`:
    * Cpuid1Data: `C3060300 00000000 00000000 00000000`
    * Cpuid1Mask: `FFFFFFFF 00000000 00000000 00000000`

* **Broadwell-E**:

  * `Kernel -> Emulate`:
    * Cpuid1Data: `D4060300 00000000 00000000 00000000`
    * Cpuid1Mask: `FFFFFFFF 00000000 00000000 00000000`

:::

## Tự tay tạo bảng dữ liệu điều phối điện năng

Trong đa số trường hợp thì dữ liệu điều phối điện năng CPU mặc định của macOS chạy ngon ngay từ đầu (out of the box). Nếu bạn gặp vấn đề hoặc cảm thấy máy chạy ì hơn hoặc máy chạy nóng hơn so với Windows (do macOS tự điều chỉnh xung cao hơn dù xài tác vụ nhẹ), bạn nên thử đổi SMBIOS sang cái nào phù hợp hơn với máy tính của bạn, nó sẽ cung cấp dữ liệu khác và có thể khiến CPU chạy hợp với cảm giác sử dụng của bạn hơn. Trong trường hợp bắt buộc phải chỉnh thủ công, bạn có thể xài CPUFriend để nạp (inject) dữ liệu điều phối điện năng đã chỉnh sửa, nhưng cảnh báo trước là nếu "gà mờ" không biết mình đang làm gì thì bạn có thể làm hư luôn cái điều phối điện năng đó nha.

::: warning CẢNH BÁO

Trong hầu hết các trường hợp, bạn không cần làm bước này. Hãy đổi SMBIOS trước đi.

:::

::: tip MẸO

Đây là ví dụ về cách thay đổi một số phần của dữ liệu điều phối điện năng. Để biết thêm chi tiết, bạn nên đọc [Tài liệu của CPUFriend](https://github.com/acidanthera/CPUFriend/blob/master/Instructions.md).

:::

### Sử dụng CPUFriend

Để bắt đầu, chúng ta cần chuẩn bị vài món đồ chơi:

* X86PlatformPlugin đã được nạp.
  * Nghĩa là CPU Sandy Bridge và AMD miễn chơi trò này nhé.
* [CPUFriend](https://github.com/acidanthera/CPUFriend/releases)
* [CPUFriendFriend](https://github.com/corpnewt/CPUFriendFriend)

### LFM: Low Frequency Mode (Chế độ tần số thấp)

Giờ chạy file CPUFriendFriend.command lên:

![](../images/post-install/pm-md/lpm.png)

Mới mở lên, CPUFriendFriend sẽ hỏi bạn chọn giá trị LFM. Bạn có thể hiểu đây là cái "sàn" của CPU, hay mức xung nhịp thấp nhất mà nó sẽ chạy khi trong chế độ nghỉ (idle). Giá trị này giúp ích rất nhiều cho việc ngủ (sleep) ngon lành vì macOS cần chuyển từ trạng thái S3 (ngủ) sang S0 (tỉnh) một cách mượt mà.

Để xác định giá trị LFM, bạn có thể:

* Tìm giá trị `TDP-down Frequency` (Tần số TDP thấp nhất) trên [trang ARK](https://ark.Intel.com/) của Intel
  * Lưu ý là Intel không công bố giá trị này với đa số CPU, nên bạn phải tự mò thôi.
* Hoặc chọn theo các giá trị mẫu được khuyến nghị:

| Thế hệ CPU | Giá trị LFM | Ghi chú |
| :--- | :--- | :--- |
| Laptop đời Broadwell trở lên  | 08 | Tương đương 800Mhz |
| Máy bàn đời Broadwell trở lên | 0A | Tương đương 1000Mhz |
| Máy trạm (HEDT)/Máy chủ (Server) đời Haswell/Broadwell (VD: X99) | 0D | Tương đương 1300Mhz |
| Máy trạm (HEDT)/Máy chủ (Server) đời Skylake trở lên (VD: X299) | 0C | Tương đương 1200Mhz |

* **Lưu ý**: Giá trị LFM chỉ khả dụng trên SMBIOS Broadwell và mới hơn. Đời cũ hơn thì bỏ qua
* **Lưu ý số 2**: Mấy giá trị này không phải là chân lý bất di bất dịch, mỗi máy mỗi tính cách nên bạn cần thử nghiệm xem cái nào chạy ngon nhất trên phần cứng của mình.

Ví dụ này tụi mình xài con [Core i9 7920x](https://ark.Intel.com/content/www/us/en/ark/products/126240/Intel-core-i9-7920x-x-series-processor-16-5m-cache-up-to-4-30-ghz.html) có xung nhịp cơ bản là 2.9 GHz nhưng không công bố LFM, nên tụi mình chọn đại 1.3 GHz (tức là 1300Mhz) rồi tăng/giảm dần đến khi thấy ổn định.

* Lưu ý rằng giá trị LFM đơn giản là hệ số nhân (multiplier) của CPU, nên bạn cần cắt gọt giá trị cho đúng.
  * Tức là: Chia cho 100, rồi chuyển sang hệ thập lục phân (hexadecimal).

```sh
echo "obase=16; 13" | bc
```

* Để ý kỹ là tụi mình xài số 13 cho 1.3Ghz chứ không phải nhập 1.3 nha.

### EPP: Energy Performance Preference (Ưu tiên hiệu năng hoặc tiết kiệm năng lượng)

![](../images/post-install/pm-md/epp.png)

Tiếp theo là Energy Performance Preference. Cái này nói cho macOS biết khi nào nên tăng tốc CPU lên mức xung nhịp tối đa ngay lập tức hay tăng từ từ. Giá trị `00` sẽ kêu macOS cứ "đạp ga hết cỡ" nhanh nhất có thể, trong khi `FF` sẽ kêu macOS cứ "từ từ thôi em", cho CPU tăng tốc từ từ một cách thong thả nên lâu hơn. Giống như bạn chuyển chế độ Sport hoặc Balanced trên xe hơi vậy. Tùy vào việc bạn làm gì và tản nhiệt máy bạn ra sao, bạn có thể chọn mức ở giữa. Bảng dưới đây giúp bạn tham khảo:

| EPP | Speed (Tốc độ/Chiến thuật) |
| :--- | :--- |
| 0x00-0x3F | Max Performance (Hiệu năng tối đa) |
| 0x40-0x7F | Balance performance (Cân bằng hiệu năng) |
| 0x80-0xBF | Balance power (Cân bằng điện năng (Giảm hiệu năng một chút) để tiết kiệm điện) |
| 0xC0-0xFF | Max Power Saving (Tiết kiệm điện tối đa) |

**Lưu ý**: Chỉ có SMBIOS Skylake và mới hơn mới hỗ trợ chính thức EPP

### Performance Bias (Thiên hướng hiệu năng)

![](../images/post-install/pm-md/pm-bias.png)

Mục cuối cùng này giúp macOS hiểu bạn muốn CPU chạy với hiệu năng tổng thể như thế nào. Khuyến nghị chung phụ thuộc vào cấu hình cụ thể của bạn, việc thử nghiệm sẽ giúp tìm ra cái tốt nhất. Tức là nếu bạn chọn SMBIOS MacBook Pro thì máy tính có xu hướng giữ xung nhịp cao hơn tiêu chuẩn của Intel để chạy nhanh hơn khi tải thấp (cảm giác máy chạy bốc hơn), còn MacBook Air thì máy có xu hướng chạy với tốc độ thấp hơn để tránh máy bị quá nóng do thiết kế tản nhiệt hạn chế (máy chạy từ tốn).


### Tổng kết

![](../images/post-install/pm-md/done.png)
![](../images/post-install/pm-md/files.png)

Xong xuôi hết thì bạn sẽ nhận được 2 tệp CPUFriendDataProvider.kext và ssdt_data.aml. Chọn cái nào là tùy bạn (sử dụng 1 trong 2) nhưng mình khuyên sử dụng dạng kext để tránh nhức đầu với vụ nạp dữ liệu vào Windows và Linux.

* **Lưu ý**: Thứ tự load (nạp) không quan trọng với CPUFriendDataProvider vì nó chỉ là kext chứa file plist thôi.
* **Lưu ý số 2**: Các vấn đề khi máy tính thức dậy (wake) sau khi xài CPUFriend thường là do dữ liệu điều phối điện năng bị sai. Mỗi hệ thống máy tính là độc nhất vô nhị nên bạn cần vọc vạch nhiệt tình một chút cho đến khi tìm được cấu hình ổn định. Nếu bị Kernel panic (màn hình xanh chết chóc của Mac) với lỗi `Sleep Wake failure in efi` thì chính là nó đó. Sử dụng lại dữ liệu điều phối điện năng của phiên bản macOS cũ cũng có thể gây lỗi, nên hãy tạo lại data provider (bộ cung cấp dữ liệu) nếu bạn cập nhật macOS. Bạn có thể tạo nhiều data provider và sử dụng tính năng MinKernel/MaxKernel của OpenCore để nạp dữ liệu khác nhau cho từng bản macOS.
* **Lưu ý số 3**: Nếu bạn chọn sử dụng ssdt_data.aml, lưu ý là SSDT-PLUG không cần thiết nữa. Tuy nhiên cách thiết lập SSDT này gây lỗi trên các nền tảng máy tính HEDT (máy trạm/máy chủ) như X99 và X299, nên tụi mình cực lực khuyên xài SSDT-PLUG với CPUFriendDataProvider.kext như 1 lựa chọn thay thế.

## Điều phối điện năng cho đời Sandy và Ivy Bridge

Với Sandy và Ivy Bridge, PC phổ thông hay gặp lỗi khi kết nối với XCPM của Apple. Để lách qua cái này, chúng ta cần tự tạo Bảng Điều phối Điện năng (Power Management Table) riêng.

Đồ nghề cần có:

* Bảo đảm bảng CpuPm và Cpu0Ist **KHÔNG BỊ** dropped (bỏ qua).
* [ssdtPRGen](https://github.com/Piker-Alpha/ssdtPRGen.sh)

Ban đầu trong phần thiết lập Ivy Bridge, tụi mình khuyên bạn đọc tạm thời drop bảng CpuPm và Cpu0Ist để tránh lỗi với AppleIntelCPUPowerManagement.kext. Nhưng làm thoe phương pháp này gây tác dụng phụ là làm tính năng turbo boost trong Windows bị hư. Để sửa cái này, chúng ta sẽ giữ lại bảng của OEM (nhà sản xuất gốc) nhưng thêm một bảng mô tả mới để bổ sung dữ liệu chỉ dành cho macOS. Sau khi tạo xong bảng CPU-PM, chúng ta sẽ thêm lại các SSDT CPU gốc của OEM.

Bắt đầu nào, mở config.plist lên rồi vào ACPI -> Delete và đảm bảo cả hai mục này đều có `Enabled` set to YES:

| Key | Type | Value |
| :--- | :--- | :--- |
| All | Boolean | YES |
| Comment | String | Drop CpuPm |
| Enabled | Boolean | YES |
| OemTableId | Data | 437075506d000000 |
| TableLength | Number | 0 |
| TableSignature | Data | 53534454 |

| Key | Type | Value |
| :--- | :--- | :--- |
| All | Boolean | YES |
| Comment | String | Drop Cpu0Ist |
| Enabled | Boolean | YES |
| OemTableId | Data | 4370753049737400 |
| TableLength | Number | 0 |
| TableSignature | Data | 53534454 |

Xong thì khởi động lại, tải ssdtPRGen về và chạy nó:

![](../images/post-install/pm-md/prgen-run.png)

Chạy xong, bạn sẽ có một file SSDT.aml nằm ở `/Users/<tên-bạn>/Library/ssdtPRGen/ssdt.dsl`, bạn có thể tìm nhanh bằng tổ hợp phím Cmd+Shift+G và dán `~/Library/ssdtPRGen/` vào.

![](../images/post-install/pm-md/prgen-done.png)

Nhớ thêm cái này vào cả thư mục EFI/OC/ACPI và config.plist của bạn nha, mình khuyên nên đổi tên nó thành SSDT-PM cho dễ tìm.

Cuối cùng, chúng ta có thể vô hiệu hóa các mục trong ACPI -> Delete trước đó (`Enabled` set về NO):

| Key | Type | Value |
| :--- | :--- | :--- |
| All | Boolean | YES |
| Comment | String | Drop CpuPm |
| Enabled | Boolean | NO |
| OemTableId | Data | 437075506d000000 |
| TableLength | Number | 0 |
| TableSignature | Data | 53534454 |

| Key | Type | Value |
| :--- | :--- | :--- |
| All | Boolean | YES |
| Comment | String | Drop Cpu0Ist |
| Enabled | Boolean | NO |
| OemTableId | Data | 4370753049737400 |
| TableLength | Number | 0 |
| TableSignature | Data | 53534454 |

### Khắc phục sự cố ssdtPRgen (nếu có)

Mặc dù ssdtPRgen cố gắng xử lý mọi vấn đề không tương thích với SSDT của OEM, bạn có thể vẫn thấy nó "đá nhau" khi khởi động vì OEM của bạn đã khai báo sẵn một số thiết bị hoặc phương thức trong các phần như `_INI` hoặc `_DSM`.

Nếu khi khởi động bạn thấy lỗi kiểu như này từ SSDT-PM:

```
ACPI Error: Method parse/execution failed [\_SB._INI] , AE_ALREADY_EXIST
```

Nghĩa là có xung đột rồi, để giải quyết, mình khuyên bạn nên chuyển thông tin của ssdtPRgen sang định dạng như thế này:

```c
DefinitionBlock ("ssdt.aml", "SSDT", 1, "APPLE ", "CpuPm", 0x00021500)
{
    External (\_PR_.CPU0, DeviceObj) // External Processor definition
    External (\_PR_.CPU1, DeviceObj) // External Processor definition

    Scope (\_PR_.CPU0) // Processor's scope
    {
        Name (APLF, Zero)
        Name (APSN, 0x04)
        Name (APSS, Package (0x20)
        {
            /*  … */
        })

        Method (ACST, 0, NotSerialized)
        {
            /*  … */
        }

        /*  … */
    }
```

Chú ý kỹ những gì chúng ta vừa làm:

* Bảo đảm đối tượng Processor (Bộ xử lý) được chuyển sang external (bên ngoài).
* Chuyển tất cả các phương thức của bạn vào trong scope (phạm vi) của Processor.

Để chỉnh sửa và biên dịch lại SSDT-PM, đọc tại đây: [Khởi đầu với ACPI](https://dortania.github.io/Getting-Started-With-ACPI/)

### Khắc phục sự cố trong BIOS

Với một số bo mạch chủ, bạn có thể cần phải bảo đảm mấy cái cài đặt BIOS sau được thiết lập chuẩn cho Điều phối điện năng CPU:

* C States: `True`
* P States Coordination: `SW_ALL`

## Điều phối điện năng cho CPU AMD

Mặc dù macOS không chính thức hỗ trợ tính năng điều phối điện năng cho CPU của AMD, cộng đồng đã nỗ lực thêm vào, cụ thể là kext [AMDRyzenCPUPowerManagement](https://github.com/trulyspinach/SMCAMDProcessor).

**Cảnh báo**: Kext này nổi tiếng là không ổn định, nếu bạn gặp kernel panic ngẫu nhiên hoặc lỗi khi khởi động máy thì hãy nhớ rằng thủ phạm có thể là kext này đó.
