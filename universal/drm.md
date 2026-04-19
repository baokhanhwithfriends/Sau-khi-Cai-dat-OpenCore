# Bổ sung hỗ trợ DRM và cải thiện hiệu năng giải mã cho card màn hình

* **Lưu ý**: Với Safari 14 và macOS 11, Big Sur hiện tại thì các bản vá DRM (Quản lý bản quyền kỹ thuật số) của WhateverGreen "bơ đẹp". Tuy nhiên Safari 13 trên Catalina và các phiên bản cũ hơn thì vẫn chạy ngon lành cành đào.
* **Lưu ý số 2**: Mấy trình duyệt không cần tới DRM phần cứng (ví dụ: Mozilla Firefox hoặc mấy ông tướng xài nhân Chromium như Google Chrome và Microsoft Edge) thì DRM chạy phà phà mà không cần chỉnh chọt gì trên iGPU (Card đồ họa tích hợp) và dGPU (Card đồ họa rời). Hướng dẫn bên dưới dành cho Safari và các ứng dụng "chảnh chọe" (thường là của Apple) đòi sử dụng DRM phần cứng.

Với cái vụ DRM phần cứng này, có vài thứ cần phải "thông báo" trước để bạn đỡ mất thì giờ:

* DRM phần cứng yêu cầu card màn hình rời phải hỗ trợ.
  * Đọc thêm [Hướng dẫn chọn mua card màn hình](https://dortania.github.io/GPU-Buyers-Guide/) để biết card nào chơi được
* Mấy cái máy chỉ xài card màn hình onboard thì DRM phần cứng không sử dụng được nữa.
  * Cái này từng sửa được bằng Shiki (giờ là WhateverGreen) cho tới bản 10.12.2, nhưng lên tới bản 10.12.3 thì "ngủm".
  * Lý do là card màn hình onboard của chúng ta không hỗ trợ firmware (vi chương trình điều khiển) của Apple và cái [Management Engine](https://en.wikipedia.org/wiki/Intel_Management_Engine) của chúng ta có trong BIOS không có chứng chỉ của Apple (chỉ có trong con Mac real). Đây là 2 điều kiện tiên quyết để DRM phần cứng trên card màn hình onboard chịu chạy.

## Kiểm tra Tăng tốc phần cứng và Giải mã

Trước khi bắt tay vào sửa DRM, phải chắc chắn phần cứng của bạn đang hoạt động ngon lành cành đào nha. Cách tốt nhất để kiểm tra là chạy [VDADecoderChecker](https://i.applelife.ru/2019/05/451893_10.12_VDADecoderChecker.zip):

![](../images/post-install/drm-md/vda.png)

Nếu đến đoạn này mà bạn "tạch", thì có vài thứ cần kiểm tra lại:

* Bảo đảm phần cứng của bạn được hỗ trợ.
  * Đọc phần [hướng dẫn chọn mua card màn hình](https://dortania.github.io/GPU-Buyers-Guide/)
* Bảo đảm cái SMBIOS bạn đang xài sát với phần cứng.
  * Ví dụ đừng có lấy SMBIOS của Mac Mini cắm cho máy bàn, vì Mac Mini chạy phần cứng di động tương tự như laptop và CPU của Laptop nên macOS sẽ yêu cầu phần cứng tương tự.
* Bảo đảm iGPU đã được kích hoạt trong BIOS và có đúng thuộc tính cho cấu hình của bạn (`AAPL,ig-platform-id` và nếu cần thì có luôn `device-id`)
  * Bạn có thể đọc lại phần cấu hình DeviceProperties (Thuộc tính thiết bị) trong hướng dẫn tạo config.plist dành cho kiến trúc của bạn hoặc [hướng dẫn sử dụng WhateverGreen](https://github.com/acidanthera/WhateverGreen/blob/master/Manual/FAQ.IntelHD.en.md)
* Tránh sử dụng mấy bản vá đổi tên đường dẫn ACPI linh tinh như khi bạn sử dụng trên Clover trước đây, mấy cái quan trọng đó WhateverGreen lo hết rồi. Nếu có thì vui lòng xóa mấy cái của nợ đó khỏi config.plist của bạn dùm mình để tránh gây xung đột nhé, cụ thể như:
  * change GFX0 to IGPU
  * change PEG0 to GFX0
  * change HECI to IMEI
  * [v.v](https://github.com/dortania/OpenCore-Install-Guide/blob/master/clover-conversion/Clover-config.md)
* Bảo đảm Lilu và WhateverGreen đã được nạp.
  * Bảo đảm không còn giữ mấy cái kext đóng vai trò là bản vá đồ họa cổ lỗ sĩ nào đó vì tụi nó đã "hợp thể" vào WhateverGreen hết rồi, cụ thể như:
    * IntelGraphicsFixup.kext
    * NvidiaGraphicsFixup.kext
    * Shiki.kext

Để kiểm tra xem Lilu và WhateverGreen nạp đúng chưa:

```
kextstat | grep -E "Lilu|WhateverGreen"
```

> Ê ông ơi, một trong mấy cái kext này không hiện lên

Gặp trường hợp này thì cách tốt nhất là soi lại cái log (nhật ký) của OpenCore xem Lilu và WhateverGreen có được inject (nạp) thành công không:

```
14:354 00:020 OC: Prelink injection Lilu.kext () - Success
14:367 00:012 OC: Prelink injection WhateverGreen.kext () - Success
```

Nếu nó báo lỗi khi nạp (failed to inject):

```
15:448 00:007 OC: Prelink injection WhateverGreen.kext () - Invalid Parameter
```

Thì có mấy chỗ chính bạn cần kiểm tra xem tại sao:

* **Thứ tự nạp kext**: Bảo đảm rằng Lilu luôn nằm trên AppleALC trong danh sách thứ tự kext.
* **Tất cả kext phải là bản mới nhất**: Đặc biệt quan trọng với các plugin của Lilu, vì kext lệch phiên bản thường là nguyên nhân gây lỗi.

Lưu ý: Để thiết lập OpenCore ghi log ra file (nếu bạn không thấy), đọc lại phần [Gỡ lỗi OpenCore](https://baokhanhwithfriends.github.io/Huong-dan-cai-dat-OpenCore/troubleshooting/debug.html).

**Lưu ý**: Trên macOS 10.15 trở lên, trình gỡ lỗi AppleGVA bị tắt mặc định, nếu bạn gặp lỗi chung chung khi chạy VDADecoderChecker thì có thể kích hoạt lại trình debug lên bằng lệnh sau:

```
defaults write com.apple.AppleGVA enableSyslog -boolean true
```

Và để tắt lại khi sử dụng xong:

```
defaults delete com.apple.AppleGVA enableSyslog
```

## Kiểm tra DRM có chạy chưa

Trước khi đi quá sâu, chúng ta cần điểm qua vài thứ, cụ thể là các loại DRM bạn sẽ gặp ngoài "thực tế":

**FairPlay 1.x**: DRM xử lý bằng phần mềm, xài để hỗ trợ mấy máy Mac đời tốn không có phần cứng chuyên dụng dễ dàng hơn.

* Cách dễ nhất để test là mở một bộ phim có trên iTunes: [Kiểm tra FairPlay 1.x](https://drive.google.com/file/d/12pQ5FFpdHdGOVV6jvbqEq2wmkpMKxsOF/view)
  * Trailer FairPlay 1.x sẽ chạy được trên mọi cấu hình Hackintosh nếu WhateverGreen được cài đặt đúng - kể cả cấu hình chỉ có iGPU. Tuy nhiên, bạn cần lưu ý kỹ *phim* có nhúng FairPlay 1.x sẽ chỉ chạy trên cấu hình máy tính chỉ có card màn hình onboard được khoảng 3-5 giây rồi báo lỗi HDCP không được hỗ trợ.

**FairPlay 2.x/3.x**: DRM xử lý bằng phần cứng, thường thấy trên Netflix, Amazon Prime.

* Có vài cách để test:
  * Mở phim trên Netflix hoặc Amazon Prime.
  * Mở một cái trailer trên Amazon Prime: [Spider-Man: Far From Home](https://www.amazon.com/Spider-Man-Far-Home-Tom-Holland/dp/B07TP6D1DP)
    * Bản thân cái trailer không có DRM nhưng Amazon vẫn kiểm tra trước khi mở.
* Lưu ý: Để sử dụng được DRM phiên bản này, yêu cầu phần cứng là card màn hình AMD đời mới để hoạt động (Dòng Polaris trở lên).

**FairPlay 4.x**: DRM hỗn hợp, thường thấy trên Apple TV+.

* Bạn có thể mở TV.app trên macOS, rồi chọn TV+ -> Phim ra mắt miễn phí trên Apple TV+ (Free Apple TV+ Premieres), rồi bấm vào bất kỳ tập nào để test mà không cần tài khoản dùng thử (nhưng cần tài khoản iCloud đã đăng nhập nhé)
* Apple TV+ cũng có bản xài thử miễn phí 1 tháng nếu bạn muốn xài.
* Lưu ý: Yêu cầu phần cứng là máy tính không có iGPU (chip Xeon) hoặc máy có card màn hình AMD đời mới để hoạt động (Dòng Polaris trở lên) - iGPU đóng vai trò xử lý tác vụ điện toán. 
  * Có thể ép sử dụng FairPlay 1.x khi không có card màn hình onboard.

Nếu mọi thứ chạy ngon lành qua các bài test này, chúc mừng bạn không cần đọc tiếp! Còn không thì mời đi tiếp.

## Sửa lỗi DRM

Để sửa DRM, chúng ta chỉ có đi theo 1 con đường: vá lỗi DRM để ép macOS sử dụng giải mã bằng phần mềm hoặc giải mã bằng phần cứng có sẵn trong card AMD. Bác Vit đã làm một cái bảng cấu hình nhỏ tuyệt vời cho các cấu hình phần cứng khác nhau:

* [Bảng cấu hình DRM của WhateverGreen](https://github.com/acidanthera/WhateverGreen/blob/master/Manual/FAQ.Chart.md)

Vậy xài bảng đó sao đây? Đầu tiên, xác định cấu hình bạn có trong bảng (AMD ở đây đại diện cho card màn hình, không phải CPU nha). Cái SMBIOS được liệt kê (IM = iMac, MM = Mac Mini, IMP = iMac Pro, MP = Mac Pro) là cái bạn nên xài nếu cấu hình phần cứng trùng khớp. Nếu máy bạn không khớp với cấu hình nào trong bảng thì... xin chia buồn, DRM coi như vứt.

Tiếp theo, xác định chế độ Shiki (Shiki mode) bạn cần sử dụng. Nếu có hai cấu hình cho máy bạn, chúng sẽ khác nhau ở các cờ Shiki (Shiki flags) được sử dụng. Thường thì, chúng ta sẽ ưu tiên giải mã phần cứng hơn là phần mềm để đỡ tải cho CPU. Nếu cột mode để trống, nghĩa là bạn xong rồi đó. Nếu không, bạn nên thêm `shikigva` như một thuộc tính vào bất kỳ card màn hình nào, sử dụng DeviceProperties > Add. Ví dụ, nếu chế độ chúng ta cần dùng là `shikigva=80`:

![Ví dụ về cài đặt shikigva trong Thuộc tính thiết bị](../images/post-install/drm-md/dgpu-path.png)

Bạn cũng có thể xài boot argument (tham số khởi động) - cái này nằm trong cột mode.

Ví dụ nè. Nếu chúng ta có CPU Intel Core i9 - 9900K và card màn hình RX 560, cấu hình sẽ là "AMD+IGPU", chúng ta nên sử dụng SMBIOS iMac hoặc Mac Mini (với cấu hình cụ thể này là iMac19,1). Sau đó chúng ta thấy có 2 tùy chọn cho cấu hình này: một cái mode là `shikigva=16`và cái kia là `shikigva=80`. Chúng ta thấy sự khác biệt nằm ở "Prime Trailers" và "Prime/Netflix". Chúng ta muốn Netflix chạy ngon, nên sẽ chọn cái `shikigva=80` Sau đó inject (nạp) `shikigva` với kiểu là number/integer (số/số nguyên) và giá trị `80` vào iGPU hoặc dGPU của mình, khởi động lại và DRM sẽ chạy được.

Thêm ví dụ nữa. Lần này, chúng ta có Ryzen 3700X và RX 480. Cấu hình lúc này chỉ là "AMD" và chúng ta nên xài SMBIOS iMac Pro hoặc Mac Pro. Một lần nữa, ta có 2 tùy chọn: không có tham số shiki, hoặc `shikigva=128`. Chúng ta thích giải mã phần cứng hơn phần mềm, nên sẽ chọn `shikigva=128` và nạp `shikigva` vào dGPU, lần này với giá trị `128`. Khởi động lại và DRM chạy vù vù.

**Lưu ý:**

* Bạn cũng có thể sử dụng [gfxutil](https://github.com/acidanthera/gfxutil/releases) để tìm đường dẫn ACPI của iGPU/dGPU.
  * `path/to/gfxutil -f GFX0`
  * `GFX0`: Cho card màn hình, nếu bạn gắn nhiều cái thì kiểm tra IORegistryExplorer xem card AMD của bạn tên là gì.
  * `IGPU`: Cho iGPU
* Nếu bạn nạp `shikigva` bằng DeviceProperties, nhớ là chỉ xài với một GPU duy nhất thôi nhé, nếu không WhateverGreen sẽ vớ đại cái nào nó thấy trước trong khi khởi động và chưa chắc đã ổn định đâu.
* IQSV là viết tắt của Intel Quick Sync Video: cái này chỉ chạy nếu CPU của bạn có iGPU và đã kích hoạt cũng như thiết lập đúng trong file cấu hình như hướng dẫn.
* Mấy cái cấu hình đặc biệt không giống ai (như Haswell + AMD dGPU mà kẹp với SMBIOS iMac, nhưng iGPU bị tắt) rõ ràng không có trong bảng. Bạn phải tự Google tìm hiểu lấy thôi.
* [Mã nguồn của Shiki](https://github.com/acidanthera/WhateverGreen/blob/master/WhateverGreen/kern_shiki.hpp) là một trong các tài liệu rất hữu ích để hiểu cờ nào làm việc gì và khi nào nên dùng, có thể giúp ích cho mấy cấu hình dị dị.
* Với lỗi `VDADecoderCreate failed. err: -12473` trong Big Sur, ép chạy AMD Decoder (trên mấy cái card áp dụng được) thì có thể giúp sửa lỗi trên bằng cách chạy:

    ```sh
    defaults write com.apple.AppleGVA gvaForceAMDAVCDecode -boolean yes
    ```
