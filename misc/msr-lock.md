# Sửa lỗi khóa cấu hình CFG Lock (Mở khóa thanh ghi MSR 0xE2)

Phần này mình khuyên thực hiện cho những bạn đã cài xong macOS. Còn bạn nào đang trong quá trình cài đặt lần đầu thì cứ tạm thời mở `AppleCpuPmCfgLock` và `AppleXcpmCfgLock` trong `Kernel -> Quirks` nha.

* Lưu ý: Chỉ dành cho anh em xài Intel. Đội đỏ AMD hổng có vụ CFG Lock này đâu, bạn có thể bỏ qua.

## Vậy CFG-Lock là cái gì

CFG-Lock là một thiết lập trong BIOS cho phép ghi vào một thanh ghi cụ thể (trong trường hợp này là MSR 0xE2). Theo mặc định, hầu hết các bo mạch chủ PC đều khóa biến này, thậm chí nhiều bo mạch còn ẩn hoàn toàn tùy chọn này trong giao diện người dùng của BIOS. Và lý do chúng ta quan tâm đến cái này là vì macOS rất thích "động chạm" vào thanh ghi này để điều phối điện năng cho CPU, lưu ý không chỉ riêng macOS. Thay vào đó, cả Kernel (XNU) và kext AppleIntelPowerManagement đều cần thanh ghi này để hoạt động. Nếu nó bị khóa, máy bạn dễ bị kernel panic (treo máy màn hình đen/trắng) hoặc chạy không tối ưu.

Mình có 2 cách trị:

#### 1. Vá macOS để nó "né" phần cứng

* Cách này đôi khi gây mất ổn định và phải vá đi vá lại mỗi khi cập nhật.
* Hai bản vá quen thuộc mà chúng ta thường thấy trong hướng dẫn của OpenCore:
  * `AppleCpuPmCfgLock` dành riêng cho kext AppleIntelPowerManagement.kext
  * `AppleXcpmCfgLock` dành riêng cho Kernel(XNU)

#### 2. Mở khóa thẳng trong BIOS để cho phép ghi vào thanh MSR E2

* Phương pháp này được ưa chuộng hơn nhiều, vì tránh được việc phải vá lỗi, cho phép linh hoạt hơn về độ ổn định và nâng cấp hệ điều hành thoải mái hơn.

Lưu ý: Máy tính đời Penyrn trở xuống thực tế không cần phải lo lắng về việc mở khóa thanh ghi này (tức là đời CPU này không có tính năng này đó!).

## Kiểm tra xem firmware của máy bạn có cho phép mở khoá CFG Lock không

Trước khi tiếp tục với phần còn lại của hướng dẫn này, trước tiên bạn cần kiểm tra xem firmware của mình có hỗ trợ mở khóa CFG Lock hay không.

Để kiểm tra, bạn có thể thực hiện theo hai cách:

1. [Sử dụng phiên bản OpenCore DEBUG và kiểm tra log nói gì về người tình trăm năm CFG Lock](#kiem-tra-qua-log-cua-opencore)
2. [Sử dụng công cụ có tên `ControlMsrE2` để bứt tốc quá trình kiểm tra](#xai-cong-cu-controlmsre2-đe-kiem-tra)

### Kiểm tra qua log của OpenCore

Đối với bạn đọc thích sử dụng phiên bản DEBUG ngay từ đầu, bạn cần kích hoạt chức năng DEBUG của OpenCore bằng cách đặt `Target` thành `67` và boot vào OpenCore. Thao tác này sẽ cung cấp cho bạn một tệp có định dạng `opencore-YYYY-MM-DD-hhmmss.txt` ở thư mục gốc (root) của phân vùng EFI.

Trong tệp này, bạn tìm kiếm dòng `OCCPU: EIST CFG Lock`:

```
OCCPU: EIST CFG Lock 1
```

Nếu máy trả lời giá trị `1`, tức là đang bị khóa -> Phải làm tiếp hướng dẫn bên dưới [Vô hiệu hoá CFG Lock](#vo-hieu-hoa-cfg-lock).

Nếu không (VD: `0`), tức là đã mở -> Quá ngon, tắt 2 cái Quirks `Kernel -> Quirks -> AppleCpuPmCfgLock` và `Kernel -> Quirks -> AppleXcpmCfgLock` là xong nhé.

### Xài công cụ ControlMsrE2 để kiểm tra

Để bắt đầu, bạn tải [ControlMsrE2](https://github.com/acidanthera/OpenCorePkg/releases) và thêm công cụ này vào `EFI/OC/Tools` và `config.plist` (bạn có thể thao tác nhanh bước này bằng tính năng snapshot của ProperTree (VD: Cmd+R)). Tiếp theo, boot vào menu OpenCore và chọn mục `ControlMsrE2.efi`. Chạy cái này sẽ trả lại cho bạn một trong những kết quả sau:

* Nếu CFG-Lock đã được kích hoạt:

```
This firmware has LOCKED MSR 0xE2 register!
```

* Nếu CFG-Lock đã bị vô hiệu hóa:

```
This firmware has UNLOCKED MSR 0xE2 register!
```

Đối với trường hợp đầu tiên, bạn vui lòng tiếp tục tại mục này: [Vô hiệu hóa CFG Lock](#vo-hieu-hoa-cfg-lock).

Đối với trường hợp thứ hai, bạn không cần thực hiện bất kỳ bản vá CFG-Lock nào và chỉ cần vô hiệu hóa `Kernel -> Quirks -> AppleCpuPmCfgLock` và `Kernel -> Quirks -> AppleXcpmCfgLock` là xong.

## Vô hiệu hoá CFG Lock

Vậy là bạn đã tạo thư mục EFI nhưng vẫn không thể khởi động macOS nếu chưa mở khóa CFG Lock. Để vô hiệu hoá cái khoá chết tiệt này, bạn cần những thứ sau:

Bên trong thư mục `EFI/OC/Tools` và `config.plist`, hãy thêm công cụ sau (bạn có thể thao tác nhanh bước này bằng tính năng snapshot của ProperTree (VD: Cmd+R)):

* [Phiên bản GRUB Shell đã được mod](https://github.com/datasone/grub-mod-setup_var/releases)

Và một số ứng dụng hỗ trợ:

* [UEFITool](https://github.com/LongSoft/UEFITool/releases) (Bảo đảm rằng tải đúng UEFITool chứ không phải UEFIExtract)
* [Universal-IFR-Extractor](https://github.com/LongSoft/Universal-IFR-Extractor/releases)

Và phần cuối cùng, tải BIOS từ trang web của nhà sản xuất.

Giờ thì đến phần thú vị!

## Cách mở khóa CFG Lock thủ công

**Xin lưu ý rằng chỉ có firmware của ASUS, MSI và ASRock mới có thể được mở trực tiếp bằng UEFITool. Mấy cái firmware khác cần một quy trình đặc biệt mà chúng ta sẽ không đề cập trực tiếp trong hướng dẫn này. Đối với firmware của Dell, vui lòng tham khảo [hướng dẫn của dreamwhite](https://github.com/dreamwhite/bios-extraction-guide/tree/master/Dell)**

1. Xài UEFITool mở file BIOS lên, nhấn Ctrl+F tìm chữ `CFG Lock` (nhớ chọn kiểu Unicode string). Nếu không có gì hiện lên thì firmware của bạn không hỗ trợ `CFG Lock`, nếu không thì hãy tiếp tục.

![](../images/extras/msr-lock-md/uefi-tool.png)

1. Bạn sẽ thấy chuỗi này nằm trong thư mục Setup, nhấp chuột phải và xuất dưới dạng `Setup.bin` (hoặc thậm chí `Setup.sct`)
2. Mở tệp cài đặt của bạn bằng `ifrextract` và xuất dưới dạng tệp .txt bằng terminal:

   ```
   đường/dẫn/tới/ifrextract đường/dẫn/tới/Setup.bin đường/dẫn/tới/Setup.txt
   ```

3. Mở tệp văn bản và tìm kiếm `CFG Lock, VarStoreInfo (VarOffset/VarName):` và ghi lại offset ngay sau đó (ví dụ: `0x43`) và ID VarStore ngay sau offset (ví dụ: `0x3`).
![](../images/extras/msr-lock-md/MSR-Find.png)

4. Tìm kiếm `VarStoreId: 0x3`, trong đó `0x3` thay thế bằng giá trị của VarStoreId bạn tìm thấy và ghi lại `Name` sau đó (ví dụ: `CpuSetup`).

![](../images/extras/msr-lock-md/VarStoreID-Find.png)

1. Chạy GRUB Shell đã được mod lại và nhập lệnh sau, trong đó `CpuSetup` được thay thế bằng tên VarStore mà bạn đã trích xuất trước đó và `0x43` được thay thế bằng offset mà bạn đã trích xuất trước đó:

   ```
   setup_var_cv CpuSetup 0x43 0x01 0x00
   ```

Tại bước này, hãy chạy lệnh `reboot` trong shell hoặc đơn giản là khởi động lại máy. Và như vậy, bạn sẽ mở khóa được `CFG Lock`! Để xác minh, bạn có thể chạy các phương pháp được liệt kê tại [Kiểm tra xem firmware của máy bạn có cho phép mở khoá CFG Lock không](#kiem-tra-xem-firmware-cua-may-ban-co-cho-phep-mo-khoa-cfg-lock-khong) để xác minh xem biến đã được thiết lập chính xác hay chưa, sau đó cuối cùng hãy vô hiệu hóa `Kernel -> Quirks -> AppleCpuPmCfgLock` và `Kernel -> Quirks -> AppleXcpmCfgLock`.

* Xin lưu ý rằng các giá trị offset là duy nhất, không chỉ đối với mỗi bo mạch chủ mà còn đối với mỗi phiên bản firmware của nó. **Tuyệt đối không được sử dụng offset mà không kiểm tra kỹ.**

Và thế là xong! Giờ đây bạn đã có chế độ điều phối nguồn điện CPU chính xác.

* **Lưu ý**: Mỗi lần bạn reset BIOS, bạn sẽ cần phải đảo ngược bit này một lần nữa, hãy nhớ ghi lại bit này cùng với phiên bản BIOS để bạn biết phiên bản nào.

* **Lưu ý 2**: Một số nhà sản xuất OEM như Lenovo có thể đã thiết lập biến này nhưng không thể mở khóa mà không cần chỉnh sửa BIOS vật lý, trong những trường hợp này, bạn có thể cần sử dụng một công cụ như [RU](http://ruexe.blogspot.com/): [CFG LOCK/Unlocking - Alternative method](https://www.reddit.com/r/hackintosh/comments/hz2rtm/cfg_lockunlocking_alternative_method/) nha.
