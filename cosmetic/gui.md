# Chăm sóc sắc đẹp cho OpenCore

Phần này mình sẽ tập trung vào 2 món chính:

* [Thiết lập giao diện đồ họa (GUI) cho OpenCore](#thiet-lap-giao-dien-đo-hoa-gui-cho-opencore)
* [Cài đặt tiếng chuông khởi động](#cai-dat-tieng-chuong-khoi-dong-voi-audiodxe)

## Thiết lập giao diện đồ họa (GUI) cho OpenCore

Để bắt đầu, bạn cần OpenCore bản 0.5.7 trở lên vì các bản này mới tích hợp sẵn các file giao diện. Nếu đang xài bản cũ hơn thì nên cập nhật tại đây: [Cập nhật OpenCore](../universal/update.md)

Xong xuôi thì mình cần thêm vài "nguyên liệu" sau:

* [Dữ liệu hình ảnh/âm thanh hệ thống](https://github.com/acidanthera/OcBinaryData)
* [Driver quản lý giao diện đồ hoạ: OpenCanopy.efi](https://github.com/acidanthera/OpenCorePkg/releases)
  * Lưu ý: File OpenCanopy.efi phải cùng phiên bản với bộ OpenCore bạn đang dùng, lệch pha là dễ bị lỗi boot lắm nha.

Có đủ rồi thì mình bỏ vô phân vùng EFI thôi:

* Giải nén dữ liệu hình ảnh/âm thanh hệ thống vừa tải rồi copy [thư mục Resources](https://github.com/acidanthera/OcBinaryData) vào trong thư mục EFI/OC
* Copy file OpenCanopy.efi vào EFI/OC/Drivers

![](../images/extras/gui-md/folder-gui.png)

Bây giờ trong file config.plist, có 4 chỗ cần sửa:

* `Misc -> Boot -> PickerMode`: `External` (Để OpenCore biết là mình muốn sử dụng gói giao diện mới cài đặt thay vì cái hiển thị giao diện bảng chọn màu đen trắng cổ điển).
* `Misc -> Boot -> PickerAttributes`: `17`
  * Con số này giúp bật hỗ trợ chuột/trackpad cũng như đọc file icon .VolumeIcon.icns từ ổ đĩa, giúp bộ cài macOS hiện đúng icon đẹp đẽ.
    * Các thiết lập khác cho PickerAttributes có thể tìm thấy trong file [Configuration.pdf](https://github.com/acidanthera/OpenCorePkg/blob/master/Docs/Configuration.pdf)
* `Misc -> Boot -> PickerVariant`: `Acidanthera\GoldenGate`
  * Các bộ icon bạn có thể chọn:
    * `Auto` — Tự động chọn icon dựa trên màu nền mặc định.
    * `Acidanthera\Syrah` — Bộ icon tiêu chuẩn.
    * `Acidanthera\GoldenGate` — Bộ icon kiểu mới (tân thời).
    * `Acidanthera\Chardonnay` — Bộ icon kiểu cổ điển.
* `UEFI -> Drivers` thêm file OpenCanopy.efi vào danh sách này.

Lưu lại rồi khởi động lại máy, bạn sẽ thấy một giao diện cực kỳ "chanh sả" y hệt Mac xịn:

| Mặc định (Syrah) | Hiện đại (GoldenGate) | Cổ điển (Chardonnay) |
| :--- | :--- | :--- |
| ![](../images/extras/gui-md/gui.png) | ![](../images/extras/gui-md/gui-nouveau.png) | ![](../images/extras/gui-md/gui-old.png) |

## Cài đặt tiếng chuông khởi động

Để có tiếng "toong" huyền thoại khi khởi động macOS y chang con Mac thiệt, máy bạn cần đáp ứng các điều kiện sau:

* Phải là card âm thanh tích hợp trên mainboard (Onboard audio).
  * DAC rời qua cổng USB thôi nghỉ chơi luôn.
  * Âm thanh qua cổng HDMI/DP của card màn hình (GPU) thì hên xui.
* File driver [AudioDxe](https://github.com/acidanthera/OpenCorePkg/releases) bỏ vào EFI/OC/Drivers và nhớ khai báo trong UEFI -> Drivers
* [Dữ liệu hình ảnh/âm thanh hệ thống](https://github.com/acidanthera/OcBinaryData)
  * Copy thư mục Resources vào EFI/OC giống như lúc làm giao diện cho OpenCore ở trên.
  * Nếu phân vùng EFI trên máy bạn hết dung lượng, chỉ cần giữ lại file `OCEFIAudio_VoiceOver_Boot.mp3` là đủ để nghe tiếng chuông rồi.
* Được thì nên xài bản OpenCore Debug để tiện theo dõi log.
  * Đọc thêm [Gỡ lỗi OpenCore](https://baokhanhwithfriends.github.io/Huong-dan-cai-dat-OpenCore/troubleshooting/debug.html) để biết thêm chi tiết
  * Lưu ý: Sau khi setup xong và nghe tiếng chuông rồi thì có thể quay về dùng bản RELEASE cho mượt.

**Thiết lập NVRAM**:

* NVRAM -> Add -> 7C436110-AB2A-4BBB-A880-FE41995C9F82:
  * `SystemAudioVolume | Data | 0x46`
  * Đây là mức âm lượng của chuông và trình đọc màn hình. Lưu ý nó ở hệ thập lục phân (hexadecimal), `0x46` tương đương với `70` ở hệ thập phân; `0x80` là tắt tiếng.

::: details Các mục NVRAM tùy chọn

* NVRAM -> Add -> 7C436110-AB2A-4BBB-A880-FE41995C9F82:
  * `StartupMute | Data | 0x00`
  * Tắt tiếng chuông khởi động ở cấp độ vi chương trình (firmware); `0x00` là mở tiếng, nếu thiếu biến này hoặc đặt giá trị khác thì sẽ bị tắt tiếng.
:::

**Thiết lập UEFI -> Audio:**

* **AudioCodec:** (Giá trị Number)
  * Địa chỉ Codec của bộ điều khiển âm thanh. Thường là địa chỉ đầu tiên của chip âm thanh tích hợp (HDEF). Giá trị mặc định an toàn là 0.
  * Cách tìm:
    * Dùng [IORegistryExplorer](https://github.com/khronokernel/IORegistryClone/blob/master/ioreg-302.zip) -> Tìm đến nhánh HDEF -> AppleHDAController -> IOHDACodecDevice và xem thuộc tính `IOHDACodecAddress` (VD: `0x0`)
    * Hoặc kiểm tra qua Terminal (lưu ý nếu hiện ra nhiều cái, hãy sử dụng Vendor ID để tìm đúng thiết bị):

      ```sh
      ioreg -rxn IOHDACodecDevice | grep VendorID   # Liệt kê tất cả các thiết bị có thể
      sh ioreg -rxn IOHDACodecDevice | grep IOHDACodecAddress # Lấy địa chỉ codec
      ```

* **AudioDevice:** (Giá trị String)
  * Đường dẫn thiết bị (PciRoot) của bộ điều khiển âm thanh.
  * Xài công cụ [gfxutil](https://github.com/acidanthera/gfxutil/releases) để tìm đường dẫn:
    * `/đường/dẫn/đến/gfxutil -f HDEF`
    * VD: `PciRoot(0x0)/Pci(0x1f,0x3)`

* **AudioOutMask:** (Giá trị Number)
  * Phát âm thanh trong môi trường UEFI qua nhiều kênh (ví dụ: loa chính cộng với loa trầm). Giá trị mặc định là `-1` (phát ra tất cả).
  * Các kênh đầu ra được đánh số nội bộ là bit `0` (giá trị `1`), bit `1` (giá trị `2`), v.v. Giá trị `1` biểu thị đầu ra âm thanh đầu tiên (không nhất thiết là loa chính). Giá trị `-1` được sử dụng để phát đồng thời trên tất cả các kênh.
  * Khi AudioSupport được bật, AudioDevice phải trống hoặc là một đường dẫn hợp lệ và AudioOutMask phải khác không.
  * Cách đơn giản nhất để tìm đúng kênh là thử từng cái một (từ 2^0 đến 2^(N - 1), với N là số lượng đầu ra hiện trong log); ví dụ: 5 đầu ra thì các giá trị có thể là 1/2/4/8/16.
  * Bạn có thể tìm danh sách đầu ra của mình trong log debug của OpenCore:

    ```
    06:065 00:004 OCAU: Matching PciRoot(0x0)/Pci(0x1F,0x3)/VenMsg(A9003FEB-D806-41DB-A491-5405FEEF46C3,00000000)...
    06:070 00:005 OCAU: 1/2 PciRoot(0x0)/Pci(0x1F,0x3)/VenMsg(A9003FEB-D806-41DB-A491-5405FEEF46C3,00000000) (5 outputs) - Success
    ```

* **AudioSupport:** (Gía trị Boolean)
  * Đặt cái này thành `True`
  * Việc bật cài đặt này sẽ định tuyến quá trình phát lại âm thanh từ các giao thức tích hợp sẵn đến các cổng âm thanh chuyên dụng được chỉ định (AudioOutMask) của codec được chỉ định (AudioCodec), nằm trên bộ điều khiển âm thanh được chỉ định (AudioDevice).

* **DisconnectHDA:** (Giá trị Boolean)
  * Đặt thành `False`

* **MaximumGain:** (Giá trị Number)
  * Mức khuếch đại tối đa được phép sử dụng cho âm thanh UEFI, được chỉ định bằng decibel (dB) so với mức tham chiếu của bộ khuếch đại là 0 dB.
  * Đặt cái này thành `-15`

* **MinimumAssistGain:** (Giá trị Number)
  * Minimum gain in decibels (dB) to use for picker audio assist. The screen reader will use this amplifier gain if the system amplifier gain read from the SystemAudioVolumeDB NVRAM variable is lower than this
  * Đặt cái này thành `-30`

* **MinimumAudibleGain:** (Giá trị Number)
  * Mức tăng tối thiểu tính bằng decibel (dB) mà bạn có thể thử phát bất kỳ âm thanh nào.
  * Đặt cái này thành `-55`

* **PlayChime:** (Giá trị String)
  * Đặt cái này thành `Enabled` (kích hoạt)
  * Các giá trị hỗ trợ:
    * `Auto` — Bật chuông khi biến StartupMute trong NVRAM không tồn tại hoặc bằng 00.
    * `Enabled` — Luôn luôn mở chuông.
    * `Disabled` — Luôn luôn tắt chuông.

* **ResetTrafficClass:** (Giá trị Boolean)
  * Đặt cái này thành `False` (vô hiệu hoá)

* **SetupDelay:** (Giá trị Number)
  * Mặc định cứ để là `0`
  * Một số chip âm thanh cần thêm thời gian để "khởi động", nếu gặp lỗi bạn có thể đặt thành `500` miligiây (tức 0.5 giây) nếu bạn gặp trục trặc

Xong xuôi thì bảng cấu hình của bạn trông sẽ giống vầy:

![](../images/extras/gui-md/audio-config.png)

::: tip MẸO NHỎ

Có một số dòng chip như Realtek ALC295 (thường gặp trên máy HP) có tần số lấy mẫu (sampling rate) mặc định là 48 kHz. Trong trường hợp này, dù chip có hỗ trợ 44.1 kHz thì âm thanh vẫn có thể bị lỗi. Cách duy nhất hiện tại là bạn dùng phần mềm chỉnh sửa âm thanh để nâng tần số của file `OCEFIAudio_VoiceOver_Boot.mp3` từ 44.1 kHz lên 48 kHz nhé. Việc này phải được thực hiện thủ công vì OpenCore không có cơ chế tự động hóa nào cho việc đó.

:::

::: tip MẸO

**Lưu ý cho anh em khiếm thị**:

* OpenCore không hề bỏ quên các bạn đâu! Với AudioDxe, bạn có thể bật cả âm thanh hỗ trợ chọn ổ đĩa và tính năng VoiceOver của FileVault bằng 2 thiết lập này:
  * `Misc -> Boot -> PickerAudioAssist -> True` để bật hỗ trợ âm thanh tại menu chọn.
  * `UEFI -> ProtocolOverrides -> AppleAudio -> True` để bật VoiceOver cho FileVault.
* Đọc thêm mục [Bảo mật và mã hóa ổ cứng bằng FileVault](../universal/security.md) để biết cách thiết lập đầy đủ cho FileVault hén.

:::
