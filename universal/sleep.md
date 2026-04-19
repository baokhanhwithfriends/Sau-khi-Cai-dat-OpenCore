# Sửa chế độ ngủ không hoạt động

Để bắt bệnh "mất ngủ cấp tính" trên macOS, trước tiên chúng ta cần ngó qua xem cái gì thường gây ra tình trạng này:

* Các thiết bị không được quản lý đúng cách - thường là thiết bị PCIe

Lý do là khi các thiết bị nhận được lệnh S3 (lệnh đi ngủ) hoặc S0 (lệnh thức dậy), trình điều khiển (driver) cần phải ngắt điện thiết bị hoặc đưa nó vào chế độ năng lượng thấp (và thực hiện thao tác ngược lại khi thức dậy). Vấn đề nảy sinh khi mấy thiết bị này "chống đối" driver, không chịu hợp tác. Mấy ông thần hay gây rối nhất là:

* Bộ điều khiển và các thiết bị USB đang cắm vào cổng
* Card màn hình (thường là do không có driver điều khiển nó hoặc driver điều khiển không chính xác)
* Bộ điều khiển và các thiết bị Thunderbolt đang cắm vào cổng
* NICs (Card mạng - Cả mạng dây LAN và không dây Wi-Fi)
* Ổ cứng SSD NVMe

Và còn vài thứ khác cũng gây tình trạng máy bị mất ngủ mà không liên quan trực tiếp (hoặc rõ ràng) đến PCI/e:

* CPU chưa kích hoạt tính năng Điều phối điện năng 
* Màn hình
* Bộ nhớ NVRAM
* RTC/Đồng hồ hệ thống
* Xung đột IRQ
* Card/codec giải mã âm thanh
* SMBus chưa được kích hoạt
* Chưa vá TSC

Và một thứ mà nhiều người quên béng đi là việc ép xung (overclock) hoặc hạ xung (underclock):

* CPU
  * AVX thường làm iGPU chạy không bình thường và ảnh hưởng đến độ ổn định chung của hệ điều hành.
* Xài trúng RAM đểu hoặc giữa các thanh RAM không đồng bộ về xung nhịp
  * Ngay cả khi chỉnh timing (độ trễ) sai hoặc không khớp cũng gây lỗi nghiêm trọng.
* Mấy cái loại card màn hình được nhà sản xuất ép xung sẵn
  * Mấy ông OEM thường thích đẩy xung nhịp của card lên quá đà bằng VBIOS do họ tùy chỉnh riêng
  * Thường mấy cái card này sẽ có cái công tắc vật lý, cho phép bạn gạt chuyển sang VBIOS tiết kiệm điện hơn (low power VBIOS)

## Công tác chuẩn bị

**Trong macOS**:

Trước khi đi quá sâu, chúng ta cần "làm nóng" hệ thống cái nha:

```
sudo pmset autopoweroff 0
sudo pmset powernap 0
sudo pmset standby 0
sudo pmset proximitywake 0
sudo pmset tcpkeepalive 0
```

Mấy lệnh này sẽ làm 5 việc cho chúng ta:

1. Tắt autopoweroff: Đây là một dạng chế độ ngủ đông (hibernation).
2. Tắt powernap: Sử dụng để định kỳ đánh thức máy để kiểm tra mạng và cập nhật trạng thái các ứng dụng (nhưng không mở màn hình).
3. Tắt standby: Thời gian chờ của chế độ ngủ thường trước khi chuyển sang ngủ đông.
4. Tắt đánh thức từ iPhone/Watch: Cụ thể là khi iPhone hoặc Apple Watch của bạn lại gần thì máy sẽ tự dậy.
5. Tắt cơ chế TCP Keep Alive để ngăn máy tự bật dậy mỗi 2 tiếng để kiểm tra kết nối.

**Trong config.plist của bạn**:

Chỉ cần chỉnh tí xíu thôi, đây là mấy cái chúng ta quan tâm:

* `Misc -> Boot -> HibernateMode -> None`
  * Chúng ta sẽ né cái "ma thuật hắc ám" S4 (Ngủ đông) trong hướng dẫn này.
* `NVRAM -> Add -> 7C436110-AB2A-4BBB-A880-FE41995C9F82 -> boot-args`
  * `keepsyms=1` - Bảo đảm là nếu có kernel panic (màn hình lỗi) xảy ra khi đưa máy vào chế độ ngủ, chúng ta sẽ xem được các thông tin quan trọng, để xác định chính xác cái gì gây máy ngủm luôn trong khi ngủ.
  * `swd_panic=1` - Tránh việc máy tự khởi động lại khi gặp lỗi lúc ngủ, thay vào đó nó sẽ hiện log lỗi kernel panic cho mình xem.

**Trong BIOS của bạn**:

* Vô hiệu hóa các tính năng sau:
  * Wake on LAN (Đánh thức qua mạng LAN).
  * Trusted Platform Module (TPM).
    * Lưu ý là nếu bạn đang sử dụng BitLocker trên Windows, tắt cái này là mất hết khóa mã hóa đó nha. Nếu xài BitLocker thì một là tắt BitLocker, hai là chấp nhận nó có thể là nguyên nhân gây lỗi máy mất ngủ.
  * Wake on USB (Một số mainboard bắt buộc phải bật cái này mới đánh thức máy được, nhưng đa số sẽ bị hiện tượng máy tự dậy ngẫu nhiên).
* Kích hoạt tính năng sau:
  * Wake on Bluetooth (Nếu bạn xài thiết bị Bluetooth để đánh thức máy như bàn phím, chuột, còn không thì tắt đi cũng được).
  
## Đi xử lý thủ phạm chính

* [Sửa lỗi USB gây mất ngủ](#sua-loi-usb-gay-mat-ngu)
* [Sửa lỗi card màn hình gây mất ngủ](l#sua-loi-card-man-hinh-gay-mat-ngu)
* [Sửa lỗi Thunderbolt gây mất ngủ](#sua-loi-thunderbolt-gay-mat-ngu)
* [Sửa card mạng (NICs) gây mất ngủ](#sua-card-mang-nics-gay-mat-ngu)
* [Sửa ổ cứng NVMe gây mất ngủ](#sua-o-cung-nvme-gay-mat-ngu)
* [Sửa lỗi điều phối điện năng CPU gây mất ngủ](#sua-loi-đieu-phoi-đien-nang-cpu-gay-mat-ngu)

### Sửa lỗi USB gây mất ngủ

Đây là nguyên nhân số #1 gây ra lỗi mất ngủ trên Hackintosh, do driver của Apple đoán cổng rất tệ (khi mấy cổng USB trên máy bạn không giống như bản đồ USB mà Apple lập trình cứng cho SMBIOS đó) và mấy cái bản vá giới hạn cổng (port limit patches) gây mất ổn định.

* [Lập sơ đồ USB](../usb/README.md)

Hướng dẫn này bao gồm cả mấy cách sửa lỗi khác ngoài việc lập sơ đồ cho từng cổng:

* [Sửa cấp nguồn USB không đúng điện áp](../usb/misc/power.md)
* [Sửa lỗi không tắt máy/khởi động lại được](../usb/misc/shutdown.md)
* [Sửa lỗi dậy tức thì khi mới ngủ (GPRW/UPRW/LANC)](../usb/misc/instant-wake.md)
* [Sửa lỗi không đánh thức máy được bằng bàn phím](../usb/misc/keyboard.md)

**Lập sơ đồ USB trên macOS Catalina (10.15) và mới hơn**: Bạn có thể thấy là dù đã map USB rồi nhưng máy vẫn gặp tình trạng mất ngủ mãn tính. Một giải pháp khả thi là đổi tên giá trị IOClass từ `AppleUSBMergeNub` sang `AppleUSBHostMergeProperties`. Xem thêm tại đây: [Changes in Catalina's USB IOClass](https://github.com/dortania/bugtracker/issues/15)

* Lưu ý: Một số thiết bị USB không có driver chuẩn trên macOS, thiệt không may cũng có thể gây ra bệnh mất ngủ. Ví dụ, tản nhiệt nước Corsair với cổng điều khiển USB có thể ngăn máy đi ngủ. Với mấy ca này, tụi mình khuyên bạn nên rút mấy thiết bị "khó ở" này ra khi đang debug lỗi ngủ.

### Sửa lỗi card màn hình gây mất ngủ

Với card màn hình, khá dễ để xác định chính xác cái gì gây ra lỗi. Đó là mấy cái card màn hình không được hỗ trợ trên macOS. Mặc định, bất kỳ GPU nào không có driver trong hệ điều hành sẽ chạy bằng driver cơ bản kêu là VESA drivers. Mấy cái này chỉ giúp xuất hình cơ bản thôi nhưng gây ra vấn đề lớn là macOS không biết cách tương tác đúng với nó (để tắt/mở nguồn). Để sửa cái này, chúng ta cần lừa macOS nghĩ nó là một thiết bị PCIe chung chung (để macOS xử lý tốt hơn, lý tưởng cho máy bàn) hoặc gạt cầu dao cúp điện hoàn toàn cái card đó (trên laptop, còn card màn hình rời của máy bàn thì khó chơi chiêu cúp cầu dao điện hơn).

* Xem thêm tại đây để biết cách cúp cầu dao điện mấy cái card này:
  * [Vô hiệu hóa card màn hình không được hỗ trợ trên máy bàn](https://baokhanhwithfriends.github.io/Khoi-dau-voi-ACPI/Desktops/desktop-disable)
  * [Vô hiệu hóa card màn hình rời không được hỗ trợ (NUC, Laptop và AIO)](https://dortania.github.io/Getting-Started-With-ACPI/Laptops/laptop-disable)

Lưu ý đặc biệt cho bạn đọc xài máy chỉ có iGPU trên bản 10.15.4 và trở về sau:

* Việc đánh thức card màn hình onboard lúc được lúc không là do hàng tá các thủ thuật mà thằng táo cắn dở sử dụng trong AppleGraphicsPowerManagement.kext trên máy Mac thiệt. Để lách qua cái này bạn có thể cần bổ sung tham số khởi động `igfxonln=1` để ép tất cả màn hình phải online. Dĩ nhiên là phải test xem bạn có bị lỗi này không nha. Nếu không bị thì bạn không cần thêm đâu.
* Giá trị AAPL,ig-platform-id `07009B3E` có thể bị lỗi với một số máy bàn đời Coffee Lake (UHD 630), do đó bạn có thể thử `00009B3E` để thay thế. Giá trị `0300923E` cũng được ghi nhận là hoạt động trong một số trường hợp.
Các lưu ý khác về iGPU:
* Một số máy tính xài iGPU (ví dụ Kaby Lake và Coffee Lake) có thể gặp tình trạng mất ổn định hệ thống khi phần cứng vào chế độ trạng thái sử dụng năng lượng thấp, đôi khi biểu hiện thành lỗi kernel panic NVMe. Để sửa lỗi, bạn có thể bổ sung tham số `forceRenderStandby=0` vào trong boot-args để tắt RC6 Render Standby. Xem thêm tại: [IGP causes NVMe Kernel Panic CSTS=0xffffffff #1193](https://github.com/acidanthera/bugtracker/issues/1193)
* Một số laptop Ice Lake cũng có thể bị lỗi kernel panic `Cannot allow DC9 without disallowing DC6` do máy tính gặp lỗi khi chuyển trạng thái nguồn điện. Cách giải quyết là bổ sung tham số `-noDC9` hoặc `-nodisplaysleepDC6` vô trong boot-args.

Lưu ý đặc biệt với bạn đọc đang xài Màn hình 4K kết nối với card màn hình rời của AMD:

* Một số màn hình có thể không chịu dậy (lỗi này xuất hiện ngẫu nhiên), thường là do các thiết lập AGDC từ Apple. Để sửa lỗi này, bạn bổ sung cái này vào trong đường dẫn PciRoot của card màn hình trong DeviceProperties:
  * `CFG,CFG_USE_AGDC | Data | 00`
  * Bạn có thể tìm PciRoot của GPU bằng [gfxutil](https://github.com/acidanthera/gfxutil/releases)
    * `/path/to/gfxutil -f GFX0`

![](../images/post-install/sleep-md/agdc.png)

### Sửa lỗi Thunderbolt gây mất ngủ

Thunderbolt là một chủ đề cực kỳ "khoai" trong cộng đồng Hackintosh, do độ phức tạp của nó. Bạn thực sự chỉ có 2 con đường để tiếp tục nếu muốn cả Thunderbolt và chế độ ngủ cùng hoạt động:

* Tắt Thunderbolt 3 trong BIOS.
* Cố gắng vá cho Thunderbolt 3 chạy được:
  * [Sửa lỗi Thunderbolt 3](https://osy.gitbook.io/hac-mini-guide/details/thunderbolt-3-fix/)
  * [ThunderboltReset](https://github.com/osy86/ThunderboltReset)
  * [ThunderboltPkg](https://github.com/al3xtjames/ThunderboltPkg/blob/master/Docs/FAQ.md)

Lưu ý: Thunderbolt có thể hoạt động mà không cần làm gì thêm *nếu* bạn chấp nhận không bao giờ sử dụng chế độ ngủ và ngược lại.

### Sửa card mạng (NICs) gây mất ngủ

Riêng với NICs (Network Interface Controllers) khá dễ sửa lỗi mất ngủ, nguyên nhân chính là do mấy cái sau:

* Vô hiệu hóa tính năng `WakeOnLAN` có trong BIOS
  * Đa số máy tính sẽ rơi vào vòng lặp ngủ/thức (sleep/wake loop) nếu mở cái này.
* Vô hiệu hóa `Wake for network access` (Tự động thức dậy khi có kết nối mạng) trong macOS (SystemPreferences -> Power)
  * Cái tính năng này có vẻ gây lỗi trên rất nhiều máy Hackintosh.
  
### Sửa ổ cứng NVMe gây mất ngủ

macOS khá là "kén cá chọn canh" khi nói đến ổ NVMe, đặc biệt vấn đề chính là driver quản lý điện năng của Apple chỉ hỗ trợ ổ cứng "chính chủ" Apple thôi. Nên những việc chính cần làm là:

* Bảo đảm ổ cứng NVMe đang chạy firmware (vi chương trình) mới nhất (đặc biệt quan trọng với [ổ 970 Evo Plus](https://www.tonymacx86.com/threads/do-the-samsung-970-evo-plus-drives-work-new-firmware-available-2b2qexm7.270757/page-14#post-1960453))
* Sử dụng [NVMeFix.kext](https://github.com/acidanthera/NVMeFix/releases) để giúp macOS điều phối điện năng cho ổ cứng NVMe không phải thương hiệu Apple chuẩn hơn.

Và tránh xa các ổ cứng có tiền sử "bất hảo", mấy gương mặt tiêu biểu là:

* SSD Samsung PM981 và PM991
* SSD Micron 2200S

Nếu lỡ mua mấy ổ này rồi, tốt nhất là bạn nên vô hiệu hóa nó bằng SSDT: [Vô hiệu hóa card màn hình không được hỗ trợ trên máy bàn](https://baokhanhwithfriends.github.io/Khoi-dau-voi-ACPI/Desktops/desktop-disable).
Hướng dẫn này được viết cho card màn hình rời trên máy bàn nhưng bạn có thể áp dụng y chang cho ổ NVMe (vì cả hai đều là thiết bị PCIe).
  
### Sửa lỗi Điều phối điện năng CPU gây mất ngủ

**Với Intel**:

Để kiểm tra xem Điều phối điện năng CPU có hoạt động không, đọc trang [Sửa lỗi điều phối điện năng nâng cao](../universal/pm.md).

Cũng lưu ý là dữ liệu điều phối điện năng sai lệch với đời CPU của máy cũng có thể gây lỗi khi máy cố gắng thức dậy, nên hãy kiểm tra xem bạn đang dùng đúng SMBIOS với đời máy chưa nhé.

Lỗi kernel panic phổ biến khi đánh thức máy là:

```
Sleep Wake failure in EFI
```

**Với AMD**:

Đừng lo, vẫn còn tia hy vọng cho các bạn! [AMDRyzenCPUPowerManagement.kext](https://github.com/trulyspinach/SMCAMDProcessor) có thể bổ sung thêm khả năng điều phối điện năng cho các CPU Ryzen. Cách cài đặt và sử dụng có trong file README.md của repo đó.

## Các thủ phạm khác

* [Sửa lỗi cảm biến phát hiện gập màn hình gây mất ngủ](#sua-loi-cam-bien-phat-hien-gap-man-hinh-gay-mat-ngu)
* [Sửa lỗi NVRAM gây mất ngủ](#sua-loi-nvram-gay-mat-ngu)
* [Sửa lỗi RTC gây mất ngủ](#sua-loi-rtc-gay-mat-ngu)
* [Sửa lỗi xung đột IRQ gây mất ngủ](#sua-loi-xung-đot-irq-gay-mat-ngu)
* [Sửa lỗi card/codec giải mã âm thanh gây mất ngủ](#sua-loi-card-codec-giai-ma-am-thanh-gay-mat-ngu)
* [Sửa lỗi SMBus chưa được nhận diện gây mất ngủ](l#sua-loi-smbus-chua-đuoc-nhan-dien-gay-mat-ngu)
* [Sửa lỗi TSC gây mất ngủ](#sua-loi-tsc-gay-mat-ngu)

### Sửa lỗi cảm biến phát hiện gập màn hình gây mất ngủ

Vấn đề về gập màn hình mà máy mất ngủ liên quan đến cảm biến phát hiện gập màn hình laptop (lid detection), cụ thể là:

* Bạn đã tạo SSDT-PNLF không chính xác với máy của mình.
* Xung đột giữa việc hệ điều hành và firmware xử lý việc gập máy.
* Bàn phím tự spam nút liên tục khi mở máy (Trên bàn phím chuẩn PS/2).

Cái đầu tiên khá dễ sửa, đọc tại đây: [Sửa lỗi không chỉnh được độ sáng màn hình PNLF](https://baokhanhwithfriends.github.io/Khoi-dau-voi-ACPI/Laptops/backlight.html)

Cái ở giữa, khả năng phát hiện giở màn hình của macOS hơi bị "ngáo" và bạn có thể cần tắt hẳn nó đi:

```sh
sudo pmset lidwake 0
```

Và set `lidwake 1` để kích hoạt lại.

Cái cuối cùng cần làm nhiều việc hơn chút. Chúng ta sẽ cố gắng ngăn chặn chuyện spam phím ngẫu nhiên xảy ra trên các máy HP sử dụng CPU đời Skylake và mới hơn (mặc dù các hãng khác cũng bị). Cái này giả định bàn phím của bạn là chuẩn PS/2 và đang chạy [VoodooPS2](https://github.com/acidanthera/VoodooPS2/releases).

Để sửa lỗi chết tiệt này, tải [SSDT-HP-FixLidSleep.dsl](https://github.com/acidanthera/VoodooPS2/blob/master/Docs/ACPI/SSDT-HP-FixLidSleep.dsl) về và chỉnh lại đường dẫn ACPI cho khớp với bàn phím của bạn (giá trị `_CID` là `PNP0303`). Xong xuôi thì biên dịch và thả vào cả EFI/OC/ACPI và dưới mục config.plist -> ACPI -> Add.

Với 99% bạn đọc đang xài máy HP, cái này sẽ sửa được lỗi spam phím. Nếu không, xem các bài thảo luận dưới đây:

* [RehabMan's brightness key guide](https://www.tonymacx86.com/threads/guide-patching-dsdt-ssdt-for-laptop-backlight-control.152659/)

### Sửa lỗi NVRAM gây mất ngủ

Để kiểm tra xem bộ nhớ NVRAM hoạt động không, đọc trang [Giả lập bộ nhớ NVRAM](../misc/nvram.md) để kiểm tra xem NVRAM có chạy không. Nếu không thì vá lỗi tương ứng là được.

### Sửa lỗi RTC gây mất ngủ

Cái này liên quan đến bo mạch chủ Intel 300 series (Z3xx), cụ thể là có 2 vấn đề với dòng series chipset này:

* Mặc định RTC bị tắt (thay vào đó dùng AWAC).
* Nếu có RTC thì nó được lập trình theo cách không tương thích với macOS.

Để giải quyết vấn đề đầu tiên, xem tại đây: [Sửa đồng hồ hệ thống không tương tích](https://dortania.github.io/Getting-Started-With-ACPI/Universal/awac.html)

Vấn đề thứ hai, rất dễ nhận biết lỗi RTC khi bạn tắt máy hoặc khởi động lại. Cụ thể là bạn sẽ được chào đón bằng thông báo lỗi "BIOS Restarted in Safemode" (BIOS khởi động lại ở chế độ an toàn). Để sửa, chúng ta cần ngăn macOS ghi vào các vùng RTC gây lỗi. Có vài cách sửa:

* DisableRtcChecksum: Ngăn ghi vào checksum chính (0x58-0x59), cái này sẽ khắc phục được với hầu hết các bo mạch.
* `UEFI -> ProtoclOverride -> AppleRtcRam` + `NVRAM -> Add -> rtc-blacklist`
  * Đưa các vùng nhất định vào danh sách đen ở cấp độ firmware, đọc [Configuration.pdf](https://github.com/acidanthera/OpenCorePkg/blob/master/Docs/Configuration.pdf) để biết thêm chi tiết.
* [RTCMemoryFixup](https://github.com/acidanthera/RTCMemoryFixup) + `rtcfx_exclude=`
  * Đưa các vùng vào danh sách đen ở cấp độ kernel, xem README để biết cách làm.

Với một số bo mạch chủ đời cũ (legacy), bạn có thể cần vá RTC: [Z68 RTC](https://www.insanelymac.com/forum/topic/329624-need-cmos-reset-after-sleep-only-after-login/)

### Sửa lỗi xung đột IRQ gây mất ngủ

Lỗi IRQ thường xảy ra khi khởi động nhưng một số người cũng thấy IRQ gây lỗi ngủ, cách sửa khá dễ:

* [SSDTTime](https://github.com/corpnewt/SSDTTime)
  * Đầu tiên dump DSDT của bạn trong Linux/Windows.
  * Sau đó chọn tùy chọn `FixHPET`

Nó sẽ cung cấp cho bạn cả `SSDT-HPET.aml` và `patches_OC.plist`, bạn thêm SSDT vào EFI/OC/ACPI và thêm các bản vá ACPI vào config.plist từ file patches_OC.plist.

### Sửa lỗi card/codec giải mã âm thanh gây mất ngủ

Các thiết bị âm thanh không được macOS quản lý hoặc quản lý sai cách cũng gây chuyện, hãy vô hiệu hoá các thiết bị âm thanh không sử dụng trong BIOS hoặc kiểm tra xem tụi nó hoạt động đúng cách chưa tại đây:

* [Sửa máy không có tiếng bằng AppleALC](../universal/audio.md)

### Sửa lỗi SMBus chưa được nhận diện gây mất ngủ

Lý do chính bạn quan tâm đến SMBus là driver AppleSMBus của macOS có thể giúp quản lý và điều khiển chính xác SMBus và thiết bị PCI như các lệnh điều khiển trạng thái sử dụng năng lượng. Vấn đề là kext này thường không tự load, nên bạn cần tạo SSDT-SMBS-MCHC.

Xem tại đây để biết cách làm: [Sửa lỗi SMBus chưa được nhận diện](https://baokhanhwithfriends.github.io/Khoi-dau-voi-ACPI/Universal/smbus.html)

### Sửa lỗi TSC gây mất ngủ

TSC (hay viết tắt của Time Stamp Counter - dịch ra là Bộ đếm thời gian) là thành phần chịu trách nhiệm bảo đảm phần cứng của bạn chạy đúng tốc độ, vấn đề là một số firmware (đa phần là máy trạm/máy chủ và Laptop Asus) sẽ không ghi TSC đồng bộ lên tất cả các nhân (core) gây ra lỗi. Để giải quyết, chúng ta có 3 lựa chọn:

* [CpuTscSync](https://github.com/lvs1974/CpuTscSync/releases)
  * Dành cho mấy con laptop "khó ở". Thường là laptop Asus cần kext này
* [VoodooTSCSync](https://bitbucket.org/RehabMan/VoodooTSCSync/downloads/)
  * Dành cho hầu hết phần cứng HEDT (máy trạm).
* [TSCAdjustReset](https://github.com/interferenc/TSCAdjustReset)
  * Dành cho phần cứng Skylake X/W/SP và Cascade Lake X/W/SP.
  
Hai cái đầu là plug and play (cắm là chạy), còn cái cuối cần chỉnh chọt chút cho phù hợp với phần cứng máy của bạn:

* Mở kext ra (ShowPackageContents trong Finder, `Contents -> Info.plist`) và đổi Info.plist -> `IOKitPersonalities -> IOPropertyMatch -> IOCPUNumber` thành số luồng (thread) CPU bạn có, bắt đầu từ `0` (Ví dụ i9 7980xe 18 nhân thì sẽ là `35` vì nó có tổng 36 luồng). Lưu ý cho mình máy tính luôn đếm từ 0 chứ không phải 1 nhé.
* Bản biên dịch sẵn ở đây: [TSCAdjustReset.kext](https://github.com/dortania/OpenCore-Install-Guide/blob/master/extra-files/TSCAdjustReset.kext.zip)

![](../images/post-install/sleep-md/tsc.png)

Cách phổ biến nhất để nhận biết lỗi TSC:

Trường hợp số 1    |  Trường hợp số 2
:-------------------------:|:-------------------------:
![](../images/troubleshooting/troubleshooting-md/asus-tsc.png)  |  ![](../images/troubleshooting/troubleshooting-md/asus-tsc-2.png)
