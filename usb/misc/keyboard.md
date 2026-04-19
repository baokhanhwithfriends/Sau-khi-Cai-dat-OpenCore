# Sửa lỗi không đánh thức máy được bằng bàn phím

Một con bọ (bug) khá dị với mấy cái bo mạch dòng chipset Intel 100 series trở lên là đôi khi macOS bắt bạn phải nhấn phím lần thứ hai hoặc cần một sự kiện đánh thức khác thì mới chịu bật màn hình lên, thậm chí một số máy "khó ở" còn bắt phải nhấn phím + nút nguồn mới chịu dậy. Để trị bệnh này, chúng ta có vài cách:

* [Thiết lập `acpi-wake-type` cho bộ điều khiển USB (Khuyên dùng)](#method-1-add-wake-type-property-recommended)
* [Tạo thêm một thiết bị ACPI](#method-2-create-a-fake-acpi-device)
* [(Tắt darkwake - không lý tưởng lắm, vì các tác vụ nền cũng sẽ làm sáng màn hình)](#method-3-configuring-darkwake)

Bạn có thể tìm thấy một bài viết cực hay về toàn bộ tình huống này và các cách sửa lỗi tại đây: [Sửa lỗi USB](https://osy.gitbook.io/hac-mini-guide/details/usb-fix).

Bài viết đó đọc cuốn lắm, mình cực kỳ khuyên bạn nên đọc để thực sự hiểu *cái quái gì* đang diễn ra, chứ không phải là bạn đọc cái hướng dẫn này với trạng thái chưa đủ mệt hay sao á ;p

## Cách 1 - Bổ sung thuộc tính Wake Type - Khuyên dùng

Cách lý tưởng nhất là tuyên bố với hệ thống rằng XHCI Controller (chính là Bộ điều khiển USB của chúng ta) là một thiết bị đánh thức ACPI, vì chúng ta không có EC (Embedded Controller) tương thích để macOS xử lý các lệnh gọi đánh thức một cách chuẩn chỉ.

Để bắt đầu, chúng ta cần tóm lấy cái PciRoot của Bộ điều khiển USB (chúng ta sẽ dùng [gfxutil](https://github.com/acidanthera/gfxutil/releases), thường thì tên sẽ là XHC, XHC1 và XHCI)

![](../../images/post-install/usb-md/xhci-path.png)

Giờ có PciRoot trong tay rồi, mở config.plist lên và thêm một mục mới dưới DeviceProperties -> Add, rồi thêm cái PciRoot của bạn vào. Sau đó tạo một mục con với các thuộc tính sau:

`acpi-wake-type | Data | <01>`

![](../../images/post-install/usb-md/deviceproperties.png)

## Cách 2 - Bổ sung thiết bị ACPI giả

Phương pháp này tạo ra một thiết bị ACPI giả (fake) sẽ được liên kết với GPE, sau đó bổ sung thuộc tính `acpi-wake-type` bằng USBWakeFixup.kext.

Thực ra thiết lập cũng dễ thôi, bạn cần mấy món sau:

* [USBWakeFixup.kext](https://github.com/osy86/USBWakeFixup/releases)
  * Bỏ vào cả EFI/OC/Kexts và khai báo trong config.plist của bạn.
* [SSDT-USBW.dsl](https://github.com/osy86/USBWakeFixup/blob/master/SSDT-USBW.dsl)

Để tạo SSDT-USBW cho hệ thống cụ thể của bạn, bạn sẽ cần đường dẫn ACPI của bộ điều khiển USB. Nếu nhìn lại ví dụ gfxutil ở trên, chúng ta thấy nó cũng liệt kê đường dẫn ACPI:

* `/PC00@0/XHCI@14` -> `\_SB.PC00.XHCI`

Giờ chúng ta nhét cái đó vào SSDT của mình:

![](../../images/post-install/usb-md/usbw.png)

Xong xuôi thì biên dịch (compile) và thêm nó vào EFI và config.plist. Đọc [Khởi đầu với ACPI](https://dortania.github.io/Getting-Started-With-ACPI/Manual/compile.html) để biết thêm thông tin về việc biên dịch SSDT.

## Cách 3 - Cấu hình darkwake

Trước khi đi sâu vào cấu hình darkwake, tốt nhất là giải thích xem darkwake là cái gì đã. Có một bài viết chuyên sâu cực hay của holyfield tại đây: [DarkWake on macOS Catalina](https://www.insanelymac.com/forum/topic/342002-darkwake-on-macos-catalina-boot-args-darkwake8-darkwake10-are-obsolete/)

Hiểu đơn giản nhất, bạn có thể coi darkwake là "tỉnh dậy một nửa" (partial wake), nơi chỉ một số phần cứng nhất định được bật lên để làm các tác vụ bảo trì trong khi các phần khác vẫn ngủ (ví dụ: Màn hình). Lý do chúng ta quan tâm đến cái này là vì darkwake có thể thêm các bước phụ vào quy trình đánh thức như yêu cầu nhấn phím, nhưng nếu tắt hẳn nó đi thì máy Hackintosh của chúng ta có thể tự bật dậy ngẫu nhiên. Vì vậy lý tưởng nhất là xem qua bảng bên dưới để tìm giá trị phù hợp.

Giờ hãy nhìn vào [mã nguồn IOPMrootDomain](https://opensource.apple.com/source/xnu/xnu-6153.81.5/iokit/Kernel/IOPMrootDomain.cpp.auto.html):

```cpp
// gDarkWakeFlags
enum {
    kDarkWakeFlagHIDTickleEarly      = 0x01, // hid tickle before gfx suppression
    kDarkWakeFlagHIDTickleLate       = 0x02, // hid tickle after gfx suppression
    kDarkWakeFlagHIDTickleNone       = 0x03, // hid tickle is not posted
    kDarkWakeFlagHIDTickleMask       = 0x03,
    kDarkWakeFlagAlarmIsDark         = 0x0100,
    kDarkWakeFlagGraphicsPowerState1 = 0x0200,
    kDarkWakeFlagAudioNotSuppressed  = 0x0400
};
```

Giờ đi qua từng bit một:

| Bit | Name (Tên) | Comment (Ghi chú) |
| :--- | :--- | :--- |
| 0 | N/A | Được cho là vô hiệu hóa darkwake |
| 1 | HID Tickle Early | Giúp đánh thức khi mở nắp laptop, có thể cần nhấn thêm nút nguồn mới dậy |
| 2 | HID Tickle Late | Giúp đánh thức bằng một lần nhấn phím nhưng vô hiệu hóa tính năng tự động ngủ |
| 3 | HID Tickle None | Giá trị darkwake mặc định nếu không thiết lập gì |
| 3 | HID Tickle Mask | Để ghép cặp với cái khác |
| 256 | Alarm Is Dark | Đang được nghiên cứu |
| 512 | Graphics Power State 1 | Cho phép wranglerTickled đánh thức hoàn toàn từ chế độ ngủ đông và RTC |
| 1024 | Audio Not Suppressed | Được cho là giúp sửa lỗi mất tiếng sau khi máy thức dậy |

* Lưu ý là HID = Human-interface devices (Thiết bị giao diện người dùng: Bàn phím, chuột, trackpad, v.v).

Để áp dụng bảng trên vào hệ thống của bạn, đơn giản là lấy máy tính ra, cộng các giá trị darkwake bạn muốn và áp dụng giá trị tổng cuối cùng vào boot-args. Tuy nhiên tụi tui khuyên bạn nên thử từng cái một thay vì gộp hết một lúc, trừ khi bạn biết rõ mình đang làm gì (mà nếu biết rõ thì chắc bạn chả đọc cái hướng dẫn này đâu nhỉ).

Ví dụ, hãy thử kết hợp `kDarkWakeFlagHIDTickleLate` và `kDarkWakeFlagGraphicsPowerState1`:

* `2`= kDarkWakeFlagHIDTickleLate
* `512`= kDarkWakeFlagAudioNotSuppressed

Vậy giá trị cuối cùng là `darkwake=514`, chúng ta sẽ nhét vào boot-args:

```
NVRAM
|---Add
  |---7C436110-AB2A-4BBB-A880-FE41995C9F82
    |---boot-args | Sting | darkwake=514
```

Phần dưới này để làm rõ cho những người dùng đang dùng darkwake hoặc đang tìm hiểu, cụ thể là những giá trị nào không còn tác dụng nữa:

* `darkwake=8`: Cái này đã bay màu khỏi kernel từ thời [Mavericks](https://opensource.apple.com/source/xnu/xnu-2422.115.4/iokit/Kernel/IOPMrootDomain.cpp.auto.html)
  * Boot-arg đúng nên là `darkwake=0`
* `darkwake=10`: Cái này cũng bay màu từ thời [Mavericks](https://opensource.apple.com/source/xnu/xnu-2422.115.4/iokit/Kernel/IOPMrootDomain.cpp.auto.html)
  * Boot-arg đúng nên là `darkwake=2`
