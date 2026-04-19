# Sửa lỗi ghi dữ liệu RTC/CMOS

Phần này sẽ chỉ bạn cách trị dứt điểm cái bệnh "hay quên" của máy tính (lỗi CMOS/Safe Mode mỗi khi reboot hoặc wake máy). Thường thì máy sẽ hiện cái bảng thông báo lỗi như hình dưới:

![credit to u/iDrakus for the image](../images/post-install/rtc-md/cmos-error.png)

Lý do là vì AppleRTC cố tình ghi dữ liệu vào một vài vùng nhớ mà phần cứng của bạn hổng hỗ trợ, dẫn đến việc máy bị hoảng loạn (panic) và báo lỗi hoặc tự động vào chế độ safe mode.

Để né cái này, dân tình hay xài [mấy bản vá](https://github.com/RehabMan/HP-ProBook-4x30s-DSDT-Patch/blob/master/config_parts/config_master.plist#L291L296)  chặn sạch sành sanh mọi thao tác ghi vào RTC. Nhưng cách này hổng ngon vì nó làm hư luôn cả Windows lẫn Linux, lại còn tắt luôn mấy tính năng điều phối điện năng quan trọng.

Với OpenCore, mình có 2 "chiêu" chính để trị:

* Vá AppleRTC để nó né vài vùng nhớ cụ thể mà ta chỉ định
  * Có thể không xài được trong các bản cập nhật hệ điều hành tương lai
  * Với bạn đọc mới thì cách này khó sửa lỗi hơn nhiều
  * Không hỗ trợ ghi dữ liệu vào RTC thông qua EfiBoot
* Đánh dấu mấy vùng nhớ "độc hại" đó là vùng cấm đụng: Cách này bền bỉ hơn, dễ làm hơn và bảo vệ máy tốt hơn.
  * Có thể không xài được trong các bản cập nhật vi chương trình firmware tương lai
  * Với bạn đọc mới thì cách này dễ sửa lỗi hơn nhiều
  * Cũng ngăn chặn EfiBoot làm hư hệ thống của bạn

Chiêu số 1 đã được tích hợp sẵn trong OpenCore qua mục cài đặt nâng cao `DisableRtcChecksum` nhưng nó chỉ chặn được một vùng nhớ nhỏ (0x58-0x59) và chỉ hoạt động trong cấp độ hệ điều hnafh . Bạn cứ bật lên thử xem, nếu hết lỗi thì tốt, hổng hết thì tắt đi cho đỡ nặng máy.

Với phương pháp thứ hai, chúng ta có thể chặn các vùng nhớ cụ thể mà mình lựa chọn, phù hợp với model máy của mình. Ta có thể áp dụng bản vá này ở cả cấp độ nhân hệ điều hành và vi chương trình firmware hỗ trợ chế độ ngủ đông. Tuy nhiên, cách làm này sẽ đòi hỏi nhiều thời gian công sức hơn và cần có kext [RTCMemoryFixup](https://github.com/acidanthera/RTCMemoryFixup/releases) bổ trợ.

## Tìm vùng nhớ RTC gây lỗi

Trong phần còn lại của hướng dẫn này, chúng ta sẽ giả định rằng bạn đã thử tùy chọn 1 (mở `DisableRtcChecksum`) và nó không có tác dụng hoặc bạn đang gặp sự cố với EfiBoot khi ghi dữ liệu vào RTC. Để bắt đầu, trước tiên chúng ta nên giới thiệu một vài ý tưởng:

* RTC có các vùng nhớ đánh số từ 0 đến 255.
* Trong giới kỹ thuật, người ta đếm theo hệ thập lục phân (hexadecimal) nên nó sẽ là từ 0x00 đến 0xFF.
* Để cấm vùng nhớ đó, mình xài lệnh boot-arg (tham số khởi động): `rtcfx_exclude=00-FF`
  * Thay `00-FF` bằng vùng nhớ gây lỗi (hoặc nhiều vùng nhớ khác nhau gây lỗi)
  * Lưu ý rằng `boot-args` nằm ở mục `NVRAM -> Add -> 7C436110-AB2A-4BBB-A880-FE41995C9F82` bên trong config.plist của bạn
  * Để việc cấm vùng nhớ có tác dụng thì bạn cũng cần phải có kext [RTCMemoryFixup](https://github.com/acidanthera/RTCMemoryFixup/releases) đã được khai báo trong config.plist và cài đặt vô trong thư mục EFI/OC/Kexts.
* Tuỳ theo máy, có máy sẽ có nhiều vùng nhớ gây lỗi thay vì 1 vùng nhớ cố định
* Để tìm ra vùng nhớ bị lỗi, chúng ta cần chia nhỏ quá trình tìm kiếm thành nhiều phần.

Về việc chia nhỏ các phần, chúng ta sẽ loại bỏ các phần của vùng RTC cho đến khi thu hẹp đủ phạm vi để tìm ra chính xác vị trí bị lỗi (chiến thuật "chia để trị"). Bạn có thể xem hướng dẫn bên dưới để bắt đầu:

#### 1. Thử nghiệm với RtcMemoryFixup

* Để bắt đầu, bạn thêm `rtcfx_exclude=00-FF` vào trong boot-args. Nếu sau khi khởi động lại mà hổng còn lỗi CMOS nữa, chúc mừng bạn, lỗi đúng là nằm ở RTC rồi đó.

#### 2. Chia đôi thiên hạ (0x00-0xFF chia làm 2)

* Thử cấm vùng nhớ 0x00-0x7F hoặc 0x80-0xFF
  * Nhớ ghi lại phạm vi vùng nhớ bị loại trừ giúp khắc phục lỗi RTC và tiếp tục bằng cách chia nhỏ hơn nữa thành các phần
  * Ví dụ: `rtcfx_exclude=00-7F` khắc phục được lỗi RTC (máy chạy ngon) nên bạn sẽ tiếp tục chia đôi phạm vi và bỏ qua luôn `rtcfx_exclude=80-FF` để tìm tiếp.
  * Kiểm tra `rtcfx_exclude=00-7F` và `rtcfx_exclude=80-FF`
  * Lưu ý rằng bạn cũng có thể gặp lỗi ở phạm vi 7F-80, hoặc thậm chí các vùng bị lỗi được chia thành nhiều phần (ví dụ: 0x00-0x01 **và** 0x80-0x81)
  * Bạn có thể sử dụng `rtcfx_exclude=00-01,7F-80` để giải quyết lỗi này

#### 3. Sau khi kiểm tra xem vùng nào bị lỗi, thu hẹp phạm vi hơn nữa

* Giả sử vùng lỗi của chúng ta nằm trong khoảng 0x80-0xFF, tiếp theo bạn sẽ chia vùng đó thành 2 phần:
  * 0x80-0xBF và 0xC0-0xFF
  * nếu bạn có nhiều vùng nhớ bị lỗi

#### 4. Cứ thế chia đôi, chia đôi mãi... cho đến khi bạn tìm được con số chính xác nhất và khoanh vùng được khu vực gây lỗi. Mỗi lần thử là mỗi lần phải reboot để xem máy có còn hiện bảng báo lỗi CMOS/Safe-mode hay hổng nha.

* Cũng cần lưu ý rằng điểm lỗi cuối cùng thường là một phạm vi chứ không phải một điểm lỗi duy nhất.
* Ví dụ: `rtcfx_exclude=85-86` thay vì một giá trị duy nhất

**Mẹo của chuyên gia**: Để tìm con số nằm giữa 2 vùng, bạn đổi tụi nó sang hệ thập phân (decimal) rồi xài công thức:

* `(x + y) / 2`

Bây giờ chúng ta hãy thử sử dụng công thức này với bước 1 từ trước đó:

* 0x00-0xFF -> 0-255 -> `(0 + 255) / 2` = 127.5

Bây giờ với 127.5, bạn sẽ làm tròn lên và xuống để có được giá trị bắt đầu và kết thúc:

* 0-127 -> 0x00-0x7F

* 128-255 -> 0x80-0xFF

Và hy vọng điều này có thể giúp bạn hiểu rõ hơn cách bạn có được các giá trị từ bước 1.

## Lên danh sách cấm vĩnh viễn vùng nhớ bị lỗi

Khi đã tìm được "kẻ thủ ác" rồi, thay vì dùng boot-arg nhìn hơi rườm rà, bạn có thể đưa nó thẳng vào OpenCore để nó chặn ngay từ cấp độ vi chương trình firmware.

Với cái này, mở file config.plist, tìm mục `NVRAM -> Add`. Ở dưới phần GUID `4D1FDA02-38C7-4A6A-9CC6-4BCCA8B30102`, hãy thêm một mục mới tên là `rtc-blacklist`.

Tiếp theo, bạn liệt kê vùng lỗi dưới dạng mảng dữ liệu (Array). Ví dụ lệnh `rtcfx_exclude=85-86` sẽ trở thành `rtc-blacklist | Data | 8586`. Cách này cũng hoạt động với các dải số dài hơn như 85-89, v.v. Nếu vùng lỗi dài hơn như 85-89, với `rtc-blacklist` bạn phải ghi đủ mặt anh tài là (`<85 86 87 88 89>`) nha. Xong rồi thì nhớ xóa cái dòng rtcfx_exclude trong boot-args sau khi bạn đã thiết lập `rtc-blacklist` cho sạch nha.

Cuối cùng, nhớ khai báo ở mục `NVRAM -> Delete` để OpenCore biết đường mà ghi đè giá trị mới này vào.

Kết quả cuối cùng trông sẽ xịn xò như vầy nè:

![](../images/post-install/rtc-md/rtc-blacklist.png)
