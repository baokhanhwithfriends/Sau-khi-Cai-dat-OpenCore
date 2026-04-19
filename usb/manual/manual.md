# Lập bản đồ cổng USB: Phương thức thủ công

Vậy là xong mấy cái thủ tục rườm rà, giờ chúng ta có thể đi vào phần chính. Và giờ là lúc chúng ta được đọc một trong những cuốn sách gối đầu giường yêu thích của tui trước khi đi ngủ: [Thông số kỹ thuật Giao diện nguồn và cấu hình nâng cao (ACPI)!](https://uefi.org/specs/ACPI/6.4/)

Nếu bạn chưa từng đọc qua cái này (mình cực lực khuyên bạn nên đọc, nó là một câu chuyện ly kỳ hấp dẫn đó), mình sẽ chỉ cho bạn phần cốt lõi của vấn đề cổng USB:

* Mục 9.14: _UPC (Khả năng của cổng USB)

Ở đây chúng ta được chào đón bởi tất cả các loại cổng USB có thể có trong ACPI:

| Type (Loại chân cắm) | Info (Thông tin) | Comments (Ghi chú) |
| :--- | :--- | :--- |
| 0 | USB 2.0 Type-A connector (Chân cắm kết nối chuẩn USB 2.0 loại A) | Đây là loại chân cắm mà macOS sẽ mặc định gán cho tất cả các cổng khi không có sơ đồ USB nào được nạp |
| 3 | USB 3.0 Type-A connector (Chân cắm kết nối chuẩn USB 3.0 loại A) | Cổng 3.0, 3.1 và 3.2 đều xài chung loại này |
| 8 | Type C connector - USB 2.0-only (Chân cắm kết nối USB 2.0 loại USB-C) | Thường thấy trên điện thoại
| 9 | Type C connector - USB 2.0 and USB 3.0 with Switch (Chân cắm kết nối USB 2.0 và 3.0 loại USB-C, hỗ trợ xoay ngược) | Xoay ngược thiết bị rồi cắm **không làm** thay đổi loại cổng được khai báo trong ACPI |
| 10 | Type C connector - USB 2.0 and USB 3.0 without Switch (Chân cắm kết nối USB 2.0 và 3.0 loại USB-C, không hỗ trợ xoay ngược) | Xoay ngược thiết bị rồi cắm **có làm** thay đổi loại cổng được khai báo trong ACPI, thường thấy trên các header 3.1/2 của bo mạch chủ |
| 255 | Proprietary connector (Chân cắm độc quyền) | Dành cho các cổng USB nội bộ (tức là không có cổng cắm vật lý cho người dùng cắm mà chỉ là chân kết nối + sử dụng giao thức kết nối USB) như Bluetooth, webcam của laptop v.v |

## Lập bản đồ cổng USB: Phương thức thủ công

Phần này dành cho mấy bác muốn chọc ngoáy sâu vào "nội tạng" con Hackintosh của mình, để thực sự hiểu nó đang làm cái gì và tự cứu lấy chính mình nếu mấy công cụ như USBmap.py dở chứng. Để bắt đầu, chúng ta cần vài thứ:

* Đã cài đặt macOS
  * Lý do là vì cách macOS liệt kê các cổng, cố lập sơ đồ bằng hệ điều hành khác sẽ làm khó bản thân.
  * Lưu ý: Hướng dẫn này tập trung vào OS X 10.11, El Capitan và mới hơn. Với hệ điều hành Mac cũ hơn thường không cần lập sơ đồ USB (bạn vẫn có thể lập nếu muốn).
* Tên USB không bị xung đột
  * Đọc lại phần trước: [Kiểm tra xem cần đổi tên cái gì](../system-preparation.md#kiem-tra-xem-can-đoi-ten-cai-gi)
* Một thiết bị USB 2.0 và một thiết bị USB 3.0 để test
  * Bạn phải có 2 thiết bị riêng biệt để bảo đảm không bị nhầm lẫn giữa các "chế độ cổng" của cổng USB (bạn sẽ hiểu rõ hơn ở khúc sau).
* [IORegistryExplorer.app](https://github.com/khronokernel/IORegistryClone/blob/master/ioreg-302.zip)
  * Để soi nội tạng của macOS dễ dàng hơn.
  * Nếu bạn định dùng Discord để nhờ trợ giúp, xài bản [v2.1.0](https://github.com/khronokernel/IORegistryClone/blob/master/ioreg-210.zip) sẽ nhẹ hơn để gửi file.
* [USBInjectAll](https://bitbucket.org/RehabMan/os-x-usb-inject-all/downloads/)
  * Cái này chỉ cần cho các bộ điều khiển USB cũ như đời CPU Broadwell trở về trước, tuy nhiên một số hệ thống Coffee Lake vẫn có thể cần nó.
  * **Nhắc lại lần nữa** kext này không xài được trên máy AMD.
* [Sample-USB-Map.kext](https://github.com/dortania/OpenCore-Post-Install/blob/master/extra-files/Sample-USB-Map.kext.zip)
* [ProperTree](https://github.com/corpnewt/ProperTree)
  * Hoặc bất kỳ trình chỉnh sửa plist nào khác.
  
Giờ xong phần chuẩn bị rồi, bắt đầu lập sơ đồ USB thôi!

## Tìm ra cổng USB của bạn

Mở cái [IORegistryExplorer.app](https://github.com/khronokernel/IORegistryClone/blob/master/ioreg-302.zip) đã tải lúc nãy lên và tìm (các) bộ điều khiển USB của bạn.

2 từ khóa chính để tìm là `XHC` và `EHC`, nhưng nếu bạn dùng mainboard đời tống với bộ điều khiển UHCI hoặc OHCI thì phải tìm tên khác. Tìm kiếm từ khóa chung chung như `USB` sẽ ra quá nhiều kết quả làm bạn rối bời tâm trí đó.

Ví dụ này, chúng ta sẽ thử lập sơ đồ cho con main Asus X299-E Strix:

![](../../images/post-install/manual-md/initial-boot.png)

Từ hình trên chúng ta thấy có 3 bộ điều khiển USB:

* PXSX(1, Trên cùng)
* PXSX(2, Giữa)
* XHCI(3, Dưới cùng)

Chú ý rằng tụi nó là các bộ điều khiển riêng biệt, nghĩa là **mỗi bộ điều khiển USB có giới hạn cổng riêng của nó**. Nên bạn không đến mức "đói" cổng USB như bạn nghĩ đâu.

Giờ thì mình biết thừa bộ điều khiển nào ứng với cổng vật lý nào rồi, nhưng vấn đề là không phải lúc nào cũng dễ nhìn ra cổng nào khớp với bộ điều khiển nào. Nên hãy cùng tìm hiểu xem cái nào là cái nào.

**Lưu ý**: Mục AppleUSBLegacyRoot là mục liệt kê tất cả các bộ điều khiển và cổng USB đang hoạt động, bản thân chúng không phải là bộ điều khiển USB nên bạn có thể mặc kệ nó đi.

**Lưu ý số 2**: Nhớ là mỗi model mainboard sẽ có một bộ combo cổng, loại bộ điều khiển và tên gọi khác nhau. Nên ví dụ của mình xài PXSX, nhưng của bạn có thể là XHC0 hoặc PTCP. Và trên các mainboard cũ thường chỉ có 1 bộ điều khiển thôi, chuyện này bình thường nên đừng hoảng nếu không giống y chang ví dụ.

Các tên thông dụng bạn có thể kiểm tra:

* Bộ điều khiển USB 3.x:
  * XHC
  * XHC0
  * XHC1
  * XHC2
  * XHCI
  * XHCX
  * AS43
  * PTXH
    * Bộ điều khiển có trên Chipset AMD hay sử dụng tên quy ước này
  * PTCP
    * Sẽ gặp trên main AsRock X399, trong bảng ACPI mấy cổng này thiệt ra nói là PXTX nhưng macOS lại liệt kê tên khác
  * PXSX
    * Đôi khi nó là thiết bị PCIe chung chung, **hớ kiểm tra kỹ xem nó có phải là thiết bị USB không nha**, vì bộ điều khiển của ổ cứng SSD NVMe và các thiết bị PCIe khác cũng có thể xài tên này.
* Bộ điều khiển USB 2.x:
  * EHCI
  * EHC1
  * EHC2
  * EUSB
  * USBE

### Tìm xem cổng nào thuộc sự quản lý của bộ điều khiển nào

Để bắt đầu, mình sẽ cắm một thiết bị USB vào cổng trước 3.1(Type-A) và 3.2(Type-C):

![](../../images/post-install/manual-md/front-io-plugged.png)

Tiếp theo nhìn vào IOReg, và chúng ta có thể thấy thiết bị USB của mình rơi vào đâu:

| USB-C | USB-A |
| :--- | :--- |
| ![](../../images/post-install/manual-md/usb-c-test.png) | ![](../../images/post-install/manual-md/usb-a-test-3.png) |

Ở đây chúng ta thấy vài thứ:

* Cổng trước 3.2 Type-C nằm trên Bộ điều khiển PXSX (2, giữa).
* Cổng trước 3.1 Type-A nằm trên Bộ điều khiển XHCI (3, Dưới cùng).

Giờ đã biết sơ sơ cổng nào đi với bộ điều khiển nào rồi, chúng ta có thể xem cách map USB.

### Lập sơ đồ cổng USB-A

Như đã nói trước đó, cổng USB 3.x được chia thành 2 chế độ: USB 2.0 và USB 3.0. USB được thiết kế như vầy để bảo đảm tính tương thích ngược nhưng bản thân macOS gặp khó khăn trong việc xác định chế độ nào khớp với cổng nào. Đó là lúc chúng ta ra tay giúp đỡ con mặt cười.

Lấy cái cổng USB-A của chúng ta, khi cắm thiết bị USB 3.0 vào, ta thấy `XHCI -> SS03` sáng lên. Đây là chế độ USB 3.0 của cổng đó. Giờ cắm thiết bị USB 2.0 vào cổng đó:

| Chế độ 3.0 | Chế độ 2.0 |
| :--- | :--- |
| ![](../../images/post-install/manual-md/usb-a-test-4.png) | ![](../../images/post-install/manual-md/usb-a-test-2.png) |

Chúng ta thấy chế độ USB 2.0 của cổng 3.0 đó là `XHCI -> HS03`, giờ bạn đã hình dung được chúng ta đang cố làm gì rồi hả:

* Cổng Type-A mặt trước:
  * HS03: Chế độ 2.0
  * SS03: Chế độ 3.0

**Lưu ý**: Nếu cổng USB của bạn hiện lên là AppleUSB20XHCIPort hoặc AppleUSB30XHCIPort, bạn vẫn có thể map nhưng sẽ khó hơn chút. Thay vì ghi lại tên, hãy chú ý thật kỹ vào thuộc tính `port` ở phía bên phải:

![](../../images/post-install/manual-md/location-id.png)

### Tạo bản đồ riêng cho máy của bạn

Đây là lúc lôi giấy bút ra và bắt đầu ghi chép xem cổng vật lý nào tương ứng với cổng kỹ thuật số nào. Ví dụ về bản đồ của bạn trông sẽ như thế này:

| Sơ đồ theo tên | Sơ đồ theo thuộc tính |
| :--- | :--- |
| ![](../../images/post-install/manual-md/front-io-diagram.png) | ![](../../images/post-install/manual-md/full-diagram-port.png) |

Bản đồ của bạn không cần đẹp như vầy đâu, miễn là bạn hiểu và dễ tra cứu sau này là được.

Lưu ý:

* Sơ đồ theo tên : Khi tên chuẩn hiện ra trong IOReg (ví dụ HS01).
* Sơ đồ theo thuộc tính: Khi không có tên chuẩn (ví dụ AppleUSB30XHCIPort).

### Lập sơ đồ cổng USB-C

Tiếp theo là lập sơ đồ cổng USB-C, cái này hơi khoai như bạn đã để ý lúc nãy:

| Type (Loại chân cắm) | Info (Thông tin) | Comments (Ghi chú) |
| :--- | :--- | :--- |
| 8 | Type C connector - USB 2.0-only (Chân cắm kết nối USB 2.0 loại USB-C) | Thường thấy trên điện thoại
| 9 | Type C connector - USB 2.0 and USB 3.0 with Switch (Chân cắm kết nối USB 2.0 và 3.0 loại USB-C, hỗ trợ xoay ngược) | Xoay ngược thiết bị rồi cắm **không làm** thay đổi loại cổng được khai báo trong ACPI |
| 10 | Type C connector - USB 2.0 and USB 3.0 without Switch (Chân cắm kết nối USB 2.0 và 3.0 loại USB-C, không hỗ trợ xoay ngược) | Xoay ngược thiết bị rồi cắm **có làm** thay đổi loại cổng được khai báo trong ACPI, thường thấy trên các header 3.1/2 của bo mạch chủ |

Khi map header USB-C, chúng ta thấy nó chiếm cổng SS01. Nhưng khi lật ngược đầu cắm lại, nó lại nhảy sang cổng SS02. Khi chuyện này xảy ra, bạn cần ghi chú lại để chọn loại cổng cho đúng.

* Lưu ý: Tất cả các chế độ USB từ cổng này sẽ được đặt là Type 10.
* Lưu ý số 2: Không phải tất cả header USB-C đều là Type 10, **kiểm tra kỹ cái của bạn nha**

![](../../images/post-install/manual-md/usb-c-test-2.png)

### Lập sơ đồ cổng USB bị "xổng chuồng"

Giờ đã nắm được ý tưởng cơ bản, bạn cần dò xung quanh và lập sơ đồ hết mọi cổng USB xuất hiện. Việc này tốn thời gian đó, cũng đừng quên ghi chép lại. Sơ đồ cuối cùng của bạn sẽ trông na ná như vầy:

![](../../images/post-install/manual-md/full-diagram.png)

### Lưu ý đặc biệt

* [Bluetooth](#bluetooth)
* [Cổng USRx](#cong-usrx)
* [Lập sơ đồ cổng USB bị "xổng chuồng"](#lap-so-do-cong-usb-bi-xong-chuong)

#### Bluetooth

Tuy không rõ ràng với nhiều người, nhưng Bluetooth thực chất chạy qua giao diện USB nội bộ. Nghĩa là khi lập sơ đồ, bạn cần chú ý kỹ các thiết bị đã hiện sẵn trong IOReg:

![](../../images/post-install/manual-md/bluetooth.png)

Nhớ kỹ cái này, vì nó liên quan đến Type 255 và làm cho các dịch vụ như Handoff hoạt động chuẩn.

#### Cổng USRx

Khi lập sơ đồ, bạn có thể thấy dư ra vài cổng lạ, cụ thể là USR1 và USR2. Mấy cổng này kêu là "USBR" ports, hay cụ thể hơn là [Cổng chuyển hướng USB](https://software.Intel.com/content/www/us/en/develop/documentation/amt-developer-guide/top/storage-redirection.html). Tụi nó xài cho quản lý từ xa nhưng máy Mac thật không có thiết bị USBR nên hệ điều hành không hỗ trợ. Bạn có thể bơ đẹp mấy mục này trong sơ đồ USB của mình:

![](../../images/post-install/manual-md/usr.png)

#### Lập sơ đồ cổng USB bị "xổng chuồng"

Trong vài trường hợp hiếm, một số cổng USB có thể không hiện lên trong macOS. Khả năng cao là do thiếu định nghĩa trong bảng ACPI, nên chúng ta có vài lựa chọn:

* Coffee Lake và cũ hơn nên xài [USBInjectAll](https://github.com/Sniki/OS-X-USB-Inject-All/releases)
  * Đừng quên thêm cái này vào EFI/OC/Kexts và cả config.plist của bạn trong mục kernel -> Add
* Comet Lake và mới hơn nên sử dụng SSDT-RHUB.
* Máy tính AMD cũng nên xài SSDT-RHUB.

Mục đích của SSDT-RHUB là reset bộ điều khiển USB của bạn, ép macOS liệt kê lại tụi nó. Giúp tránh rắc rối khi cố vá các bảng ACPI hiện có.

Để tạo SSDT-RHUB-MAP của riêng bạn:

* Tải bản sao của SSDT: [SSDT-RHUB.dsl](https://github.com/dortania/Getting-Started-With-ACPI/blob/master/extra-files/decompiled/SSDT-RHUB.dsl)
* Tải [maciASL](https://github.com/acidanthera/MaciASL/releases/tag/1.5.7)

Tiếp theo, mở file SSDT vừa tải bằng maciASL, bạn sẽ thấy như sau:

![](../../images/post-install/manual-md/ssdt-rhub-normal.png)

Giờ mở IOReg và tìm bộ điều khiển USB bạn muốn reset (chú ý thật kỹ là bộ điều khiển USB chứ không phải thằng con RHUB có cùng tên nha):

Nhìn sang bên phải, bạn sẽ thấy thuộc tính `acpi-apth`. Ở đây chúng ta cần dịch nó sang cái gì đó mà SSDT có thể tái sử dụng:

```sh
# Trước khi chỉnh sửa
IOService:/AppleACPIPlatformExpert/PC00@0/AppleACPIPCI/RP05@1C,4/IOPP/PXSX@0
```

Giờ chúng ta lọc/loại bỏ mấy cái dữ liệu thừa không cần thiết:

* `IOService:/AppleACPIPlatformExpert/`
* `@##`
* `IOPP`

Sau khi dọn dẹp, của bạn trông sẽ giống vầy:

```sh
# Sau khi chỉnh sửa
PC00.RP05.PXSX
```

Theo ví dụ trên, chúng ta sẽ đổi tên `PCI0.XHC1.RHUB` thành `PC00.RP05.PXSX.RHUB`:

**Trước khi sửa**:

```
External (_SB_.PCI0.XHC1.RHUB, DeviceObj) <- Đổi tên cái này

Scope (_SB.PCI0.XHC1.RHUB) <- Đổi tên cái này
```

![](../../images/post-install/manual-md/ssdt-rhub.png)

Following the example pathing we found, the SSDT should look something like this:

**Sau khi sửa**:

```
External (_SB.PC00.RP05.PXSX.RHUB, DeviceObj) <- Đã đổi tên 

Scope (_SB.PC00.RP05.PXSX.RHUB) <- Đã đổi tên
```

![](../../images/post-install/manual-md/ssdt-rhub-fixed.png)

Khi đã sửa xong SSDT theo đường dẫn bộ điều khiển USB của bạn, bạn có thể xuất nó ra bằng `File -> Save As -> ACPI Machine Language Binary`:

![](../../images/post-install/manual-md/ssdt-save.png)

Cuối cùng, nhớ thêm SSDT này vào cả EFI/OC/ACPI và config.plist dưới mục ACPI -> Add.

## Tạo kext riêng của chúng ta

Giây phút mọi người chờ đợi đã đến, cuối cùng chúng ta cũng được tạo bản đồ USB!

Đầu tiên, tải kext sơ đồ USB mẫu:

* [Sample-USB-Map.kext](https://github.com/dortania/OpenCore-Post-Install/blob/master/extra-files/Sample-USB-Map.kext.zip)

Chuột phải vào file .kext, chọn `Show Package Contents` (Hiển thị nội dung gói), rồi đi sâu vào tìm info.plist:

| Hiển thị nội dung gói | info.plist |
| :--- | :--- |
| ![](../../images/post-install/manual-md/show-contents.png) | ![](../../images/post-install/manual-md/info-plist.png) |

Giờ mở ProperTree và xem file info.plist này:

![](../../images/post-install/manual-md/info-plist-open.png)

Ở đây chúng ta thấy một số mục, dưới `IOKitPersonalities`:

* RP05 - PXSX(1)
* RP07 - PXSX(2)
* XHCI - XHCI

Mỗi mục ở đây đại diện cho một bộ điều khiển USB, cụ thể là bản đồ cho từng bộ điều khiển. Tên của mục không quan trọng lắm đâu, nó chủ yếu để bạn dễ quản lý xem mục nào chứa bản đồ nào thôi.

Tiếp theo vào mục `RP05 - PXSX(1)`:

![](../../images/post-install/manual-md/rp05-entry.png)

Ở đây chúng ta thấy vài thuộc tính quan trọng:

| Property (Thuộc tính) | Comment (Ghi chú) |
| :--- | :--- |
| IOPathMatch | Thiết bị mà macOS sẽ chọn để gắn bản đồ vào |
| IOProviderClass | Trình điều khiển USB mà macOS sẽ chọn để gắn vào |
| model | SMBIOS mà bản đồ USB gắn vào |
| IOProviderMergeProperties | Từ điển (dictionary) chứa bản đồ cổng thực tế |

### Xác định các thuộc tính

Xác định giá trị cho mỗi thuộc tính thực ra khá đơn giản:

* [IOPathMatch](#iopathmatch)
* [IOProviderClass](#ioproviderclass)
* [model](#model)
* [IOProviderMergeProperties](#ioprovidermergeproperties)

#### IOPathMatch

Tìm IOPathMatch siêu dễ, đầu tiên tìm bộ điều khiển USB bạn muốn lập sơ đồ và chọn Root HUB (đứa con PXSX có cùng tên với cha, đừng lo nhìn hình sẽ đỡ rối hơn):

![](../../images/post-install/manual-md/iopath-match.png)

Với mục PXSX được chọn, copy (Cmd+C) và paste vào info.plist của chúng ta. Thuộc tính của bạn sẽ trông giống thế này:

```
IOService:/AppleACPIPlatformExpert/PC00@0/AppleACPIPCI/RP05@1C,4/IOPP/PXSX@0/PXSX@01000000
```

**Lưu ý**: Mỗi Bộ điều khiển USB sẽ có một giá trị IOPathMatch duy nhất, nhớ kỹ điều này nếu bạn có nhiều bộ điều khiển cùng tên. Con main Asus X299 này có 2 bộ điều khiển USB PXSX, nên mỗi từ điển bản đồ USB mới sẽ có một mục IOPathMatch riêng biệt.

#### IOProviderClass

Tìm IOProviderClass cũng dễ, chọn Root-hub lần nữa và tìm giá trị CFBundleIdentifier:

| IOReg | info.plist |
| :--- | :--- |
| ![](../../images/post-install/manual-md/ioproviderclass.png) | ![](../../images/post-install/manual-md/iorpoviderclass-plist.png) |

Giờ chúng ta không thể lấy nguyên xi giá trị đó, thay vào đó cần cắt bớt lấy tên ngắn gọn của Kext là `AppleUSBXHCIPCI`(Tức là bỏ phần `com.apple.driver.usb.`) đi

#### model

Nếu bạn quên mình đang dùng SMBIOS nào, chỉ cần kiểm tra thiết bị ở cấp cao nhất trong IOReg:

| IOReg | info.plist |
| :--- | :--- |
| ![](../../images/post-install/manual-md/smbios.png) | ![](../../images/post-install/manual-md/smbios-plist.png) |

### IOProviderMergeProperties

Giờ mở từ điển IOProviderMergeProperties ra:

![](../../images/post-install/manual-md/ioprovidermerge.png)

Ở đây chúng ta có khá nhiều dữ liệu cần xử lý:

| Property (Thuộc tính) | Comment (Ghi chú) |
| :--- | :--- |
| name | Tên của từ điển cổng USB |
| port-count | Đây là giá trị cổng lớn nhất bạn đang nạp vào |
| UsbConnector | Đây là loại cổng USB như đã đề cập trong phần ACPI 9.14 |
| port | Vị trí vật lý của cổng USB trong ACPI |
| Comment | Một mục tùy chọn để giúp bạn theo dõi các cổng của mình |

Và nhắc lại về tất cả các loại cổng có thể có:

| Type (Loại chân cắm) | Info (Thông tin) | Comments (Ghi chú) |
| :--- | :--- | :--- |
| 0 | USB 2.0 Type-A connector (Chân cắm kết nối chuẩn USB 2.0 loại A) | Đây là loại chân cắm mà macOS sẽ mặc định gán cho tất cả các cổng khi không có sơ đồ USB nào được nạp |
| 3 | USB 3.0 Type-A connector (Chân cắm kết nối chuẩn USB 3.0 loại A) | Cổng 3.0, 3.1 và 3.2 đều xài chung loại này |
| 8 | Type C connector - USB 2.0-only (Chân cắm kết nối USB 2.0 loại USB-C) | Thường thấy trên điện thoại
| 9 | Type C connector - USB 2.0 and USB 3.0 with Switch (Chân cắm kết nối USB 2.0 và 3.0 loại USB-C, hỗ trợ xoay ngược) | Xoay ngược thiết bị rồi cắm **không làm** thay đổi loại cổng được khai báo trong ACPI |
| 10 | Type C connector - USB 2.0 and USB 3.0 without Switch (Chân cắm kết nối USB 2.0 và 3.0 loại USB-C, không hỗ trợ xoay ngược) | Xoay ngược thiết bị rồi cắm **có làm** thay đổi loại cổng được khai báo trong ACPI, thường thấy trên các header 3.1/2 của bo mạch chủ |
| 255 | Proprietary connector (Chân cắm độc quyền) | Dành cho các cổng USB nội bộ (tức là không có cổng cắm vật lý cho người dùng cắm mà chỉ là chân kết nối + sử dụng giao thức kết nối USB) như Bluetooth, webcam của laptop v.v |

Giờ thì mọi thứ đã sáng tỏ, bạn có thể thấy công sức lập sơ đồ cổng trước đó giờ phát huy tác dụng thế nào.

#### Name

Thuộc tính name thực ra là tên của từ điển cổng USB và chỉ dùng để quản lý thôi. Nhớ là mỗi cổng USB bạn muốn dùng phải có từ điển cổng USB riêng biệt.

Bản thân cái tên không có giá trị gì ngoài việc xuất hiện trong IOReg nên bạn đặt gì cũng được. Để cho đỡ loạn, chúng ta xài tên đã được cung cấp trong bảng ACPI (trường hợp này là HS01) nhưng tên có thể là bất kỳ ký tự nào dài 4 chữ cái. Tuy nhiên đừng vượt quá giới hạn 4 ký tự này, kẻo gây ra tác dụng phụ không mong muốn.

* Lưu ý: Với những ai có tên cổng là AppleUSB20XHCIPort hoặc AppleUSB30XHCIPort, bạn nên chọn tên dễ nhận biết. Trên máy Intel, chế độ 2.0 thường là HSxx và SSxx cho chế độ 3.0.

![](../../images/post-install/manual-md/name.png)

#### port

Để tìm giá trị `port`, đơn giản chọn cổng USB của bạn trong IOReg và tìm mục `port`:

| IOReg | info.plist |
| :--- | :--- |
| ![](../../images/post-install/manual-md/port.png) | ![](../../images/post-install/manual-md/port-plist.png) |

Từ đây chúng ta có `<03 00 00 00>`, bạn chỉ cần xóa khoảng trắng và thêm nó vào bản đồ USB của bạn.

#### port-count

Giá trị cuối cùng còn lại, nhìn lại bản đồ USB của bạn và xem mục `port` nào lớn nhất:

![](../../images/post-install/manual-md/port-count.png)

Ở đây chúng ta thấy cái lớn nhất trong PXSX(1) là `<04000000>`, nhớ là `port` xài hệ thập lục phân nếu bạn thấy chữ cái nào trong bản đồ USB của mình.

### Tiếp tục nào

Giờ chúng ta đã đi qua cách map cổng USB cho một bộ điều khiển cụ thể, bạn đã đủ kiến thức để map thêm các bộ điều khiển khác. Sample-USB-Map.kext tui cung cấp có 3 bộ điều khiển USB được liệt kê (PXSX-1, PXSX-2 và XHCI). Nhớ chỉnh sửa cho phù hợp và xóa mấy cái map thừa đi nhé.

## Tổng kết

Khi đã lưu info.plist của bản đồ USB, nhớ thêm kext vào cả EFI/OC/Kexts và dưới mục Kernel -> Add trong config.plist (tính năng snapshot của ProperTree có thể làm hộ bạn cái này).

Tiếp theo, xóa/vô hiệu hóa mấy cái sau:

* USBInjectAll.kext (nếu bạn còn đang sử dụng)
  * Lý do là USBInjectAll thực sự phá vỡ cách Apple xây dựng bản đồ cổng. Nên dù nó tốt cho việc lập sơ đồ cổng ban đầu, nó có thể làm hư cái sơ đồ USB bạn mới vừa tạo
* Kernel -> Quirks -> XhciPortLimit -> False
  * Giờ chúng ta đã nằm dưới giới hạn 15 cổng rồi, không cần cái thủ thuật hack này nữa

Rồi khởi động lại và kiểm tra IOReg lần cuối:

![](../../images/post-install/manual-md/finished.png)

Voila! (Thấy chưa!) Như bạn thấy, sơ đồ USB của chúng ta đã áp dụng thành công mỹ mãn!

Các thuộc tính chính cần xác minh là:

* Thuộc tính UsbConnector phải chính xác trên các cổng USB.
* Comment đã được áp dụng (nếu có nạp).
* Mấy cái cổng cả đời không xài tới đã bị xóa sổ.
