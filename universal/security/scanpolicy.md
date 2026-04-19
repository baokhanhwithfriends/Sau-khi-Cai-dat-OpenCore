# ScanPolicy (Chính sách quét ổ đĩa)

Cái "cài đặt nâng cao" (quirk) này giúp bạn chặn máy tính quét và khởi động từ những nguồn không đáng tin cậy. Nếu đặt bằng `0` nó sẽ cho phép khởi động từ tất cả mọi nguồn khởi động có mặt trên máy. Nhưng nếu bạn biết cách tính một giá trị ScanPolicy (chính sách quét) cụ thể, bạn sẽ kiểm soát máy mình cực kỳ linh hoạt và an toàn.

Để tính giá trị ScanPolicy, bạn chỉ cần cộng dồn các giá trị hexadecimal (thập lục phân) lại (dùng máy tính trên macOS, bấm `⌘+3` để chuyển sang chế độ Programmer - lập trình viên). Sau khi cộng hết lại, bạn lấy giá trị hex đó đổi sang số decimal (thập phân) rồi điền vào mục ScanPolicy (Xcode sẽ tự đổi giúp bạn khi bạn dán vào).

`0x00000001 (bit 0)` — OC\_SCAN\_FILE\_SYSTEM\_LOCK

* Chỉ cho phép quét các hệ thống file (file system) đã được xác định trong chính sách này. Các trình điều khiển hệ thống tệp có thể không nhận biết được chính sách này và để tránh việc gắn kết các hệ thống tệp không mong muốn, tốt nhất là không nên tải trình điều khiển của nó. Điều này không ảnh hưởng đến việc gắn kết tệp dmg, vốn có thể chứa bất kỳ hệ thống tệp nào. Các hệ thống tệp đã biết được đặt tiền tố bằng OC_SCAN\_ALLOW\_FS_.

`0x00000002 (bit 1)` — OC\_SCAN\_DEVICE\_LOCK

* Chỉ cho phép quét các loại thiết bị (device types) đã xác định. Đôi khi hệ thống nhận diện nhầm (ví dụ USB HDD nhận thành SATA), nên có gì lạ là phải báo cáo ngay nha.
Các loại thiết bị đã biết được đặt tiền tố bằng OC_SCAN\_ALLOW\_DEVICE_.

`0x00000100 (bit 8)` — OC\_SCAN\_ALLOW\_FS\_APFS

* Cho phép quét hệ thống file APFS (của Mac đời mới).

`0x00000200 (bit 9)` — OC\_SCAN\_ALLOW\_FS\_HFS

* Cho phép quét hệ thống file HFS (của Mac đời cũ).

`0x00000400 (bit 10)` — OC\_SCAN\_ALLOW\_FS\_ESP

* Cho phép quét phân vùng EFI (EFI System Partition).

`0x00010000 (bit 16)` — OC\_SCAN\_ALLOW\_DEVICE\_SATA

* Cho phép quét các thiết bị cổng SATA.

`0x00020000 (bit 17)` — OC\_SCAN\_ALLOW\_DEVICE\_SASEX

* Cho phép quét các thiết bị SAS và Mac NVMe.

`0x00040000 (bit 18)` — OC\_SCAN\_ALLOW\_DEVICE\_SCSI

* Cho phép quét các thiết bị cổng SCSI.

`0x00080000 (bit 19)` — OC\_SCAN\_ALLOW\_DEVICE\_NVME

* Cho phép quét các thiết bị ổ cứng NVMe.

`0x00100000 (bit 20)` — OC\_SCAN\_ALLOW\_DEVICE\_ATAPI

* Cho phép quét ổ đĩa CD/DVD.

`0x00200000 (bit 21)` — OC\_SCAN\_ALLOW\_DEVICE\_USB

* Cho phép quét các thiết bị cắm qua cổng USB.

`0x00400000 (bit 22)` - OC\_SCAN\_ALLOW\_DEVICE\_FIREWIRE

* Cho phép quét các thiết bị cổng FireWire.

`0x00800000 (bit 23)` — OC\_SCAN\_ALLOW\_DEVICE\_SDCARD

* Cho phép quét các loại thẻ nhớ.

`0x01000000 (bit 24)` — OC\_SCAN\_ALLOW\_DEVICE\_PCI

* Cho phép quét các thiết bị cắm trực tiếp vào khe PCI (ví dụ: VIRTIO).

Mặc định, ScanPolicy thường có giá trị là `0x10F0103`(17,760,515) – đây là "nồi lẩu thập cẩm" của các mục sau:

* OC\_SCAN\_FILE\_SYSTEM\_LOCK
* OC\_SCAN\_DEVICE\_LOCK
* OC\_SCAN\_ALLOW\_FS\_APFS
* OC\_SCAN\_ALLOW\_DEVICE\_SATA
* OC\_SCAN\_ALLOW\_DEVICE\_SASEX
* OC\_SCAN\_ALLOW\_DEVICE\_SCSI
* OC\_SCAN\_ALLOW\_DEVICE\_NVME
* OC\_SCAN\_ALLOW\_DEVICE\_PCI

Ví dụ, nếu bạn muốn cho phép máy quét thêm các thiết bị USB OC\_SCAN\_ALLOW\_DEVICE\_USB:

`0x00200000` + `0x10F0103` = `0x12F0103`

Đổi con số này sang hệ thập phân (decimal), chúng ta được: `19,857,667`. Bạn điền số này vô config là chuẩn bài!
