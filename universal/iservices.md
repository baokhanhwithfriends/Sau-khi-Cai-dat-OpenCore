# Sửa lỗi iMessage và các dịch vụ khác không sử dụng được trên OpenCore

Trang này dành cho mấy bác đang vật vã với iMessage và các món iServices (Dịch vụ của Apple) khác. Đây là hướng dẫn cơ bản thôi nên sẽ không đi sâu vào chi tiết như mấy cuốn "bí kíp" dày cộm khác đâu. Hướng dẫn cụ thể này là bản dịch và diễn giải lại từ Hướng dẫn AppleLife về cách sửa lỗi iServices: [Как завести сервисы Apple - iMessage, FaceTime, iCloud](https://applelife.ru/posts/727913).

**Cái tài khoản Apple của bạn là trùm cuối quyết định việc có xài được iServices hay không...**

Nếu bạn đã có sẵn đồ Apple trong tài khoản, ví dụ như một con iPhone, thì bạn cứ ung dung mà xài bộ số serial (số sê-ri) tự tạo, không sao hết. Tuy nhiên, nếu bạn mới lập tài khoản, chưa có miếng phần cứng Apple nào hay chưa mua gì trên App Store, thì có thể bạn sẽ phải gọi điện cho Apple một chuyến sau khi đăng nhập đó.

Mấy món dưới đây sẽ được tạo ra trong bài hướng dẫn này và bắt buộc phải có để xài được iServices:

* MLB
* ROM*
* SystemProductName
* SystemSerialNumber
* SystemUUID

::: tip LƯU Ý

Với ROM, chúng ta sử dụng MAC Address (Địa chỉ MAC) của card mạng, viết thường và bỏ hết mấy dấu hai chấm `:`.

:::

**Lưu ý cực mạnh**: Bạn và chỉ mình bạn chịu trách nhiệm cho cái AppleID của bạn. Đọc hướng dẫn cho kỹ và tự chịu trách nhiệm nếu lỡ tay làm hư hỏng gì đó nha. Dortania và mấy cái hướng dẫn khác không chịu trách nhiệm cho những gì **BẠN** làm đâu nhé.

## Sử dụng GenSMBIOS

Tải [GenSMBIOS](https://github.com/corpnewt/GenSMBIOS) về và sau đó bấm số 1 trên bàn phím để tải MacSerial và tiếp theo chọn số 3 để tạo vài con serial mới. Cái chúng ta đang tìm kiếm là một serial hợp lệ nhưng hiện tại chưa có ngày mua (chưa được kích hoạt bảo hành).

Mẹo: Gõ `iMacPro1,1 10` nó sẽ in ra 10 cái serial một lúc, đỡ mất công ngồi bấm nhiều lần.

![](../images/post-install/iservices-md/serial-list.png)

## Sử dụng macserial

Cái này dành cho mấy bác xài Linux hoặc muốn thay thế GenSMBIOS bằng phần mềm khác.

Tạo Serial mới và Board Serial (MLB) cho model máy của bạn.

Để tạo cái này bạn cần có macserial.

Bạn có thể tải [Bản phát hành OpenCorePkg mới nhất tại đây.](https://github.com/acidanthera/OpenCorePkg/releases)

Hoặc tự biên dịch bản [macserial](https://github.com/acidanthera/OpenCorePkg/tree/master/Utilities/macserial) đang được phát triển tích cực từ mã nguồn.

```bash
git clone --depth 1 https://github.com/acidanthera/OpenCorePkg.git
cd ./OpenCorePkg/Utilities/macserial/
make
chmod +x ./macserial
```

Tìm cái **SystemProductName** trong file config.plist của bạn. Đó là mã model máy đó.

Thay thế `"iMacPro1,1"` bên dưới bằng SystemProductName trong config.plist của bạn.

```bash
./macserial --num 1 --model "iMacPro1,1" 
```

Ví dụ kết quả đầu ra:

```bash
$ ./macserial \
        --model "iMacPro1,1" 
Warning: arc4random is not available!
C02V7UYGHX87 | C02733401J9JG36A8
```

Giá trị bên trái là **Serial number** (Số sê-ri) của bạn..
Giá trị bên phải là **Board Serial (MLB)** của bạn.

## Chọn một địa chỉ MAC

Chọn một địa chỉ MAC có OUI (Mã định danh duy nhất của tổ chức) tương ứng với giao diện mạng của Apple "xịn".

Xem danh sách sau:

[https://gitlab.com/wireshark/wireshark/-/raw/master/manuf](https://gitlab.com/wireshark/wireshark/-/raw/master/manuf)

Ví dụ:

```
00:16:CB    Apple   Apple, Inc.
```

Tự bịa ra 3 nhóm (octet) cuối.

Ví dụ:

```
00:16:CB:00:11:22
```

## Suy ra giá trị ROM tương ứng

ROM được tính từ địa chỉ MAC của bạn.

Viết thường địa chỉ MAC, và bỏ hết mấy dấu hai chấm `:` ở giữa các nhóm số.

Ví dụ:

**MAC:** `00:16:CB:00:11:22`

**ROM:** `0016cb001122`

## Tạo UUID

Gõ lệnh `uuidgen` trong Terminal

```bash
$ uuidgen
976AA603-75FC-456B-BC6D-9011BFB4968E
```

Sau đó chỉ việc thay thế mấy giá trị đó vào config.plist của bạn:

|Key|Data|
|---|---|
|MLB|`C02733401J9JG36A8`|
|Mac Address|`00:16:CB:00:11:22`|
|ROM|`0016cb001122`|
|SystemProductName|`iMacPro1,1`|
|SystemSerialNumber|`C02V7UYGHX87`|
|SystemUUID|`976AA603-75FC-456B-BC6D-9011BFB4968E`|

Nó sẽ trông giống thế này:

```xml
    <key>MLB</key>
    <string>C02733401J9JG36A8</string>
    <key>ROM</key>
    <data>0016cb001122</data>
    <key>SpoofVendor</key>
    <true/>
    <key>SystemProductName</key>
    <string>iMacPro1,1</string>
    <key>SystemSerialNumber</key>
    <string>C02V7UYGHX87</string>
    <key>SystemUUID</key>
    <string>976AA603-75FC-456B-BC6D-9011BFB4968E</string>
```

LƯU Ý: Nếu bạn gặp rắc rối khi dùng App Store, bạn [có thể cần phải sửa lỗi En0](#sua-loi-en0), tùy thuộc vào phần cứng của bạn.

Mấy cái tài khoản Apple mới tạo gần như chắc chắn sẽ không đăng nhập được đâu. Có sẵn mấy cái thiết bị Apple khác trong tài khoản thì khả năng thành công cao hơn nhiều.

Nếu bạn thấy [cảnh báo hỗ trợ, xem bên dưới](#hien-thi-ma-loi-khach-hang).

## Kiểm tra tính hợp lệ của số Serial

Giờ bạn nhập cái serial đó vào [Apple Check Coverage page (Trang kiểm tra phạm vi bảo hành của Apple)](https://checkcoverage.apple.com/), bạn sẽ nhận được 1 trong 3 phản hồi sau từ máy chủ:

We're sorry, we're unable to check coverage for this serial number (Rất tiếc, chúng tôi không thể kiểm tra phạm vi bảo hành cho số sê-ri này) |  Valid Purchase Date (Ngày mua hợp lệ) | Purchase Date not Validated (Chưa thể xác thực ngày mua)
:-------------------------:|:-------------------------:|:-------------------------:
![](../images/post-install/iservices-md/not-valid.png) | ![](../images/post-install/iservices-md/valid.png) |  ![](../images/post-install/iservices-md/no-purchase.png)

::: tip MẸO

Copy và paste số serial nhé, vì serial định dạng sai cũng sẽ trả về thông báo "We're sorry, we're unable to check coverage for this serial number."

:::

Cái đầu tiên (báo lỗi không kiểm tra được) chính là cái chúng ta cần tìm (bạn cũng có thể dùng cái thứ 3 - chưa xác thực ngày mua, nhưng không khuyến khích vì có nguy cơ trùng với một máy Mac thật). Giờ chúng ta có thể điền các giá trị còn lại vào config.plist -> PlatformInfo -> Generic:

* Type = SystemProductName
* Serial = SystemSerialNumber
* Board Serial = MLB
* SmUUID = SystemUUID

::: tip GHI NHỚ

Mặc dù tùy chọn đầu tiên (serial không tồn tại) sẽ sử dụng được với hầu hết mọi người, nhưng lưu ý là nếu tài khoản của bạn có "lịch sử đen" với Apple/iServices thì bạn có thể cần một cái serial loại "Purchase Date not Validated" (Ngày mua chưa xác thực). Nếu không thì dễ bị Apple nghi ngờ lắm.

:::

::: warning CẢNH BÁO

Sử dụng serial loại "Purchase Date not Validated" có thể gây rắc rối về sau nếu một máy khác có cùng serial đó được kích hoạt. Để thiết lập ban đầu thì nó giúp tài khoản Apple mới tạo đỡ bị soi, nhưng về lâu về dài thì chọn serial không hợp lệ (cái đầu tiên) vẫn là lựa chọn an toàn hơn.

:::

::: tip MẸO

Check serial nhiều quá có thể khiến bạn bị chặn không cho tra cứu nữa (rate limited). Để lách lỗi thì thử xóa cookie hoặc đổi địa chỉ IP nhé.

:::

## Sửa lỗi en0

Để bắt đầu, lôi cổ [Hackintool](https://github.com/headkaze/Hackintool) về và vào mục System -> Peripherals (Info -> Misc trên mấy bản Hackintool cũ).

Ở đây, dưới phần Network Interfaces (biểu tượng card mạng), tìm `en0` dưới cột `BSD` và kiểm tra xem thiết bị đó có dấu tích ở cột built-in (tích hợp) hay không. Nếu có tích rồi thì bỏ qua, nhảy tới phần Sửa lỗi ROM, còn không thì đọc tiếp.

* **Lưu ý**: `en0` có thể là Wifi, ethernet hay thậm chí là Thunderbolt. Loại nào không quan trọng, miễn là nó có mặt và được đánh dấu là built-in.

### Lỡ tui không có En0 luôn thì sao?!?

Thì chúng ta sẽ reset lại cài đặt mạng của macOS để nó tạo mới các giao diện mạng; mở Terminal và chạy lệnh sau:

```
sudo rm /Library/Preferences/SystemConfiguration/NetworkInterfaces.plist
sudo rm /Library/Preferences/SystemConfiguration/preferences.plist
```

Xong xuôi thì khởi động lại và kiểm tra lần nữa.

Nếu vẫn không ăn thua, thêm [NullEthernet.kext](https://bitbucket.org/RehabMan/os-x-null-ethernet/downloads/) và [ssdt-rmne.aml](https://github.com/RehabMan/OS-X-Null-Ethernet/blob/master/ssdt-rmne.aml) vào EFI của bạn và khai báo trong config.plist dưới mục Kernel -> Add và ACPI -> Add tương ứng. Cái SSDT đã được biên dịch sẵn rồi nên không cần làm gì thêm, nhắc nhẹ là file biên dịch có đuôi .aml còn .dsl là mã nguồn nha.

### Làm cho en0 hiện là built-in

![Find if set as Built-in](../images/post-install/iservices-md/en0-built-in-info.png)

Giờ vào tab PCI của Hackintool và xuất PCI DeviceProperties (Thuộc tính thiết bị PCI) ra, nó sẽ tạo file pcidevices.plist trên màn hình desktop.

![Export PCI address](../images/post-install/iservices-md/hackintool-export.png)

Giờ tìm trong file pcidevices.plist đó sẽ chứa cái đường dẫn PciRoot của card mạng ethernet (ethernet controller) của bạn. Ví dụ với tụi mình là `PciRoot(0x0)/Pci(0x1f,0x6)`

![Copy PciRoot](../images/post-install/iservices-md/find-en0.png)

Có cái PciRoot rồi, vào config.plist -> DeviceProperties -> Add và thêm thuộc tính `built-in` với kiểu là `Data` và giá trị là `01`

![Add to config.plist](../images/post-install/iservices-md/config-built-in.png)

## Sửa lỗi phần ROM

Phần này nhiều người hay quên lắm nhưng nó nằm trong config.plist của bạn dưới mục PlatformInfo -> Generic -> ROM.

Để tìm giá trị MAC Address/ROM máy của bạn, có thể tìm ở vài chỗ:

* BIOS
* Trên macOS: System Preferences -> Network -> Ethernet -> Advanced -> Hardware -> MAC Address
* Trên Windows: Settings -> Network & Internet -> Ethernet -> Ethernet -> Physical MAC Address

* **Lưu ý**: en0 có thể là Wifi, ethernet hoặc Thunderbolt, tùy cơ ứng biến theo tình huống của bạn nhé.

Một số dân chơi thứ thiệt còn xài bản dump địa chỉ MAC của máy Apple thiệt cho config của họ, nhưng trong hướng dẫn này tụi tui dùng địa chỉ MAC thiệt của máy mình, cơ mà biết thêm tùy chọn kia cũng tốt.

Khi thêm cái này vào config, `c0:7e:bf:c3:af:ff` phải được chuyển thành `c07ebfc3afff` vì kiểu dữ liệu `Data` không chấp nhận dấu hai chấm (`:`).

![](../images/post-install/iservices-md/config-rom.png)

## Kiểm tra NVRAM

Một điều mà nhiều người quên béng mất về iServices là NVRAM cực kỳ quan trọng để nó hoạt động đúng, lý do là các khóa iMessage và mấy thứ linh tinh được lưu trong NVRAM. Không có NVRAM thì iMessage khỏi nhìn thấy hay lưu khóa gì đâu.

Vậy nên chúng ta cần kiểm tra xem NVRAM có hoạt động không, bất kể lý thuyết là "nó phải chạy" vì một số firmware khó ở hơn số khác.

Vui lòng tham khảo phần [Giả lập bộ nhớ NVRAM](../misc/nvram.md) của Hướng dẫn Sau khi cài đặt OpenCore để test xem máy bạn có NVRAM không, đồng thời giả lập nó nếu máy bạn không có.

## Dọn dẹp tàn dư cũ

Cái này quan trọng cho mấy bác đã thử cài iMessage mà thất bại, để bắt đầu thì hãy chắc chắn NVRAM đã được xóa sạch. Bạn có thể bật tùy chọn này trong menu khởi động (boot picker) trong config tại config.plist -> Misc -> Security -> AllowNvramReset.

Tiếp theo mở terminal và chạy lệnh sau (copy paste cho lẹ):

```
bash
sudo rm -rf ~/Library/Caches/com.apple.iCloudHelper*
sudo rm -rf ~/Library/Caches/com.apple.Messages*
sudo rm -rf ~/Library/Caches/com.apple.imfoundation.IMRemoteURLConnectionAgent*
sudo rm -rf ~/Library/Preferences/com.apple.iChat*
sudo rm -rf ~/Library/Preferences/com.apple.icloud*
sudo rm -rf ~/Library/Preferences/com.apple.imagent*
sudo rm -rf ~/Library/Preferences/com.apple.imessage*
sudo rm -rf ~/Library/Preferences/com.apple.imservice*
sudo rm -rf ~/Library/Preferences/com.apple.ids.service*
sudo rm -rf ~/Library/Preferences/com.apple.madrid.plist*
sudo rm -rf ~/Library/Preferences/com.apple.imessage.bag.plist*
sudo rm -rf ~/Library/Preferences/com.apple.identityserviced*
sudo rm -rf ~/Library/Preferences/com.apple.ids.service*
sudo rm -rf ~/Library/Preferences/com.apple.security*
sudo rm -rf ~/Library/Messages
```

## Kiểm tra lại lần cuối

Lấy macserial từ [Bản phát hành OpenCore mới nhất](https://github.com/acidanthera/OpenCorePkg/releases) và chạy lệnh sau:

```
path/to/macserial -s
```

Nó sẽ show ra toàn bộ thông tin hệ thống của bạn, kiểm tra xem nó có khớp với những gì bạn vừa làm không.

## Dọn dẹp tồn dư tài khoản Apple của bạn

* Gỡ bỏ hết các thiết bị cũ khỏi tài khoản Apple: [Quản lý thiết bị](https://appleid.apple.com/account/manage)
* Mở xác thực 2 bước
* Xóa hết các iServices khỏi Keychain, ví dụ vài cái:

```
ids: identity-rsa-key-pair-signature-v1
ids: identity-rsa-private-key
ids: identity-rsa-public-key
ids: message-protection-key
ids: message-protection-public-data-registered
ids: personal-public-key-cache
iMessage Encryption Key
iMessage Signing Key
com.apple.facetime: registrationV1
etc ...
```

Và một lớp bảo vệ cuối cùng là tạo một tài khoản Apple mới để vọc vạch, cái này bảo đảm nếu bạn xui xẻo bị đưa vào danh sách đen (blacklist) thì cũng không ảnh hưởng đến tài khoản chính.

::: tip MẸO

Thêm thẻ thanh toán vào tài khoản và mua vài món đồ cũng giúp ích bạn đó. Tuy không chắc chắn 100%, nhưng bạn cứ tưởng tượng Tài khoản Apple như điểm tín dụng vậy, bạn càng là khách hàng "sộp" của Apple thì càng ít khả năng bị lỗi kích hoạt hoặc dễ được Apple Support bỏ qua hơn.

:::

## Hiển thị mã lỗi khách hàng

Thôi xong, chúc mừng bạn đã quay vào ô hết lượt. Bạn đã làm tài khoản Apple của mình bị đưa vô danh sách đen (blacklist) rồi. Cách sửa thì đơn giản nhưng mà cần phải hoạt động cơ miệng tí, **bạn PHẢI gọi cho [Apple](https://support.apple.com/en-us/HT201232)**. Nếu không gọi thì chỉ còn nước lập nick mới thôi. Thêm thẻ thanh toán trước khi gọi có thể giúp tài khoản trông uy tín hơn, đỡ giống nick ảo (bot).

![](../images/post-install/iservices-md/blacklist.png)

* Để liên hệ Apple, bạn có 2 cách:
  * Để Apple gọi lại cho bạn: [Hỗ trợ Apple](https://getsupport.apple.com/). Bạn phải chọn vào Apple ID rồi chọn iCloud, Facetime & Messages. Giờ bấm vào "Talk to Apple Support Now" và nhập số điện thoại của bạn vào.
  * Tự gọi cho Apple để được hỗ trợ, tìm số theo quốc gia của bạn trong danh sách này: [Số điện thoại tới tổng đài hỗ trợ của Apple)](https://support.apple.com/HT201232)
  * Nhớ đừng có nói là đăng nhập trên Hackintosh không là "đi" luôn cái Apple ID đó
