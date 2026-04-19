# Sửa máy không có tiếng bằng AppleALC

Vấn đề máy tính PC "im hơi lặng tiếng" sau khi cài macOS là chuyện rất hay gặp vì driver gốc của Apple (`AppleHDA.kext`) vốn được thiết kế chỉ để "nói chuyện" với mấy cái bộ giải mã (Codec) âm thanh tích hợp chất lượng cao được Apple tuyển chọn riêng cho máy Mac (thường là của Cirrus Logic). Tuy nhiên, có một điểm chung là dù chip giải mã âm thanh trên Laptop hay máy tính bàn của bạn là Realtek hay chip trên máy Mac là Cirrus Logic, thì tất cả các phần cứng này đều phải tuân thủ chuẩn **Intel High Definition Audio (Công nghệ âm thanh có độ trung thực cao của Intel)**, nên về mặt lý thuyết, driver của Apple vẫn có thể giao tiếp bình thường với chip của bạn nếu ta chỉ cho nó "định nghĩa" phần cứng trên máy bạn đúng cách. Đây chính là lúc chúng ta cần tới **AppleALC** đóng vai trò làm "trung gian" để thực hiện phương pháp vá nóng (hot-patching). Bạn vui lòng đọc tiếp phần dưới để biết thêm chi tiết.

Bạn cũng cần lưu ý là cách này chỉ áp dụng cho các chip âm thanh tích hợp chạy chuẩn Intel HDA; còn với những đời máy mới sử dụng DSP **Intel SST (Smart Sound Technology)** hoặc các loại card âm thanh rời qua cổng PCIe, USB của Creative hay Yamaha thì AppleALC hoàn toàn "vô tác dụng" do chúng không hoạt động theo cơ chế này đâu nè.

Để bắt đầu, tụi mình coi như bạn đã cài Lilu và AppleALC rồi nhé, nếu chưa chắc cú là nó đã được nạp ngon lành chưa, thì bạn chạy dòng lệnh sau trong Terminal (Cửa sổ dòng lệnh) để kiểm tra (Cái này cũng kiểm tra luôn AppleHDA đã lên chưa, vì cái đó không chạy thì AppleALC lấy gì mà vá trời):

```sh
kextstat | grep -E "AppleHDA|AppleALC|Lilu"
```

Nếu cả 3 thằng cùng hiện lên thì ngon. Và nhớ kỹ là **không được có** VoodooHDA trong đây. Nếu không là nó đá nhau chan chát với AppleALC đó.

Nếu bạn gặp lỗi gì thì ngó qua [phần Khắc phục sự cố](../universal/audio.md#troubleshooting) nha

## Tìm mã định danh sơ đồ chân cắm (layout ID) phù hợp cho card âm thanh của bạn

Trong ví dụ này, giả dụ codec (dễ hiểu là card âm thanh) của bạn là ALC1220. Để kiểm tra hàng của mình là loại nào, bạn có vài cách sau:

* Kiểm tra trang thông số kỹ thuật của mainboard (bo mạch chủ) hoặc sách hướng dẫn.
* Kiểm tra Device Manager (Trình quản lý thiết bị) trong Windows.
* Kiểm tra bằng cách chạy HWInfo64 trong Windows.
  * Nhớ bỏ tick 2 cái "Summary-only" và "Sensors-only" khi mở nhé.
* Kiểm tra bằng cách chạy AIDA64 Extreme trong Windows.
* Chạy lệnh `cat` trong terminal của Linux:
  * `cat /proc/asound/card0/codec#0 | less`

Có tên codec rồi, giờ mình sẽ đối chiếu nó với danh sách codec được AppleALC hỗ trợ:

* [Danh sách codec được AppleALC hỗ trợ](https://github.com/acidanthera/AppleALC/wiki/Supported-codecs)

Với con ALC1220, chúng ta sẽ thấy như sau:

```
0x100003, layout 1, 2, 3, 5, 7, 11, 13, 15, 16, 21, 27, 28, 29, 34
```

Cái dòng này nói lên 2 điều:

* Phiên bản phần cứng nào được hỗ trợ (`0x100003`), cái này chỉ quan trọng khi có nhiều phiên bản liệt kê với các layout khác nhau thôi.
* Các layout ID (ID bố cục) được codec hỗ trợ (`layout 1, 2, 3, 5, 7, 11, 13, 15, 16, 21, 27, 28, 29, 34`)

Giờ có danh sách layout ID rồi, mình bắt đầu "thử vận may" thôi. Vì sao phải thử từng cái?

* Mấy cái **Layout ID** - về mặt kỹ thuật là bản đồ chỉ đường (Mapping) từ chip giải mã ra loa ngoài của máy hoặc ra cổng âm thanh giúp macOS biết chính xác luồng tín hiệu nào dẫn ra loa hay micro tùy theo cách đi dây riêng biệt của mỗi hãng máy tính. Tất cả những sơ đồ này đều do cộng đồng phát triển. Driver của macOS không chứa sơ đồ chân cắm âm thanh của máy bạn nên đương nhiên máy không có tiếng rồi. 
* Cụ thể nó hướng dẫn macOS rằng: "Ê, trên con chip này nè, chân số 5 là nối ra loa, chân số 10 là nối vô micro đó nha". Vấn đề xảy ra khi cùng là con chip Realtek ALC256, nhưng ông Dell đi dây kiểu khác, hãng Asus lại đi dây kiểu khác. Và đó là lúc ta cần thử để biết cái nào phù hợp với máy của mình.

**Lưu ý**: Nếu bạn kiếm được thông tin Codec âm thanh của bạn là ALC 3XXX thì khả năng cao là cái máy cho bạn ăn "cú lừa", nó chỉ là cái tên bộ giải mã được "nâng cấp tên gọi che đi quá khứ" thôi (rebrand), chịu khó google xem tên thiệt của con điều khiển (controller) đó là gì nha.

* Ví dụ điển hình là con ALC3601, nhưng khi khởi động vào Linux thì "bộ mặt thiệt" của nó lộ ra là: ALC671

## Chọn ra mã định danh phù hợp

Để test mấy cái mã định danh, chúng ta sẽ xài tham số khởi động (boot-arg) `alcid=xxx` với xxx là cái mã định danh mà bạn chọn (có trong danh sách hỗ trợ ở trên). Nhớ là thử layout ID **từng cái một thôi nha**. Đừng có tham lam nhét nhiều ID hay nhiều dòng alcid vào cùng lúc, cái này không được thì thử cái tiếp theo, bạn cứ vậy mà làm cho tới khi máy có tiếng (đừng quên kiểm tra các jack cắm âm thanh và micro nha).

```
config.plist
├── NVRAM
  ├── Add
    ├── 7C436110-AB2A-4BBB-A880-FE41995C9F82
          ├── boot-args | String | alcid=11
```

Nếu thử hết mà không cái nào ăn thua, thì bạn nên thử tạo [bản vá SSDT-HPET](https://dortania.github.io/Getting-Started-With-ACPI/Universal/irq.html) cho máy bạn và thử lại lần nữa - cái bản vá này đa số bắt buộc phải có trên laptop và một số máy bàn để AppleHDA hoạt động được.

## Cố định sơ đồ chân cắm

Một khi bạn đã tìm được "chân ái" (Layout ID chạy full chức năng) cho con Hackintosh của bạn, chúng ta có thể chuyển sang giải pháp lâu dài hơn, cho nó giống cách máy Mac thiệt thiết lập Layout ID.

Với AppleALC, thứ tự ưu tiên khi nó nạp các thuộc tính được liệt kê như sau:

1. Tham số khởi động `alcid=xxx`, xài để debug (gỡ lỗi - chính là cái hồi nãy bạn thử từng ID một) là chính và nó sẽ ghi đè lên tất cả các giá trị khác.
2. Thuộc tính `alc-layout-id` trong DeviceProperties, **chỉ nên xài trên phần cứng Apple thiệt**
3. Thuộc tính `layout-id` trong DeviceProperties, **khuyên sử dụng cho cả phần cứng Apple và không phải Apple**

Bắt đầu thôi, chúng ta cần tìm xem cái Audio controller (Chip giải mã âm thanh) nằm ở đâu trên sơ đồ cổng PCI. Để tìm cái này, chúng ta cần xài một công cụ rất hay có tên là [gfxutil](https://github.com/acidanthera/gfxutil/releases), sau đó chạy trong Terminal của macOS:

```sh
path/to/gfxutil -f HDEF
```

![](../images/post-install/audio-md/gfxutil-hdef.png)

Sau đó bạn bổ sung cái PciRoot này cùng với thuộc tính con `layout-id` vào file config.plist của bạn tại mục DeviceProperties -> Add:

![](../images/post-install/audio-md/config-layout-id.png)

Lưu ý là AppleALC chấp nhận dữ liệu theo các dạng decimal/number (thập phân/số) và Hexadecimal/Data (thập lục phân/dữ liệu), nhưng cách tốt nhất là xài số theo dạng Thập lục phân luôn để đỡ phải chuyển đổi lằng nhằng. Bạn có thể xài [máy tính chuyển đổi hệ thập phân sang thập lục phân](https://www.rapidtables.com/convert/number/decimal-to-hex.html) để tính giá trị đặng nhập vô. Hoặc xài lệnh. `printf '%x\n' GIÁ_TRỊ_THẬP_PHÂN`:

![](../images/post-install/audio-md/hex-convert.png)

Ví dụ, `alcid=11` sẽ trở thành:

* `layout-id | Data | <0B000000>` <br>hoặc</br>
* `layout-id | Number | <11>`

Lưu ý là giá trị HEX/Data cuối cùng phải đủ 4 byte (ví dụ: `0B 00 00 00`), với các layout ID lớn hơn 255 (`FF 00 00 00`) thì cần nhớ là các byte sẽ bị đảo ngược (swapped). Nên số 256 sẽ thành `00 01 00 00`

* Mấy vụ đảo Hex với kích thước dữ liệu này có thể bỏ qua hoàn toàn nếu bạn xài cách nhập Decimal/Number (Số).

**Nhắc nhẹ**: Sau khi làm xong bước này bạn **PHẢI XÓA** cái tham số khởi động (boot-args) đi nha, bởi vì nó luôn nằm ở mức ưu tiên cao nhất nên AppleALC sẽ bơ đẹp mấy cái bạn vừa thêm trong DeviceProperties nếu bạn không xóa nó.

## Các vấn đề linh tinh khác

### Không xài được Mic-rô trên máy AMD

* Đây là bệnh chung khi xài AppleALC trên chip AMD, cụ thể là chưa có bản vá nào hỗ trợ cổng Mic tại ngõ vào hết. Hiện tại giải pháp "tốt nhất" là bạn mua cái DAC/Mic dạng USB hoặc chuyển sang sử dụng VoodooHDA.kext. Vấn đề của VoodooHDA là nó nổi tiếng không ổn định và chất lượng âm thanh nghe chán hơn AppleALC nhiều.

### Cùng một layout ID bên Clover xài được mà sang OpenCore thì tịt

Cái này khả năng cao là do xung đột IRQ (Yêu cầu ngắt), bên Clover nó có nguyên một rổ các bản vá nóng ACPI tự động áp dụng như phép thuật vậy. Sửa cái này bên OpenCore hơi "đau khổ" đó nhưng tùy chọn `FixHPET` trong [SSDTTime](https://github.com/corpnewt/SSDTTime) có thể xử lý hầu hết các trường hợp.

Với mấy ca khó đỡ mà RTC và HPET chiếm dụng IRQ của các thiết bị khác như USB và âm thanh, bạn có thể tham khảo ví dụ [Bản vá ACPI cho HP Compaq DC7900](https://github.com/khronokernel/trashOS/blob/master/HP-Compaq-DC7900/README.md#dsdt-edits) trong kho lưu trữ trashOS.

### Lỗi sập hệ thống (Kernel Panic) khi thay đổi trạng thái nguồn trên bản 10.15

* Mở PowerTimeoutKernelPanic trong config.plist của bạn lên (nếu chưa mở):
  * `Kernel -> Quirks -> PowerTimeoutKernelPanic -> True`

## Khắc phục sự cố

Để bắt bệnh, chúng ta cần điểm qua mấy cái bạn hay mắc lỗi:

* [Kiểm tra bạn cài đúng kext chưa](#kiem-tra-ban-cai-đung-kext-chua)
* [Kiểm tra xem AppleALC có thiệt sự vá lỗi chuẩn chỉnh chưa](#kiem-tra-xem-applealc-co-thiet-su-va-loi-chuan-chinh-chua)
* [Kiểm tra xem AppleHDA có còn zin không](#kiem-tra-xem-applehda-co-con-zin-khong)
* [AppleALC lúc chạy lúc không](#applealc-luc-chay-luc-khong)
* [AppleALC biểu tình không chạy khi máy có nhiều card âm thanh](#applealc-bieu-tinh-khong-chay-khi-may-co-nhieu-card-am-thanh)
* [AppleALC tịt ngòi khi khởi động lại từ Windows -> macOS](#applealc-tit-ngoi-khi-khoi-đong-lai-tu-windows-macos)

### Kiểm tra bạn cài đúng kext chưa

Đầu tiên, coi như bạn đã cài Lilu và AppleALC rồi, nếu chưa chắc chắn thì chạy lệnh này trong Terminal (Nó cũng kiểm tra luôn AppleHDA, vì thằng này không chạy thì AppleALC nghỉ chơi):

```sh
kextstat | grep -E "AppleHDA|AppleALC|Lilu"
```

Nếu cả 3 cùng hiện lên là ngon. Và nhớ đảm bảo **không có** VoodooHDA ở đây nha. Nó sẽ xung đột với AppleALC. Bạn cũng cần đảm bảo mình không cài một số kext khác như ví dụ dưới đây vô trong máy:

* RealtekALC.kext
* CloverALC.kext
* VoodooHDA.kext
* HDA Blocker.kext
* HDAEnabler#.kext(# có thể là 1, 2, hoặc 3)

Mấy cái kext này rất có thể bạn sẽ bỏ quên khi chuyển đổi từ Clover sang OpenCore. 

> Ê ní ơi, Lilu hoặc AppleALC không thấy hiện lên

Thường thì nơi tốt nhất để bắt đầu là lục lại mấy cái log (nhật ký) của OpenCore và kiểm tra xem Lilu và AppleALC có được nạp (inject) đúng cách không. Nó phải báo như vầy mới chuẩn:

```
14:354 00:020 OC: Prelink injection Lilu.kext () - Success
14:367 00:012 OC: Prelink injection AppleALC.kext () - Success
```

Nếu nó báo lỗi khi nạp (failed to inject):

```
15:448 00:007 OC: Prelink injection AppleALC.kext () - Invalid Parameter
```

Thì có mấy chỗ chính bạn cần kiểm tra xem tại sao:

* **Thứ tự nạp kext**: Bảo đảm rằng Lilu luôn nằm trên AppleALC trong danh sách thứ tự kext.
* **Tất cả kext phải là bản mới nhất**: Đặc biệt quan trọng với các plugin của Lilu, vì kext lệch phiên bản thường là nguyên nhân gây lỗi.

Lưu ý: Để thiết lập OpenCore ghi log ra file (nếu bạn không thấy), đọc lại phần [Gỡ lỗi OpenCore](https://dortania.github.io/OpenCore-Install-Guide/troubleshooting/debug.html).

### Kiểm tra xem AppleALC có thiệt sự vá lỗi chuẩn chỉnh chưa

Với AppleALC, một trong những cách dễ nhất để kiểm tra xem việc vá lỗi có chuẩn không là coi cái Audio controller (bộ giải mã âm thanh) của bạn đã được đổi tên đường dẫn ACPI (đổi sang dạng Mac hiểu) đúng chưa. Tải [IORegistryExplorer](https://github.com/khronokernel/IORegistryClone/blob/master/ioreg-302.zip) về và xem máy có nhận thiết bị HDEF chưa:

![](../images/post-install/audio-md/hdef.png)

Như bạn thấy trong hình trên, chúng ta có:

* Thiết bị HDEF, nghĩa là việc đổi tên đường dẫn đã thành công.
* AppleHDAController được đính kèm, nghĩa là kext âm thanh của Apple đã nhận diện thành công chip giải mã của bạn.
* `alc-layout-id` là một thuộc tính cho thấy việc nạp boot-arg hoặc DeviceProperty của chúng ta đã thành công.
  * Lưu ý: `layout-id | Data | 07000000` là layout mặc định và `alc-layout-id` sẽ ghi đè lên nó và trở thành layout mà AppleHDA sẽ sử dụng.

Lưu ý: **Đừng có tay nhanh hơn não tự đổi tên bộ điều khiển âm thanh thủ công nha**, cái này dễ gây lỗi vì AppleALC nó đang cố vá rồi. Cứ để AppleALC làm việc của nó.

**Thêm ví dụ**:

Chọn layout-id đúng          |  Chọn layout-id sai
:-------------------------:|:-------------------------:
![](../images/post-install/audio-md/right-layout.png)  |  ![](../images/post-install/audio-md/wrong-layout.png)

Như bạn thấy ở 2 hình trên, hình bên phải thiếu mất tiêu mấy cái thiết bị AppleHDAInput, nghĩa là AppleALC không thể liên lạc với các cổng vật lý/thiết bị âm thanh đầu ra như loa của bạn với sơ đồ mà nó được nạp. Nghĩa là bạn cần phải mò tiếp để tìm đúng Layout ID phù hợp cho máy mình rồi.

### Kiểm tra xem AppleHDA có còn zin không

Phần này chủ yếu dành cho mấy bác trước đây ngứa tay thay thế AppleHDA gốc bằng hàng chế (custom) khi còn xài Clover, bước này để xác minh xem hàng của bạn có phải chính chủ không:

```sh
sudo kextcache -i / && sudo kextcache -u /
```

Lệnh này sẽ kiểm tra chữ ký số của AppleHDA xem có hợp lệ không, nếu không thì bạn cần kiếm một cái file AppleHDA gốc khác cho máy của mình và thay thế vào, hoặc cập nhật macOS (kext sẽ được làm sạch khi cập nhật). Chuyện này chỉ xảy ra khi bạn tự tay vá AppleHDA thôi, chứ nếu cài mới tinh (fresh install) thì chuyện bị lỗi chữ ký lắm hầu như không có.

### AppleALC lúc chạy lúc không

Thỉnh thoảng có vài trường hợp hiếm gặp là phần cứng của bạn không kịp khởi động để AppleHDAController nhận diện, dẫn tới mất tiếng. Để lách qua vụ này, bạn có thể:

Thêm tham số khởi động để tăng thời gian chờ phần cứng:

```
alcdelay=1000
```

Hoặc chỉ định thông qua DeviceProperties (trong đường dẫn HDEF của bạn):

```
alc-delay | Number | 1000
```

Tham số khởi động/thuộc tính ở trên sẽ làm trễ AppleHDAController lại 1000 mili giây (1 giây), lưu ý là độ trễ ALC không được vượt quá [3000 ms](https://github.com/acidanthera/AppleALC/blob/2ed6af4505a81c8c8f5a6b18c249eb478266739c/AppleALC/kern_alc.cpp#L373)

### AppleALC biểu tình không chạy khi máy có nhiều card âm thanh

Trong mấy tình huống hiếm hoi máy bạn có 2 card âm thanh (ví dụ: Realtek tích hợp trên main và một cái card PCIe rời), bạn sẽ muốn AppleALC tự vá mấy thiết bị bạn không xài tới hoặc không cần vá (như mấy card PCIe chạy dạng native - tự nhận). Cái này đặc biệt quan trọng nếu bạn thấy AppleALC không chịu vá cái chip giải mã âm thanh tích hợp trên main khi đang cắm cái card rời kia. Cụ thể là mấy cái card rời này, một số dòng card (VD như Creative Sound Blaster X-Fi có chế độ UAA mode, biến nó hoạt động theo chuẩn Intel HDA, khi AppleALC phát hiện thấy 2 thiết bị Intel HDA nó sẽ bị lú vì không biết cái nào mới là cái cần patch).

Để khắc phục, đầu tiên chúng ta cần xác định đường dẫn ACPI của cả hai cái card âm thanh. Cách dễ nhất là chạy [gfxutil](https://github.com/acidanthera/gfxutil/releases) và kiếm mã định danh PCI:

```sh
/path/to/gfxutil
```

Giờ với cái đống output dài ngoằng đó, bạn cần tìm đường dẫn PciRoot của mình. Ví dụ, ta có con card âm thanh PCIe Creative Sound-Blaster AE-9PE. Với con này, chúng ta biết PCI ID là `1102:0010`. Soi vào output của gfxutil ta thấy:

```
66:00.0 1102:0010 /PC02@0/BR2A@0/SL05@0 = PciRoot(0x32)/Pci(0x0,0x0)/Pci(0x0,0x0)
```

Từ đây, thấy rõ đường dẫn PciRoot là:

```
PciRoot(0x32)/Pci(0x0,0x0)/Pci(0x0,0x0)
```

* **Lưu ý**: Cái này giả định là bạn biết cả Vendor ID (ID nhà sản xuất) và Device ID (ID thiết bị) của cái card âm thanh rời. Để tham khảo thì đây là mấy cái Vendor ID phổ biến:
  * Creative Labs: `1102`
  * AsusTek: `1043`
* **Lưu ý số 2**: Đường dẫn ACPI và PciRoot trên máy của bạn sẽ khác ví dụ đó, nên hãy chú ý vào cái đường dẫn **bạn tìm được** bằng gfxutil

Giờ có đường dẫn PciRoot rồi, mở config.plist lên và thêm bản vá thôi.

Dưới mục DeviceProperties -> Add, bạn thêm PciRoot của bạn (dưới dạng Dictionary) với thuộc tính con tên là `external-audio`:

```
DeviceProperties
| --- > Add
 | --- > PciRoot(0x32)/Pci(0x0,0x0)/Pci(0x0,0x0)
  | ----> external-audio | Data | 01
```

![](../images/post-install/audio-md/external-audio.png)

Xong xuôi thì khởi động lại và AppleALC sẽ bơ đẹp cái card âm thanh rời của bạn luôn!

### AppleALC tịt ngòi khi khởi động lại từ Windows -> macOS

Nếu bạn thấy khởi động lại từ Windows sang macOS làm máy bị mất tiếng, tụi mình khuyên bạn nên thêm tham số khởi động `alctcsel=1` hoặc thêm thuộc tính này vào trong đường dẫn cái chip giải mã âm thanh tại DeviceProperties:

```
DeviceProperties
| --- > Add
 | --- > PciRoot(0x32)/Pci(0x0,0x0)/Pci(0x0,0x0) (Chỉnh lại cho đúng với máy của bạn)
  | ----> alctcsel | Data | 01000000
```
