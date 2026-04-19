# Cập nhật OpenCore, kexts và macOS

## Cập nhật OpenCore

Vài điều quan trọng cần ghi nhớ khi cập nhật OpenCore:

* [Các bản phát hành](https://github.com/acidanthera/OpenCorePkg/releases) sẽ được tung ra vào ngày thứ Hai đầu tiên của mỗi tháng
* Tệp [Differences.pdf](https://github.com/acidanthera/OpenCorePkg/blob/master/Docs/Differences/Differences.pdf) sẽ "mách" bạn tất cả những thứ được thêm vào hay bị đá ra khỏi phiên bản này so với bản trước
* Hướng dẫn cài đặt OpenCore (OpenCore Install Guide) sẽ có một ghi chú ở [header (phần đầu trang)](https://dortania.github.io/OpenCore-Install-Guide/) cho biết nó đang hỗ trợ phiên bản nào.

> Vậy tui cập nhật như thế nào đây?

Quy trình diễn ra như sau:

### 1. **Tải bản OpenCore mới nhất về**

* [OpenCorePkg](https://github.com/acidanthera/OpenCorePkg/releases)

### 2. **Mount (gắn kết) phân vùng EFI**

* Đầu tiên, hãy mount (gắn kết) EFI của ổ cứng và sao lưu nó ra một chỗ an toàn bằng [MountEFI](https://github.com/corpnewt/MountEFI). Chúng ta sẽ không cập nhật trực tiếp lên ổ cứng ngay đâu, thay vào đó hãy kiếm một cái USB sơ cua để làm "chuột bạch". Điều này giúp bạn giữ lại được bản OpenCore đang chạy ổn định phòng khi bản cập nhật bị "toang".

* Với cái USB, nó phải được định dạng chuẩn GUID. Lý do là chọn GUID thì Disk Utility sẽ tự động tạo một cái phân vùng EFI, mặc dù nó sẽ bị ẩn theo mặc định nên bạn cần xài MountEFI để lôi đầu nó ra.

 ![](../images/post-install/update-md/usb-erase.png)

* Giờ thì bạn có thể ném cái folder EFI OpenCore của bạn vào USB.

 ![](../images/post-install/update-md/usb-folder.png)

### 3. **Thay thế các file OpenCore bằng hàng mới tải**

* Mấy file quan trọng cần cập nhật:

  * `EFI/BOOT/BOOTx64.efi`
  * `EFI/OC/OpenCore.efi`
  * `EFI/OC/Drivers/OpenRuntime.efi`(**Đừng quên cái này, OpenCore sẽ nghỉ chạy nếu phiên bản của 1 trong các file này bị lệch nhau**)

* Bạn cũng có thể cập nhật các driver khác nếu có, nhưng mấy cái trên là **bắt buộc** phải cập nhật để khởi động được.

![](../images/post-install/update-md/usb-folder-highlight.png)

### 4. **So sánh config.plist của bạn với Sample.plist mới**

* Cái này thì có nhiều cách để thực hiện:

  * [OCConfigCompare](https://github.com/corpnewt/OCConfigCompare) để so sánh giữa sample.plist và config.plist của bạn.
  * Chạy lệnh `diff (file đầu vào 1) (file đầu vào 2)` trong terminal
  * [Meld Merge](https://github.com/yousseb/meld/releases/), [WinMerge](https://winmerge.org/), hoặc phần mềm so sánh mà bạn hay sử dụng.
  * Tạo một config mới dựa trên việc đọc Hướng dẫn cài đặt OpenCore đã được cập nhật.

![](../images/post-install/update-md/oc-config-compare.png)

* Khi đã chỉnh sửa xong, để chắc ăn là config của bạn hợp chuẩn với bản OpenCore mới nhất, bạn có thể dùng tiện ích ocvalidate của OpenCore: công cụ này giúp đảm bảo config.plist của bạn khớp với thông số kỹ thuật của bản build tương ứng.
  * Lưu ý nhẹ, `ocvalidate` phải đúng phiên bản với bản OpenCore đang dùng và có thể nó không phát hiện được hết mọi lỗi đâu. Tụi mình khuyên bạn nên check kỹ lại cài đặt với Hướng dẫn OpenCore, hoặc đọc [Differences.pdf](https://github.com/acidanthera/OpenCorePkg/blob/master/Docs/Differences/Differences.pdf) để biết chi tiết sâu hơn về các thay đổi trong bản cập nhật mới.
  * Để chạy `ocvalidate`, xài lệnh `cd` vào thư mục `Utilties/ocvalidate/` của OpenCore và chạy `./ocvalidate <insert_config.plist>`. Lưu ý có thể bạn cần `chmod +x ocvalidate` để cấp quyền thực thi cho nó.
  * Ngoài ra, nhớ cập nhật ProperTree và thực hiện OC Snapshot (Ctrl/Cmd+R) để đảm bảo các mục config cho SSDT, driver, kext, v.v. đều đúng chuẩn mà OpenCore mong muốn.

![](../images/post-install/update-md/ocvalidate.png)

### 5. **Khởi động!**

* Một khi mọi thứ chạy ngon lành trên cái USB "chuột bạch", bạn có thể mount EFI và chuyển nó sang phân vùng EFI của ổ cứng. Nhớ giữ lại bản sao EFI cũ phòng khi OpenCore dở chứng giữa đường nhé.

## Cập nhật Kext

* Cập nhật Kexts cũng na ná cập nhật OpenCore thôi, sao lưu mọi thứ và cập nhật trên USB test phòng khi có biến.

* Cách dễ nhất để cập nhật kexts là dùng 2 công cụ này:

  * [Lilu and Friends](https://github.com/corpnewt/Lilu-and-Friends) để tải và biên dịch kext.
  * [Kext Extractor](https://github.com/corpnewt/KextExtractor) để gộp tụi nó vào EFI của bạn.

## Cập nhật macOS

* Đây có lẽ là phần "khoai" nhất: duy trì hệ thống qua các bản cập nhật OS. Mấy điều chính cần nhớ:
  * Với các bản cập nhật OS, đảm bảo mọi thứ (Kext, OpenCore) đã được cập nhật và bạn có phương án cứu hộ như Time Machine hoặc một bộ cài macOS cũ với EFI đang chạy tốt.
  * Xài "Google thần chưởng" (google-fu) xem thiên hạ có ai kêu ca gì về bản cập nhật mới nhất không.

* Tụi mình cũng cung cấp một bản đồ chi tiết hơn về những thay đổi trong các phiên bản macOS, xem bên dưới:

**macOS Catalina**:

* 10.15.0
  * [Yêu cầu EC chuẩn chỉnh](https://baokhanhwithfriends.github.io/Khoi-dau-voi-ACPI/)
  * Máy có Dual socket (2 CPU) và hầu hết CPU AMD cần [AppleMCEReporterDisabler.kext](https://github.com/acidanthera/bugtracker/files/3703498/AppleMCEReporterDisabler.kext.zip)
  * Ngừng hỗ trợ SMBIOS MacPro5,1
* 10.15.1
  * Yêu cầu WhateverGreen 1.3.4 trở lên
  * Làm hư chức năng DRM trên nhiều loại card màn hình (xem [Bảng DRM](https://github.com/acidanthera/WhateverGreen/blob/master/Manual/FAQ.Chart.md))
  * Yêu cầu tất cả các bản vá trước đó
* 10.15.2
  * Sửa lỗi cho card màn hình Navi trong bộ cài
  * Yêu cầu tất cả các bản vá trước đó
* 10.15.3
  * Không có thay đổi mới
  * Yêu cầu tất cả các bản vá trước đó
* 10.15.4
  * [Bạn đọc sử dụng CPU AMD cần cập nhật bản vá `cpuid_set_cpufamily`](https://github.com/AMD-OSX/AMD_Vanilla)
  * Sửa lỗi DRM trên nhiều card màn hình AMD kiến trúc Polaris có mã là Ellesmere
  * Yêu cầu tất cả các bản vá trước đó (trừ `shikigva=80` cho DRM cho card màn hình Polaris với đa số bạn đọc đang sử dụng)
* 10.15.5
  * Framebuffer của UHD 630 đang sử dụng ngon đột nhiên bị lỗi với nhiều người, nếu bị màn hình đen bạn có thể cần đổi từ `07009B3E` sang `00009B3E`
  * Comet Lake S không cần giả mạo (spoof) CPU ID nữa vì đã được hỗ trợ chính thức
* 10.15.6
  * Không có thay đổi mới
  * Yêu cầu tất cả các bản vá của bản 10.15.5
* 10.15.7
  * Không có thay đổi mới
  * Yêu cầu tất cả các bản vá của bản 10.15.5
* 10.15.8
  * Không có thay đổi mới
  * Yêu cầu tất cả các bản vá của bản 10.15.5  
  
**macOS Big Sur**:

* 11.0.1
  * Đọc thêm tại đây: [OpenCore và macOS 11: Big Sur](https://baokhanhwithfriends.github.io/Huong-dan-cai-dat-OpenCore/extras/big-sur/)

**macOS Monterey**:

* 12.0.1
  * Đọc thêm tại đây: [OpenCore và macOS 12: Monterey](https://baokhanhwithfriends.github.io/Huong-dan-cai-dat-OpenCore/extras/monterey.html)
