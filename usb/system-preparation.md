# Chuẩn bị hệ thống

Mục lục:

* [Chuẩn bị hệ thống](#system-preparation)
* [Kiểm tra xem cần đổi tên cái gì](#checking-what-renames-you-need)
* [Chia tay mỗi người một ngả](#parting-ways)

Trước khi chúng ta có thể lập bản đồ USB (map USB), cần phải thiết lập vài thứ cái đã:

* [USBInjectAll](https://github.com/Sniki/OS-X-USB-Inject-All/releases) nằm trong EFI/OC/Kexts và cả config.plist -> Kernel -> Add
  * Chúng ta cần kext này để đảm bảo bất kỳ cổng nào chưa được định nghĩa trong ACPI vẫn sẽ hiện lên trong macOS. Lưu ý là cái này *lẽ ra không cần thiết* trên Skylake và mới hơn vì các cổng USB đã được định nghĩa trong ACPI rồi.
    * Tuy nhiên, vì mấy ông OEM (nhà sản xuất) không phải lúc nào cũng khai báo cổng đầy đủ ngay cả trên dòng sản phẩm mới của họ, nên tụi mình khuyên tất cả bạn đọc xài vi xử lý Intel cứ xài USBInjectAll cho đến khi map xong xuôi hẳn.
  * Lưu ý rằng là kext này **không xài được với AMD**
* config.plist -> Kernel -> Quirks -> XhciPortLimit -> True
  * Để chúng ta có thể tạm thời lách qua cái giới hạn 15 cổng để map cho dễ.
* config.plist -> ACPI -> Patch -> EHCI và bản vá đổi tên ACPI cho XHCI (Controller USB 3.0 á)

Lý do chúng ta cần mấy cái bản vá đổi tên ACPI này là do xung đột với sơ đồ USB của chính Apple. Có một sự thật thú vị là ngay cả Apple cũng phải lập sơ đồ USB đó! Bạn thực sự có thể tìm thấy sơ đồ USB do Apple lập trình bên trong IOUSBHostFamily.kext -> PlugIns -> AppleUSBHostPlatformProperties.kext trên Catalina, mặc dù các máy Mac đời mới thiệt ra lập sơ đồ cổng bằng bảng ACPI của tụi nó.

Mấy cái SMBIOS **không cần** đổi tên ACPI:

* iMac18,x và mới hơn
* MacPro7,1 và mới hơn
* Macmini8,1 và mới hơn
* MacBook9,x  và mới hơn
* MacBookAir8,x  và mới hơn
* MacBookPro13,x và mới hơn

Và với các SMBIOS cũ hơn (mấy cái không nằm trong danh sách trên), chúng ta cần đảm bảo rằng bản đồ cổng (port map) của chúng không được nạp vào khi chúng ta đang cố tự map cổng. Nếu không thì một vài cổng sẽ "bốc hơi", và làm ơn kiểm tra xem bạn có mấy cổng này trong bảng ACPI không **trước khi** áp dụng mấy bản vá này, vì chúng ta không muốn vá nhầm thiết bị đâu. Nếu bạn thấy bộ điều khiển USB của mình cần đổi tên, hãy ghi lại tên gốc của nó trước khi đổi vì điều này sẽ giúp việc map USB sau này dễ thở hơn chút:

* **XHC1 sang SHCI**: Cần cho Skylake và SMBIOS cũ hơn.

| Key | Type | Value |
| :--- | :--- | :--- |
| Comment | String | XHC1 to SHCI |
| Count | Number | <0> |
| Enabled | Boolean | YES |
| Find | Data | <58484331> |
| Limit | Number | <0> |
| Replace | Data | <53484349> |
| Skip | Number | <0> |
| TableLength | Number | <0> |
| TableSignature | Data | <> |

* **EHC1 sang EH01**: Cần cho Broadwell và SMBIOS cũ hơn.

| Key | Type | Value |
| :--- | :--- | :--- |
| Comment | String | EHC1 to EH01 |
| Count | Number | <0> |
| Enabled | Boolean | YES |
| Find | Data | <45484331> |
| Limit | Number | <0> |
| Replace | Data | <45483031> |
| Skip | Number | <0> |
| TableLength | Number | <0> |
| TableSignature | Data | <> |

* **EHC2 sang EH02**: Cần cho Broadwell và SMBIOS cũ hơn.

| Key | Type | Value |
| :--- | :--- | :--- |
| Comment | String | EHC2 to EH02 |
| Count | Number | <0> |
| Enabled | Boolean | YES |
| Find | Data | <45484332> |
| Limit | Number | <0> |
| Replace | Data | <45483032> |
| Skip | Number | <0> |
| TableLength | Number | <0> |
| TableSignature | Data | <> |

## Kiểm tra xem cần đổi tên cái gì

Vụ đổi tên này check cũng dễ ợt à, đầu tiên xem bạn đang dùng SMBIOS nào (tìm trong config.plist dưới mục `PlatformInfo -> Generic -> SystemProductName`) và xem coi bạn có cần đổi tên không:

SMBIOS chỉ cần đổi tên XHC1:

* iMacPro1,1
* iMac17,x và cũ hơn
* MacBookAir7,x

SMBIOS cần đổi tên cả XHC1 và EHC1:

* MacPro6,1
* Macmini7,1
* MacBook8,x
* MacBookAir6,x
* MacBookPro12,x

SMBIOS cần đổi tên cả XHC1, EHC1 và EHC2:

* iMac16,x và cũ hơn
* MacPro5,1 và cũ hơn
* Macmini6,x và cũ hơn
* MacBookAir5,x  và cũ hơn
* MacBookPro11,x và cũ hơn

Giờ đã biết SMBIOS của mình cần đổi tên gì rồi, tiếp theo chúng ta check tên của bộ điều khiển USB.

### Kiểm tra IOService

Thử lấy XHC1 và chạy lệnh sau:

```sh
ioreg -l -p IOService -w0 | grep -i XHC1
```

Nếu thấy cái này, bạn cần đổi tên: |  Nếu thấy cái này, khỏi cần đổi:
:-------------------------:|:-------------------------:
![](../images/system-preperation-md/ioreg-name.png)  |  ![](../images/system-preperation-md/no-rename-needed.png)

Lặp lại bước này cho tất cả các thiết bị xung đột liên quan khác (ví dụ EHC1, EHC2) như được liệt kê trong bảng trên cho model của bạn.

```sh
ioreg -l -p IOService -w0 | grep -i EHC1
ioreg -l -p IOService -w0 | grep -i EHC2
```

**Nếu không ra kết quả gì (như hình bên phải)**, bạn không cần bổ sung bản vá đổi tên nào cả.

**Nếu 1 trong 3 cái lệnh trên trả về kết quả (như hình bên trái)**, cái nào hiện ra thì bạn cần đổi tên cái đó.

Nếu bạn thuộc nhóm cần đổi tên, giờ hãy thêm mấy cái bản vá ACPI cần thiết vào config.plist -> ACPI -> Patch, bạn có thể tìm file làm sẵn ở đây (nhớ bật mấy cái bạn cần thôi nhé):

* **[usb-rename.plist](https://github.com/dortania/OpenCore-Post-Install/blob/master/extra-files/usb-rename.plist)**
  * Đơn giản là copy mấy cái patch cần thiết vào config.plist của bạn thôi.

# Chia tay mỗi người một ngả

Nhưng giờ chúng ta phải chia làm 2 ngả đường, tùy thuộc vào phần cứng bạn đang sở hữu:

* [Lập sơ đồ cổng USB cho máy Intel](../usb/intel-mapping/intel.md)
  * Quy trình được tự động hóa, nhưng chỉ dành cho Intel thôi nhé.
* [Lập sơ đồ cổng USB thủ công](../usb/manual/manual.md)
  * Quy trình từng bước một, là cách duy nhất để map đúng cho AMD và các bộ điều khiển USB của bên thứ 3.
