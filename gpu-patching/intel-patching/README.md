# Sửa lỗi iGPU Intel nâng cao

Hướng dẫn này sẽ đi sâu vào việc vá lỗi macOS để nó chạy được với nhiều biến thể phần cứng iGPU của Intel hơn, bao gồm việc xuất hình chuẩn, sửa lỗi sai màu, lỗi HiDPI và ti tỉ thứ khác. Lưu ý là cái này **không phải** hướng dẫn cho người mới bắt đầu (beginners tutorial), tụi mình khuyên bạn nên cài đặt thuộc tính iGPU được đề xuất trong phần config.plist của hướng dẫn cài đặt để bắt đầu đã. Nếu đã thử mà không lên (thường gặp với máy bàn) thì bạn quay lại đây nhé.

Hướng dẫn này dành cho:

* iGPU từ đời Sandy Bridge đến tận Ice Lake.

## Thuật ngữ

| Thuật ngữ | Mô tả |
| :--- | :--- |
| Framebuffer | Ám chỉ cái kext được chọn trong macOS để điều khiển con card màn hình. |
| Framebuffer Profile | Hồ sơ trong một framebuffer quyết định cách iGPU sẽ hoạt động. |
| WhateverGreen | Kext này sử dụng để vá driver GPU mặc định của macOS giúp hỗ trợ phần cứng PC tốt hơn (tức là làm cho nó chạy được trên phần cứng PC). |
| Stolen Memory (viết tắt là STOLENMEM) | Còn gọi là bộ nhớ bị chiếm dụng, đây là phần RAM bị BIOS "cố định" ngay từ lúc khởi động máy chỉ để phục vụ cho iGPU. Hệ điều hành macOS cực kỳ khắt khe với phần này. Sẽ nói rõ hơn ở phần vá bộ nhớ VRAM. |
| Framebuffer Memory (viết tắt là FBMEM) | Còn gọi là bộ nhớ khung hình, đây là phần RAM để chứa dữ liệu hình ảnh đang hiển thị trên màn hình của bạn. Độ phân giải càng cao (4K, 5K) thì phần này tốn càng nhiều. |
| Cursor Memory (viết tắt là CURSORMEM) | Còn gọi là bộ nhớ con trỏ chuột. Với những đời máy Mac cũ còn cơ chế quản lý RAM cứng nhắc chưa được thông minh, Apple quy định thêm đây là phần RAM để chứa dữ liệu con trỏ chuột giúp di chuyển mượt mà không làm lag cái màn hình. Thay vì phải vẽ lại toàn bộ khung hình mỗi khi bạn di chuột, nó chỉ cần cập nhật tọa độ trên lớp (layer) của con trỏ thôi. Với các đời máy mới hơn |
| Dynamic Memory | Đây là phần RAM tối đa sẽ được macOS linh động "mượn thêm" từ RAM khi bạn sử dụng các tác vụ cần nhiều bộ nhớ VRAM như chơi game hoặc render video. Con số 1536MB bạn thấy trong About This Mac chính là cái Dynamic Memory. Đây cũng có nghĩa là tổng dung lượng bộ nhớ VRAM. |
| AAPL,ig-platform-id | Thuộc tính macOS xài để xác định hồ sơ framebuffer được chọn với thế hệ Ivy Bridge và mới hơn. |
| AAPL,snb-platform-id | Thuộc tính macOS xài để xác định hồ sơ framebuffer được chọn với thế hệ Sandy Bridge. |
| device-id | Được IOKit sử dụng để khớp phần cứng với các kext. |


## Bắt đầu thôi

Trước khi chúng ta nhảy quá sâu vào cái hố thỏ này, chúng ta nên giải thích xem mình đang làm cái gì và tại sao phải làm thế đã.

**Các chủ đề cơ bản**:

* [Giải thích AAPL,ig-platform-id là gì](#aapl-ig-platform-id-explainer)
* [Giải thích device-id là gì](#device-id-explainer)

### Giải thích AAPL,ig-platform-id là gì

Mặc định trên mấy cái máy Mac chỉ có iGPU, có một vài cấu hình như sau:

* iGPU là đầu ra hiển thị duy nhất.
  * Thường thấy trên Mac Mini, MacBook Air, MacBook Pro 13" và iMac không có dGPU (Card rời).
* iGPU chỉ dùng cho màn hình tích hợp (màn hình laptop) và dGPU xử lý các màn hình ngoài.
  * Thường thấy trên MacBook Pro 15".
* iGPU chỉ dùng để tính toán nội bộ (internal compute) và dGPU xử lý tất cả đầu ra hiển thị.
  * Thường thấy trên các dòng iMac có kèm dGPU.

Lý do điều này quan trọng là vì số lượng cấu hình iGPU mà Apple hỗ trợ trong các kext iGPU, cụ thể được gọi là "framebuffer personalities" (nhân cách framebuffer). Các nhân cách này quyết định nhiều thứ bao gồm số lượng màn hình, quy định loại màn hình được phép sử dụng, vị trí các cổng kết nối, VRAM tối thiểu yêu cầu, v.v., và vì thế chúng ta hoặc là hy vọng một trong các hồ sơ (profile) này khớp với phần cứng của mình, hoặc là phải cố mà vá nó cho phù hợp với máy của mình.

Để chỉ định một nhân cách framebuffer trong macOS, chúng ta dùng phần DeviceProperties trong OpenCore để thêm một mục gọi là `AAPL,ig-platform-id`

* Lưu ý: trên Sandy Bridge, chúng ta xài `AAPL,snb-platform-id` thay thế

Định dạng của mục này là hệ thập lục phân (hexadecimal) và các byte bị đảo ngược (byte swapped) so với giá trị thực tế. Danh sách đầy đủ các giá trị này có thể tìm thấy trong hướng dẫn sử dụng của WhateverGreen: [FAQ.IntelHD.en.md](https://github.com/acidanthera/WhateverGreen/blob/master/Manual/FAQ.IntelHD.en.md)

Ví dụ, hãy thử tìm một framebuffer tương thích cho con iGPU HD 4600 trên máy bàn (desktop). Đầu tiên chúng ta cuộn xuống trong hướng dẫn sử dụng cho đến khi gặp mục [Intel HD Graphics 4200-5200 (vi xử lý Haswell)](https://github.com/acidanthera/WhateverGreen/blob/master/Manual/FAQ.IntelHD.en.md#Intel-hd-graphics-4200-5200-haswell-processors). Ở đây chúng ta có danh sách tất cả các framebuffer được hỗ trợ trong macOS, bao gồm loại phần cứng (Laptop hay Desktop), yêu cầu VRAM, v.v. Nếu cuộn xuống cuối danh sách này, bạn cũng sẽ thấy một số tùy chọn được đề xuất:

```
Máy tính bàn :
 0x0D220003 (mặc định)
Laptop :
 0x0A160000 (mặc định)
 0x0A260005 (khuyến khích sử dụng)
 0x0A260006 (khuyến khích sử dụng)
Framebuffer trống :
 0x04120004 (mặc định)
```

Hai mục đầu tiên khá dễ hiểu, tuy nhiên cái cuối cùng (Empty Framebuffer - Framebuffer trống) ám chỉ mấy cái máy đã có dGPU (Card rời) cài đặt sẵn nhưng vẫn để mở iGPU chạy ngầm để xử lý các tác vụ như giải mã tăng tốc phần cứng, việc mà nó rất giỏi.

Vì chúng ta đang dùng HD 4600 máy bàn, chúng ta sẽ lấy cái hồ sơ framebuffer tương ứng: `0x0D220003`

Nhưng khoan, chúng ta chưa thể sử dụng ngay cái này trong config.plist được. Lý do là nó đang ở dạng Big Endian trong khi cây IOService của macOS lại mong đợi nó ở dạng Little Endian. Chuyển đổi cái này cũng đơn giản thôi:

```md
# Để bắt đầu, bỏ 0x đi và tách tụi nó thành từng cặp
0x0D220003 -> 0D 22 00 03

# Tiếp theo, đảo ngược thứ tự nhưng giữ nguyên vị trí các cặp số
0D 22 00 03 -> 03 00 22 0D

# Và giờ bạn có hồ sơ framebuffer cuối cùng
0300220D = AAPL,ig-platform-id
```

Từ đây, mở config.plist của bạn lên và vào mục DeviceProperties -> Add. Giờ chúng ta sẽ thêm một mục mới gọi là `PciRoot(0x0)/Pci(0x2,0x0)`. Đây là vị trí của iGPU Intel so với đường dẫn IOService và nó nhất quán từ thời CPU dòng Yonah (2007+) tới giờ:

| Key | Type | Value |
| :--- | :--- | :--- |
| AAPL,ig-platform-id | Data | 0300220D |

![](../../images/gpu-patching/ig-platform.png)

### device-id explainer

`device-id` là thứ mà macOS, hay cụ thể hơn là IOKit, sử dụng để xác định thiết bị nào được phép kết nối với driver nào. Cái này quan trọng với chúng ta vì driver iGPU của Apple có số lượng ID giới hạn mặc dù bản thân kext có thể hỗ trợ nhiều hơn thế do sự tương đồng về kiến trúc giữa iGPU của máy Mac và PC thông thường.

Để xác định xem bạn có cần nạp (inject) một `device-id` mới hay không, bạn cần so sánh [Danh sách ID được hỗ trợ của WhateverGreen](https://github.com/acidanthera/WhateverGreen/blob/master/Manual/FAQ.IntelHD.en.md) với cái bạn đang có.

Ví dụ, hãy xem con i3-4150 đi kèm với iGPU HD 4400. Vô [trang ARK của Intel](https://ark.Intel.com/content/www/us/en/ark/products/77486/Intel-core-i3-4150-processor-3m-cache-3-50-ghz.html), chúng ta thấy thông tin sau:

```
Device ID = 0x41E
```

Giờ có Device ID thực tế rồi, so sánh nó với [danh sách hỗ trợ của WhateverGreen](https://github.com/acidanthera/WhateverGreen/blob/master/Manual/FAQ.IntelHD.en.md):

```
Danh sách DevIDs được hỗ trợ nguyên bản:

 0x0d26
 0x0a26
 0x0a2e
 0x0d22
 0x0412
```

Đen đủi thay cái ID này không có trong driver của macOS, nên chúng ta cần tìm một iGPU tương tự với cái của mình và sử dụng Device ID của nó thay thế (thủ thuật này còn kêu là Fake ID). Con HD 4600 trên [i3-4330](https://ark.Intel.com/content/www/us/en/ark/products/77769/Intel-core-i3-4330-processor-4m-cache-3-50-ghz.html) là một ứng cử viên rất gần, nên chúng ta sẽ dùng Device ID của nó:

```
Device ID = 0x412
```

Tuy nhiên, mặc định không thể nạp cái này ngay được. Chúng ta cần đệm (pad) nó đủ 8 bit và đảo ngược hex (hex swap):

```md
# Để bắt đầu, bỏ 0x và đệm nó đủ 8 bit bằng cách thêm số 0 vào trước
0x412 -> 00 00 04 12

# Tiếp theo, đảo ngược thứ tự nhưng giữ nguyên vị trí các cặp số
00 00 04 12 -> 12 04 00 00

# Và voila, bạn đã có device-id mình cần
12040000 = device-id
```

Giờ có device-id rồi, làm tương tự như với ig-platform-id lúc nãy. Mở config.plist và thêm mục mới này dưới `PciRoot(0x0)/Pci(0x2,0x0)`:

| Key | Type | Value |
| :--- | :--- | :--- |
| device-id | Data | 12040000 |

![](../../images/gpu-patching/device-id.png)

## Học cách vá lỗi driver với WhateverGreen

Giờ đã xong phần cơ bản thiết lập iGPU, hãy đi vào mấy chủ đề sâu xa hơn. Cần chuẩn bị vài thứ trước đã:

* Lilu và WhateverGreen phải có mặt trong EFI/OC/Kexts và trong config.plist của bạn.
  * Để kiểm tra xem tụi nó đã được nạp đúng trong macOS chưa, chạy lệnh bên dưới (nếu không ra gì nghĩa là kext chưa nạp).
  * `kextstat | grep -E "Lilu|WhateverGreen"`
* `DeviceProperties -> Add -> PciRoot(0x0)/Pci(0x2,0x0)` đã được thiết lập chính xác.
  * Tham khảo thế hệ CPU cụ thể của bạn trong [phần config.plist](https://baokhanhwithfriends.github.io/Huong-dan-cai-dat-OpenCore/)

Giờ hãy dấn thân vào hành trình vá lỗi framebuffer nào!:

* [Vá bộ nhớ VRAM được yêu cầu](./vram.md)
  * Cần thiết cho mấy cái máy tính bị khóa BIOS và không thể tăng VRAM
* [Vá chuẩn kết nối màn hình](./connector.md)
  * Cần thiết cho mấy cái máy tính bị lỗi sai màu trên một số màn hình nhất định
* [Vá lỗi không xuất được hình nâng cao](./busid.md)
  * Cần thiết cho mấy cái máy tính mà một số cổng xuất hình không hoạt động
