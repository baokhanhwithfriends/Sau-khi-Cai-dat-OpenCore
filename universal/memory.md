# Sửa lỗi bộ nhớ khi xài SMBIOS MacPro7,1

Trên macOS Catalina và các bản mới hơn, những ai xài SMBIOS MacPro7,1 sẽ gặp cái lỗi này hiển thị trên màn hình mỗi khi khởi động máy:

| Lỗi hiển thị dưới dạng thông báo | Lỗi hiển thị trong Giới thiệu máy Mac này (About This Mac) |
| :--- | :--- |
| <img width="1362" src=../images/post-install/memory-md/memory-error-notification.png>  | ![](../images/post-install/memory-md/memory-error-aboutthismac.png) |

Nguyên nhân chính xác của cái lỗi này thì hơi mơ hồ, nhưng cách trị nó thì đã có rồi. Cách phổ biến nhất (và khỏe nhất) để dẹp cái lỗi này là xài [RestrictEvents](https://github.com/acidanthera/RestrictEvents/releases) và tụi mình cực kỳ khuyến khích tất cả anh em nên dùng kext này thay vì sửa thủ công.

Còn với mấy bác thích "khổ dâm" muốn thử cách map thủ công kiểu cũ, thì coi hướng dẫn bên dưới. Lưu ý là bạn sẽ phải map (ánh xạ) từng thanh RAM một bằng tay nên vụ này tốn thời gian lắm đó nha.

## Ánh xạ bộ nhớ

Để bắt đầu, tải mấy file này về:

* [CustomMemory.plist](https://github.com/dortania/OpenCore-Post-Install/blob/master/extra-files/CustomMemory.plist.zip)
  * Ví dụ mẫu để sử dụng CustomMemory trong OpenCore.
* [dmidecode](https://github.com/acidanthera/dmidecode/releases)
  * Công cụ dùng để trích xuất thông tin SMBIOS trong macOS.

Đây là file làm sẵn đã có các thuộc tính được bày ra cho bạn rồi, mở nó lên bạn sẽ thấy như sau:

![](../images/post-install/memory-md/CustomMemory-open.png)

Ở đây chúng ta thấy quá trời thuộc tính, hãy cùng mổ xẻ nó ra:

* [DataWidth (Độ rộng dữ liệu)](#datawidth-đo-rong-du-lieu)
* [ErrorCorrection (Sửa lỗi)](#errorcorrection-sua-loi)
* [FormFactor (Kiểu dáng bộ nhớ RAM)](#formfactor-kieu-dang-bo-nho-ram)
* [MaxCapacity (Dung lượng tối đa)](l#maxcapacity-dung-luong-toi-đa)
* [TotalWidth (Tổng độ rộng dữ liệu)](#totalwidth-tong-đo-rong-du-lieu)
* [Type (Loại bộ nhớ RAM)](#type-loai-bo-nho-ram)
* [TypeDetail (Chi tiết hơn loại bộ nhớ RAM)](#typedetail-chi-tiet-hon-loai-bo-nho-ram)
* [Devices (Các thiết bị)](#devices-cac-thiet-bi)
  * [AssetTag (Thẻ tài sản)](#assettag-the-tai-san)
  * [BankLocator (Vị trí Bank)](#banklocator-vi-tri-bank)
  * [DeviceLocator (Vị trí thiết bị)](#devicelocator-vi-tri-thiet-bi)
  * [Manufacturer (Hãng sản xuất)](#manufacturer-hang-san-xuat)
  * [PartNumber (Mã số linh kiện)](#partnumber-ma-so-linh-kien)
  * [SerialNumber (Số sê-ri linh kiện)](#serialnumber-so-se-ri-linh-kien)
  * [Size (Kích thước bộ nhớ)](#size-kich-thuoc-bo-nho)
  * [Speed (Tốc độ RAM)](#speed-toc-đo-ram)
* [Cleaning up](#cleaning-up)

### DataWidth (Độ rộng dữ liệu)

Xác định độ rộng dữ liệu, tính bằng bit, của bộ nhớ. DataWidth là 0 và TotalWidth là 8 nghĩa là thiết bị chỉ được dùng để cung cấp 8 bit sửa lỗi (ECC).

Để xác định DataWidth, chạy lệnh sau:

```sh
path/to/dmidecode -t memory | grep "Data Width:"
# Ví dụ Đầu ra
 Data Width: 64 bits
 Data Width: Unknown
 Data Width: 64 bits
 Data Width: Unknown
 Data Width: 64 bits
 Data Width: Unknown
 Data Width: 64 bits
 Data Width: Unknown
# Giá trị Cuối cùng
DataWidth = 64
```

### ErrorCorrection (Sửa lỗi)

Xác định RAM thuộc diện hỗ trợ ECC nào:

```
1 — Other (Khác)
2 — Unknown (Không xác định)
3 — None (Không có ECC)
4 — Parity (Chẵn lẻ)
5 — Single-bit ECC (ECC đơn bit)
6 — Multi-bit ECC (ECC đa bit)
7 — CRC
```

Để xác định ErrorCorrection, chạy lệnh sau:

```sh
path/to/dmidecode -t memory | grep "Error Correction Type:"
# Ví dụ Đầu ra
 Error Correction Type: None
# Giá trị Cuối cùng
ErrorCorrection = 3
```

### FormFactor (Kiểu dáng bộ nhớ RAM)

Xác định kiểu dáng bộ nhớ RAM:

```
1  — Other (Khác)
2  — Unknown (Không xác định)
9  — DIMM
13 — SODIMM
15 — FB-DIMM
```

Để tìm FormFactor, chạy lệnh sau:

```sh
path/to/dmidecode -t memory | grep "Form Factor:"
# Ví dụ Đầu ra
 Form Factor: DIMM
 Form Factor: DIMM
 Form Factor: DIMM
 Form Factor: DIMM
 Form Factor: DIMM
 Form Factor: DIMM
 Form Factor: DIMM
 Form Factor: DIMM
# Giá trị Cuối cùng
FormFactor = 9
```

### MaxCapacity (Dung lượng tối đa)

Xác định dung lượng bộ nhớ tối đa được hỗ trợ trong máy tính của bạn.

Loại: Bytes

```
8GB   - 8589934592
16GB  - 17179869184
32GB  - 34359738368
64GB  - 68719476736
128GB - 137438953472
256GB - 274877906944
```

### TotalWidth (Tổng độ rộng dữ liệu)

Xác định tổng độ rộng, tính bằng bit, của bộ nhớ, bao gồm cả các bit kiểm tra hoặc sửa lỗi. Nếu không có bit sửa lỗi, giá trị này phải bằng DataWidth.

Để xác định TotalWidth, chạy lệnh sau:

```sh
path/to/dmidecode -t memory | grep "Total Width:"
# Ví dụ Đầu ra
 Total Width: 72 bits
 Total Width: Unknown
 Total Width: 72 bits
 Total Width: Unknown
 Total Width: 72 bits
 Total Width: Unknown
 Total Width: 72 bits
 Total Width: Unknown
# Giá trị cuối cùng
TotalWidth = 72
```

### Type (Loại bộ nhớ RAM)

Xác định loại bộ nhớ:

```
1  — Other (Khác)
2  — Unknown (Không xác định)
15 — SDRAM
18 — DDR
19 — DDR2
20 — DDR2 FB-DIMM
24 — DDR3
26 — DDR4
27 — LPDDR
28 — LPDDR2
29 — LPDDR3
30 — LPDDR4
```

Để xác định Type, chạy lệnh sau:

```sh
path/to/dmidecode -t memory | grep "Type:"
# Ví dụ Đầu ra
 Type: DDR4
 Type: Unknown
 Type: DDR4
 Type: Unknown
 Type: DDR4
 Type: Unknown
 Type: DDR4
 Type: Unknown
# Giá trị cuối cùng
Type = 26
```

### TypeDetail (Chi tiết hơn loại bộ nhớ RAM)

Xác định thông tin khác về loại bộ nhớ:

```
Bit 0 — Reserved, set to 0 (Dành riêng, đặt là 0)
Bit 1 — Other (Khác)
Bit 2 — Unknown (Không xác định)
Bit 7 — Synchronous (Đồng bộ)
Bit 13 — Registered (buffered) (Có thanh ghi/bộ đệm)
Bit 14 — Unbuffered (unregistered) (Không bộ đệm)
````

Kết hợp tất cả các cái áp dụng được, ví dụ:

```
Bit 13 — Registered (buffered)
Bit 14 — Unbuffered (unregistered)
-----------------------------------
27 = TypeDetail
```

Để xác định TypeDetail, chạy lệnh sau:

```sh
path/to/dmidecode -t memory | grep "Type Detail:"
# Ví dụ Đầu ra
 Type Detail: Synchronous
 Type Detail: Synchronous
 Type Detail: Synchronous
 Type Detail: Synchronous
 Type Detail: Synchronous
 Type Detail: Synchronous
 Type Detail: Synchronous
 Type Detail: Synchronous
# Giá trị cuối cùng
TypeDetail = 7
```

### Devices (Các thiết bị)

Mảng các thiết bị bộ nhớ (thanh RAM), và đây là chỗ chúng ta làm phép để sửa lỗi. Trong mẫu CustomMemory.plist tui đưa, có 12 khe được liệt kê. Từ đây, bạn mở System Profiler (Thông tin hệ thống) trong macOS lên và nhìn vào tab Memory (Bộ nhớ):

![](../images/post-install/memory-md/system-profiler.png)

Ở đây chúng ta thấy khe nào đang cắm RAM, và khe nào đang trống. Với các khe đã cắm, cứ làm theo hướng dẫn bên dưới để lấy thông tin. Tuy nhiên với các khe trống, bạn sẽ cần thêm thông tin "ảo" vào để đánh lừa macOS nghĩ rằng nó có thiết bị. Đảm bảo là đến cuối cùng, bạn có tổng cộng 12 khe được lấp đầy bởi các thiết bị.

Ví dụ về khe đã điền (filled) vs khe ảo (fake):

![](../images/post-install/memory-md/memory-example.png)

Tụi tui khuyên bạn nên đặt Size (Kích thước) và Speed (Tốc độ) đều là 1 cho các khe ảo, để đảm bảo các ứng dụng cần lấy dữ liệu từ bộ nhớ không bị nhầm lẫn là bạn có nhiều RAM hơn thực tế.

Tiếp theo hãy mổ xẻ các thuộc tính:

* [AssetTag (Thẻ tài sản)](#assettag-the-tai-san)
* [BankLocator (Vị trí Bank)](#banklocator-vi-tri-bank)
* [DeviceLocator (Vị trí thiết bị)](#devicelocator-vi-tri-thiet-bi)
* [Manufacturer (Hãng sản xuất)](#manufacturer-hang-san-xuat)
* [PartNumber (Mã số linh kiện)](#partnumber-ma-so-linh-kien)
* [SerialNumber (Số sê-ri linh kiện)](#serialnumber-so-se-ri-linh-kien)
* [Size (Kích thước bộ nhớ)](#size-kich-thuoc-bo-nho)
* [Speed (Tốc độ RAM)](#speed-toc-đo-ram)

#### AssetTag (Thẻ tài sản)

Để xác định AssetTag, chạy lệnh sau:

```sh
path/to/dmidecode -t memory | grep "Asset Tag:"
# Ví dụ Đầu ra

# Giá trị cuối cùng
```

* Nếu dmidecode in ra `Not Specified`, bạn cứ để trống mục này.

#### BankLocator (Vị trí Bank)

Để xác định BankLocator, chạy lệnh sau:

```sh
path/to/dmidecode -t memory | grep "Bank Locator:"
# Ví dụ Đầu ra

# Giá trị cuối cùng
```

* Nếu dmidecode in ra `Not Specified`, bạn cứ để trống mục này.

#### DeviceLocator (Vị trí thiết bị)

Để xác định DeviceLocator, chạy lệnh sau:

```sh
path/to/dmidecode -t memory | grep "Locator:"
# Ví dụ Đầu ra
 Locator: DIMM_A1
 Locator: DIMM_A2
 Locator: DIMM_B1
 Locator: DIMM_B2
 Locator: DIMM_C1
 Locator: DIMM_C2
 Locator: DIMM_D1
 Locator: DIMM_D2
# Giá trị cuối cùng
Entry 1:  DIMM_A1
Entry 2:  DIMM_A2
Entry 3:  DIMM_B1
Entry 4:  DIMM_B2
Entry 5:  DIMM_C1
Entry 6:  DIMM_C2
Entry 7:  DIMM_D1
Entry 8:  DIMM_D2
Entry 9:  DIMM_EMPTY
Entry 10: DIMM_EMPTY
Entry 11: DIMM_EMPTY
Entry 12: DIMM_EMPTY
```

#### Manufacturer (Hãng sản xuất)

Để xác định Manufacturer, chạy lệnh sau:

```sh
path/to/dmidecode -t memory | grep "Manufacturer:"
# Ví dụ Đầu ra

# Giá trị cuối cùng
```

#### PartNumber (Mã số linh kiện)

Để xác định PartNumber, chạy lệnh sau:

```sh
path/to/dmidecode -t memory | grep "Part Number:"
# Ví dụ Đầu ra
 Part Number: KHX2666C16/8G
 Part Number: NO DIMM
 Part Number: KHX2666C16/8G
 Part Number: NO DIMM
 Part Number: KHX2666C16/8G
 Part Number: NO DIMM
 Part Number: KHX2666C15D4/8G
 Part Number: NO DIMM
# Giá trị cuối cùng
Entry 1:  KHX2666C16/8G
Entry 2:  EmptyDIMM
Entry 3:  KHX2666C16/8G
Entry 4:  EmptyDIMM
Entry 5:  KHX2666C16/8G
Entry 6:  EmptyDIMM
Entry 7:  KHX2666C15D4/8G
Entry 8:  EmptyDIMM
Entry 9:  EmptyDIMM
Entry 10: EmptyDIMM
Entry 11: EmptyDIMM
Entry 12: EmptyDIMM
```

#### SerialNumber (Số sê-ri linh kiện)

Để xác định SerialNumber, chạy lệnh sau:

```sh
path/to/dmidecode -t memory | grep "Serial Number:"
# Ví dụ Đầu ra
 Serial Number: 0F095257
 Serial Number: NO DIMM
 Serial Number: 0C099A57
 Serial Number: NO DIMM
 Serial Number: 752EDED8
 Serial Number: NO DIMM
 Serial Number: A2032E84
 Serial Number: NO DIMM
# Giá trị cuối cùng
Entry 1:  0F095257
Entry 2:  EmptyDIMM
Entry 3:  0C099A57
Entry 4:  EmptyDIMM
Entry 5:  752EDED8
Entry 6:  EmptyDIMM
Entry 7:  A2032E84
Entry 8:  EmptyDIMM
Entry 9:  EmptyDIMM
Entry 10: EmptyDIMM
Entry 11: EmptyDIMM
Entry 12: EmptyDIMM
```

#### Size (Kích thước bộ nhớ)

Kích thước của một thanh RAM tính bằng MB.

```
1GB  - 1024
2GB  - 2048
4GB  - 4096
8GB  - 8192
16GB - 16384
32GB - 32768
64GB - 65536
12GB - 131072
```

Để xác định Size, chạy lệnh sau:

```sh
path/to/dmidecode -t memory | grep "Size:"
# Ví dụ đầu ra
 Size: 8 GB
 Size: No Module Installed
 Size: 8 GB
 Size: No Module Installed
 Size: 8 GB
 Size: No Module Installed
 Size: 8 GB
 Size: No Module Installed
# Giá trị cuối cùng
Entry 1:  8192
Entry 2:  1
Entry 3:  8192
Entry 4:  1
Entry 5:  8192
Entry 6:  1
Entry 7:  8192
Entry 8:  1
Entry 9:  1
Entry 10: 1
Entry 11: 1
Entry 12: 1
```

#### Speed (Tốc độ RAM)

Tốc độ của bộ nhớ RAM tính bằng Mhz.

VD: `3000Mhz`

Để xác định Speed, chạy lệnh sau:

```sh
path/to/dmidecode -t memory | grep "Speed:"
# Ví dụ đầu ra
 Speed: 2666 MT/s
 Speed: Unknown
 Speed: 2666 MT/s
 Speed: Unknown
 Speed: 2666 MT/s
 Speed: Unknown
 Speed: 2666 MT/s
 Speed: Unknown
# Giá trị cuối cùng
Entry 1:  2666
Entry 2:  1
Entry 3:  2666
Entry 4:  1
Entry 5:  2666
Entry 6:  1
Entry 7:  2666
Entry 8:  1
Entry 9:  1
Entry 10: 1
Entry 11: 1
Entry 12: 1
```

## Tổng kết 

Giờ bạn đã làm xong cái bảng, chúng ta có thể gộp nó vào file config.plist.

Chỉ cần copy công sức của bạn từ file CustomMemory.plist và paste nó vào PlatformInfo:

![](../images/post-install/memory-md/memory-example-done.png)

Khi đã copy xong xuôi, mở chức năng `PlatformInfo -> CustomMemory` lên và khởi động lại. Cái lỗi kia sẽ biến mất không dấu vết!

Nhắc lại lần nữa là bạn phải **điền đủ** tất cả 12 khe bộ nhớ (kể cả khe ảo), nếu không thì lỗi nó vẫn trơ trơ ra đấy:

| Ứng dụng Thông tin hệ thống (đã sửa) | Ứng dụng Giới thiệu về máy Mac này (đã sửa) |
| :--- | :--- |
| ![](../images/post-install/memory-md/memory-fixed-system-profiler.png) | ![](../images/post-install/memory-md/memory-fixed-aboutthismac.png) |
