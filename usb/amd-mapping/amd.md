# Lập bản đồ cổng USB cho máy AMD

Mục lục:

* [Map USB cho AMD và bên thứ 3)](#amd-and-3rd-party-usb-mapping)
* [Lập sơ đồ](#creating-the-map)
* [Lập sơ đồ cổng trên DSDT bị lỗi)](#port-mapping-on-screwed-up-dsdts)
* [Lập sơ đồ cổng khi có nhiều bộ điều khiển trùng tên)](#port-mapping-when-you-have-multiple-of-the-same-controller)

Vậy là xong mấy cái thủ tục rườm rà, giờ chúng ta có thể đi vào phần chính. Và giờ là lúc chúng ta được đọc một trong những cuốn sách gối đầu giường yêu thích của tui trước khi đi ngủ: [Thông số kỹ thuật Advanced Configuration and Power Interface (ACPI)!](https://uefi.org/specs/ACPI/6.4/)

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

## Tạo sơ đồ USB cho máy AMD và các controller của các hãng bên thứ 3
Các bước thực hiện khá đơn giản:

* Đọc hướng dẫn này
* Rồi mếu đi
* Hãy khóc đi khóc đi đừng ngại ngùng
* Mua ít phần cứng Intel
* Trả lại đống phần cứng đó
* Lấy hết can đảm để tạo sơ đồ USB trên AMD
* Đọc lại phần còn lại của hướng dẫn *lần nữa* và thiệt sự bắt tay vào lập sơ đồ USB

## Bắt đầu tạo sơ đồ

Để bắt đầu, mở [IORegistryExplorer](https://github.com/khronokernel/IORegistryClone/blob/master/ioreg-302.zip) lên và tìm bộ điều khiển USB bạn muốn tạo sơ đồ. Bộ điều khiển (controller) thường có vài biến thể về tên gọi:

* XHC
* XHC0
* XHC1
* XHC2
* XHCI
* XHCX
* AS43
* PTXH (Bộ điều khiển có trên Chipset AMD hay sử dụng tên quy ước này)
* PTCP (Sẽ gặp trên main AsRock X399, trong bảng ACPI mấy cổng này thiệt ra nói là PXTX nhưng macOS lại liệt kê tên khác)
* PXSX (Đôi khi nó là thiết bị PCIe chung chung, **nhớ kiểm tra kỹ xem nó có phải là thiết bị USB không nha**)

Cách tốt nhất để tìm bộ điều khiển là tìm kiếm từ khóa `XHC` rồi nhìn vào các kết quả hiện ra, thằng cha của tất cả các cổng chính là bộ điều khiển USB. Lưu ý là nhiều bo mạch có nhiều bộ điều khiển nhưng giới hạn cổng là tính trên mỗi bộ điều khiển nhé.

Ví dụ hôm nay, chúng ta sẽ vừa thêm các cổng bị thiếu vừa cắt giảm cho dưới giới hạn 15 cổng cho chipset X399 này, có định danh là `PTXH`

![PTXH IOReg](../../images/amd-mapping/amd-md/controller-name.png)

Như bạn thấy trong ảnh trên, chúng ta bị thiếu cả một đống cổng! Cụ thể là các cổng POT3, POT4, POT7, POT8, PO12, PO13, PO15, PO16, PO17, PO18, PO19, PO20, PO21, PO22!

Vậy sửa sao giờ? Nếu bạn nhìn vào góc, bạn sẽ thấy giá trị `port` Cái này sẽ rất quan trọng với chúng ta khi map.

Tiếp theo, hãy nghía qua file DSDT của chúng ta và kiểm tra thiết bị `PTXH` bằng [maciASL](https://github.com/acidanthera/MaciASL/releases):

Phần đầu của PTXH             |  Phần cuối của PTXH
:-------------------------:|:-------------------------:
![](../../images/amd-mapping/amd-md/dsdt-1.png)  |   ![](../../images/amd-mapping/amd-md/dsdt-2.png)

Tất cả các cổng đều nằm đây! Thế đ** nào macOS lại giấu như mèo giấu c** vậy? Có vài lý do nhưng lý do chính là: Xung đột sơ đồ USB của SMBIOS.

Bên trong `AppleUSBHostPlatformProperties.kext` bạn sẽ tìm thấy sơ đồ USB của hầu hết các SMBIOS, có nghĩa là bản map USB của cái máy Mac thiệt đó đang bị ép áp dụng trên máy của bạn.

Để đá đít mấy cái map tào lao này, chúng ta phải tạo một kext dạng plugin (trình cắm). Với chúng ta, đó là [AMD-USB-Map.kext](https://github.com/dortania/OpenCore-Post-Install/tree/master/extra-files/AMD-USB-Map.kext.zip)

Giờ chuột phải và chọn `Show Package Contents` (Hiển thị nội dung gói), sau đó tìm đến `Contents/Info.plist`

![](../../images/amd-mapping/amd-md/usb-plist.png)
Nếu giá trị cổng không hiện trong Xcode, chuột phải và chọn `Show Raw Keys/Values`
![](../../images/amd-mapping/amd-md/usb-plist-info.png) (Hiện khóa/giá trị thô)

Vậy chúng ta nhét loại dữ liệu gì vào file plist này? Có vài mục cần lưu ý:

* **Model**: SMBIOS mà kext sẽ khớp, cài đặt cái này y chang cái SMBIOS bạn đang xài hiện tại.
* **IONameMatch**: Tên của bộ điều khiển mà nó sẽ khớp, trong ví dụ này chúng ta sẽ sử dụng `PTXH`
  * IOPathMatch là một mục khác bạn có thể dùng thay thế, nếu bạn có nhiều bộ điều khiển cùng tên (ví dụ 2 cái XHC0).
* **port-count**: Giá trị cổng lớn nhất/cuối cùng mà bạn muốn nạp vào.
* **port**: Địa chỉ phần cứng của bộ điều khiển USB.
* **UsbConnector**: Loại đầu cắm USB, bạn có thể tìm thấy trong [Thông số kỹ thuật ACPI 6.3, mục 9.14](https://uefi.org/sites/default/files/resources/ACPI_6_3_final_Jan30.pdf)

> Làm sao tôi biết cổng nào là 2.0 và cổng nào là 3.0?

Cách dễ nhất là kiếm một cái USB 2.0 và một cái USB 3.0, sau đó ghi lại xem cổng nào là loại gì bằng cách quan sát IOReg.

* **Nhớ kỹ**: Cổng USB 3.0 có tính cách kép (đa nhân cách), nên bạn **bắt buộc** test cả ổ 2.0 và 3.0 để biết cổng nào liên kết với nó trong IOReg.

Giờ hãy xem đoạn này:

```
Device (PO18)
   {
   Name (_ADR, 0x12) // _ADR: Address
   Name (_UPC, Package (0x04) // _UPC: USB Port Capabilities
      {
         Zero,
         0xFF,
         Zero,
         Zero
      })
   }
```

Với chúng ta, cái quan trọng là `Name (_ADR, 0x12) // _ADR: Address` vì nó cho biết vị trí của cổng USB. Giá trị này sẽ được chuyển thành giá trị `port` trong file plist. Một số DSDT không khai báo địa chỉ USB của chúng, trong trường hợp này chúng ta có thể xem thuộc tính IOReg của chúng.

![](../../images/amd-mapping/amd-md/port-info.png)

**Nhắc nhở**: Đừng có kéo thả kext bừa bãi, đọc hướng dẫn cho kỹ vào. Đổi tên giá trị `IONameMatch` thành đúng bộ điều khiển bạn muốn làm sơ đồ và xác minh rằng các cổng được đặt tên trùng khớp với **DSDT của bạn**. Nếu chỉ làm mỗi thao tác kéo - thả mà nó chạy được cho tất cả mọi loại máy thì đã không cần cái hướng dẫn này làm gì ;p

Giờ lưu lại và thêm cái này vào cả thư mục kext và config.plist rồi khởi động lại!

Cuối cùng, chúng ta có thể bắt đầu từ từ xóa các cổng không muốn nó xuất hiện khỏi Info.plist và tắt cái quirk `XhciPortLimit` một khi bạn đã khai báo tổng cộng 15 cổng hoặc ít hơn trên mỗi bộ điều khiển.

## Lập sơ đồ cổng USB trên DSDT bị lỗi

Một điều bạn có thể nhận thấy là DSDT của bạn thậm chí còn thiếu một số cổng, ví dụ như:

![AsRock B450 missing ports](../../images/amd-mapping/amd-md/dsdt-missing.png)

Trong DSDT này, chúng ta thiếu HS02, HS03, HS04, HS05, v.v. Khi chuyện này xảy ra, chúng ta thực sự cần xóa thẳng tay tất cả các cổng khỏi bộ điều khiển đó trong DSDT của mình. Điều này sẽ cho phép macOS tự xây dựng các cổng thay vì dựa vào ACPI. Lưu file DSDT.aml đã sửa đổi này và đặt nó vào thư mục EFI/OC/ACPI rồi khai báo nó trong config.plist -> ACPI -> Add (lưu ý là DSDT.aml phải được ép buộc (force) để hoạt động chính xác).

## Map cổng với tên chung chung `AppleUSB20XHCIPort`/'AppleUSB30XHCIPort

Một vấn đề kỳ quặc với ACPI của một số OEM viết là họ không bao giờ thực sự định nghĩa hoặc đặt tên đúng cho các cổng USB. Và thế là khi IOService của macOS bắt đầu quét và xây dựng các cổng, chúng bị gán cho một cái tên chung chung. Điều này làm cho việc xác định và biết cổng của bạn nằm ở đâu trở nên khó khăn.

Để giải quyết, chúng ta chỉ cần thêm tên bằng USBmap.kext của mình, nhờ vào việc chúng ta khớp bản map USB dựa trên vị trí của cổng USB thay vì theo tên.

Trước khi map USB, bạn sẽ thấy kiểu như vầy:

![](../../images/post-install/usb-md/pre-map.png)

Với bản map của chúng ta, kext của bạn trông sẽ như thế này:

![](../../images/post-install/usb-md/genirc-plist.png)

Và kết quả cuối cùng khi áp dụng bản map:

![](../../images/post-install/usb-md/post-map.png)

## Lập sơ đồ cổng khi bạn có nhiều bộ điều khiển USB giống nhau

Vụ này trở thành vấn đề khi chúng ta có máy tính mà trong đó có nhiều bộ điều khiển USB muốn xài chung một mã định danh (identifier), thường là nhiều thiết bị XHC0 hoặc bộ điều khiển AsMedia hiện lên như thiết bị PXSX chung chung. Để khắc phục vụ này, chúng ta có 3 lựa chọn:

* Thuộc tính IOPathMatch
* Đổi tên ACPI (sẽ không đề cập trong hướng dẫn này, xem phần ACPI trong configuration.pdf của OpenCore)
* Tái tạo SSDT (SSDT Recreation)

### Thuộc tính IOPathMatch

Thực ra khá đơn giản, lấy cái USBmap.kext mẫu tui đưa lúc nãy và tìm Thuộc tính IONameMatch. Giờ đổi tên nó thành IOPathMatch.

Cuối cùng, mở IOreg lên và tìm bộ điều khiển USB của bạn:

![](../../images/post-install/usb-md/iopathmatch.png)

Từ đây, chú ý thật kỹ xem tui đã chọn thiết bị thực tế nào. Cụ thể là cái con của `XHC0@0,3` là `XHC0@61000000`, lý do là vì đó là Root-hub (Hub gốc) của chúng ta (hay cái mà macOS dùng để liệt kê các cổng). Cái thằng con có cùng tên thực ra cũng là root hub nhưng không liên quan đến chúng ta.

Giờ copy cái mục `XHC0@61000000` và dán nó lại vào mục `IOPathMatch` trong info.plist của USBmap.kext, kết quả sẽ là một đường dẫn dài ngoằng:

```
IOService:/AppleACPIPlatformExpert/S0D1@0/AppleACPIPCI/D1C0@7,1/IOPP/XHC0@0,3/XHC0@61000000
```

Và khi xong xuôi, IOPathMatch trong USBmap của bạn sẽ trông như thế này:

![](../../images/post-install/usb-md/path-match-config.png)

### Tái tạo SSDT

Với phương pháp Tái tạo SSDT, những gì chúng ta sẽ làm là "đổi tên" thiết bị nhưng thực tế là tạo ra một thiết bị hoàn toàn mới chỉ dành cho macOS nằm ở đúng vị trí y hệt bộ điều khiển USB cũ của bạn.

Để làm điều này, tải SSDT sau:

* [SSDT-SHC0.dsl](https://github.com/dortania/OpenCore-Post-Install/tree/master/extra-files/SSDT-SHC0.dsl)

Việc bạn cần làm là tìm một bộ điều khiển bạn muốn đổi tên, tìm đường dẫn ACPI đầy đủ của nó và thay thế vào cái trong SSDT mẫu. Trong mẫu của tụi mình, tụi mình đổi tên `PCI0.GP13.XHC0` thành `SHC0` nên hãy thay đổi cho phù hợp.

![AsRock B450 missing ports](../../images/amd-mapping/amd-md/rename-ssdt.png)

**Lưu ý**: Trong những trường hợp hiếm hoi, macOS không thể tự xây dựng lại các cổng USB với bộ điều khiển USB "giả" mới. Trong mấy tình huống này, chúng ta cần thêm thủ công các cổng có mặt trong bộ điều khiển gốc vào nó (ví dụ HS01, HS02, POT1, v.v.).

> Nhưng làm sao tui map một bộ điều khiển không chuẩn hiện lên là PXSX?

Ý tưởng tương tự như đổi tên SSDT thông thường ngoại trừ việc bạn cần thực sự tìm ra bộ điều khiển đó. Việc này trở nên khó khăn vì SSD, bộ điều khiển mạng và các thiết bị PCIe chung chung khác cũng có thể hiện là PXSX. Kiểm tra đường dẫn ACPI trong IOreg để tìm đường dẫn của nó:

![](../../images/amd-mapping/amd-md/acpi-path.png)

Như chúng ta thấy, `IOACPIPlane:/_SB/PC00@0/RP05@1c0004/PXSX@0` sẽ được hiểu là as `SB.PC00.RP05.PXSX`

Và từ SSDT ở trên, chúng ta thay đổi như sau:

* `External (_SB_.PCI0.GP13, DeviceObj)` -> `External (_SB_.PC00.RP05, DeviceObj)`
* `External (_SB_.PCI0.GP13.XHC0, DeviceObj)` -> `External (_SB_.PC00.RP05.PXSX, DeviceObj)`
* `Scope (\_SB.PCI0.GP13)` -> `Scope (\_SB.PC00.RP05)`
* `Scope (XHC0)` -> `Scope (PXSX)`
