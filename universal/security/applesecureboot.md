# Khởi động an toàn kiểu Apple

* Lưu ý (Note): Các mục DmgLoading, SecureBootModel và ApECID yêu cầu bản [OpenCore 0.6.1](https://github.com/acidanthera/OpenCorePkg/releases) hoặc mới hơn.
* Lưu ý 2 (Note 2): Hệ điều hành macOS Big Sur trở lên yêu cầu OpenCore 0.6.3 trở lên để hỗ trợ Apple Secure Boot chuẩn chỉnh nhất.

## Vậy Apple Secure Boot là cái chi?

* Thông tin này dựa trên [bài viết từ tác giả vit9696](https://applelife.ru/posts/905541), [Tài liệu Apple T2](https://www.apple.com/euro/macbook-pro-13/docs/a/Apple_T2_Security_Chip_Overview.pdf) và [Trang Secure Boot của Osy](https://osy.gitbook.io/hac-mini-guide/details/secure-boot)

Để hiểu rõ nhất về Apple Secure Boot, hãy nhìn qua cách quá trình khởi động diễn ra trên máy Mac xịn so với OpenCore về mặt bảo mật:

![](../../images/post-install/security-md/extension.png)

Như bạn thấy, có nhiều "lớp tin tưởng" được lồng vào trong Apple Secure Boot:

* OpenCore sẽ kiểm tra file kê khai của boot.efi (ví dụ: boot.efi.j137ap.im4m) để bảo đảm rằng file boot.efi (file nạp hệ điều hành) này được chính Apple ký tên và có thể dùng được cho kiểu Secure Boot này.
  * Với các máy có ApECID khác không (non-zero), OpenCore sẽ kiểm tra thêm giá trị ECID được ghi trong file kê khai của boot.efi (ví dụ: boot.efi.j137ap.XXXXXXXX.im4m). Việc này để đảm bảo rằng nếu ổ cứng của bạn bị tháo ra rồi gắn vào một máy khác (dù cùng dòng máy) thì cũng không thể khởi động được, tránh rò rỉ dữ liệu.

* boot.efi sẽ kiểm tra kernelcache (bộ nhớ đệm nhân hệ thống) để đảm bảo nó không bị ai can thiệp hay sửa đổi.
* apfs.kext (trình điều khiển hệ thống file APFS) và AppleImage4 sẽ đảm bảo bản chụp (snapshot) của phân vùng hệ thống (System Volume) không bị thay đổi (Cái này chỉ áp dụng từ Big Sur trở đi).

Không phải máy nào cũng cần tất cả các bước kiểm tra này mới khởi động được, nhưng chúng dành cho những ai muốn mức bảo mật tối đa. Hiện tại thông tin về Secure Boot dựa trên phần sụn (firmware-based) không nằm trong bài này, nhưng tất cả các tùy chọn Apple Secure Boot sẽ được giải thích chi tiết bên dưới.

## DmgLoading

Thiết lập này khá đơn giản nhưng lại cực kỳ quan trọng đối với Apple Secure Boot. Nó cho phép bạn quy định cách OpenCore tải các file ảnh đĩa (.dmg). Mặc định mình khuyên nên để là `Signed` (Chỉ tải file có chữ ký), nhưng nếu muốn bảo mật "tận răng" thì chọn `Disabled` (Vô hiệu hóa) cũng được.

Các tuỳ chọn cho `Misc -> Security -> DmgLoading`:

| Giá trị (Value) | Giải thích (Comment) |
| :--- | :--- |
| Any (Bất kỳ) | Cho phép nạp tất cả các file DMG, nhưng tùy chọn này sẽ khiến Apple Secure Boot bị lỗi nếu cái đó đang mở (đại loại là 2 cái quánh lộn nhau làm lỗi boot luôn). |
| Signed (Đã ký)  | Chỉ cho phép nạp các file DMG có chữ ký của Apple (như bộ cài macOS). |
| Disabled (Vô hiệu hoá) | Vô hiệu hóa việc tải tất cả DMG từ bên ngoài, nhưng vẫn cho phép dùng Recovery (chế độ phục hồi) nội bộ. |

## SecureBootModel (Mẫu máy áp dụng Secure Boot)

SecureBootModel dùng để giả lập kiểu phần cứng và chính sách Apple Secure Boot. Nó giúp mình bật được tính năng này trên bất kỳ máy SMBIOS nào, ngay cả khi máy gốc không hỗ trợ (ví dụ mấy máy đời trước 2017 không có chip T2). Bật SecureBootModel tương đương với mức ["Medium Security - Bảo mật Trung bình"](https://support.apple.com/HT208330), Muốn lên mức Full Security - Bảo mật Đầy đủ thì mời bạn đọc tiếp mục [ApECID](#apecid)

Hiện tại các tùy chọn cho `Misc -> Security -> SecureBootModel` bao gồm:

| Giá trị   | SMBIOS                                | Phiên bản macOS Tối thiểu |
| :---      | :---                                    | :---                  |
| Disabled  | Không chọn mẫu máy nào, đồng nghĩa Secure Boot bị vô hiệu hoá. | N/A                   |
| Default   | Cài đặt hiện tại là x86legacy           | 11.0.1 (20B29)        |
| j137      | iMacPro1,1 (Tháng 12 năm 2017)          | 10.13.2 (17C2111)     |
| j680      | MacBookPro15,1 (Tháng 7 năm 2018)       | 10.13.6 (17G2112)     |
| j132      | MacBookPro15,2 (Tháng 7 năm 2018)       | 10.13.6 (17G2112)     |
| j174      | Macmini8,1 (Tháng 10 năm 2018)          | 10.14 (18A2063)       |
| j140k     | MacBookAir8,1 (Tháng 10 năm 2018)       | 10.14.1 (18B2084)     |
| j780      | MacBookPro15,3 (Tháng 5 năm 2019)       | 10.14.5 (18F132)      |
| j213      | MacBookPro15,4 (Tháng 7 năm 2019)       | 10.14.5 (18F2058)     |
| j140a     | MacBookAir8,2 (Tháng 7 năm 2019)        | 10.14.5 (18F2058)     |
| j152f     | MacBookPro16,1 (Tháng 11 năm 2019)      | 10.15.1 (19B2093)     |
| j160      | MacPro7,1 (Tháng 12 năm 2019)           | 10.15.1 (19B88)       |
| j230k     | MacBookAir9,1 (Tháng 3 năm 2020)        | 10.15.3 (19D2064)     |
| j214k     | MacBookPro16,2 (Tháng 5 năm 2020)       | 10.15.4 (19E2269)     |
| j223      | MacBookPro16,3 (Tháng 5 năm 2020)       | 10.15.4 (19E2265)     |
| j215      | MacBookPro16,4 (Tháng 6 năm 2020)       | 10.15.5 (19F96)       |
| j185      | iMac20,1 (Tháng 8 năm 2020)             | 10.15.6 (19G2005)     |
| j185f     | iMac20,2 (Tháng 8 năm 2020)             | 10.15.6 (19G2005)     |
| x86legacy | Dành cho máy Mac không có chip T2, áp dụng cho bản 11.0 trở lên (Khuyến khích sử dụng cái này với máy ảo VM)| 11.0.1 (20B29)        |

### Những lưu ý đặc biệt với SecureBootModel

* Bạn không nên sử dụng giá trị `Default` (Mặc định). Vì nếu sau này bạn muốn nâng cấp lên mức Full Security với ApECID, bạn nên chọn một giá trị cụ thể (ví dụ cái nào gần với dòng SMBIOS của bạn nhất hoặc phiên bản macOS bạn đang định chạy) vì giá trị `Default` có thể sẽ bị thay đổi trong các bản OpenCore tương lai.
  * Thêm nữa, `Default` đang được gán cho `x86legacy`, cái này sẽ làm bạn không khởi động được các bản từ High Sierra đến Catalina đâu.
  * Các máy Mac đời cũ không có chip T2 không bắt buộc phải xài `x86legacy`, bạn chọn giá trị nào ở trên cũng được.
* Danh sách các trình điều khiển (driver) được nạp sẵn có thể khác nhau, dẫn đến việc bạn phải thay đổi danh sách các kext (trình điều khiển nhân) được thêm (Added) hoặc ép buộc (Forced).
  * Ví dụ: Trong trường hợp này không thể nạp (inject) IO80211Family vì nó đã có sẵn trong kernelcache rồi (giờ thì bạn thấy cái đoạn này quen thuộc chưa?).
* Các trình điều khiển nhân (kernel drivers) không có chữ ký hoặc một số loại có chữ ký nhất định sẽ không dùng được.
  * Bao gồm cả Nvidia Web Drivers trên bản 10.13.
* Việc thay đổi phân vùng hệ thống trên các hệ điều hành có tính năng niêm phong (sealing) như macOS 11 có thể khiến hệ điều hành không khởi động được.
  * Nếu bạn có ý định tắt tính năng APFS snapshots (bản chụp hệ thống) của macOS, hãy nhớ tắt luôn SecureBootModel nha.
* Một số lỗi khởi động đang ngủ đông ngàn thu có thể bị gọi dậy khi kích hoạt Secure Boot (những lỗi mà trước đó có thể không xuất hiện khi bạn tắt nó, yêu cầu bạn phải khắc phục những lỗi này nếu muốn mở nó).
  * Thường gặp trên mấy cái máy tính có BIOS APTIO IV, lúc đầu có thể không cần mở IgnoreInvalidFlexRatio và HashServices nhưng khi kích hoạt Secure Boot thì cần đó.
* Trên các CPU đời cũ (như trước dòng Sandy Bridge), việc mở Apple Secure Boot có thể khiến máy khởi động chậm hơn một chút (tầm 1 giây thôi).
* Mấy cái hệ điều hành ra mắt trước khi Apple Secure Boot xuất hiện (như macOS 10.12 trở về trước) vẫn sẽ khởi động được cho đến khi bạn mở UEFI Secure Boot (trong BIOS).
  * Lý do là Apple Secure Boot coi mấy bản macOS cũ này là không tương thích và sẽ để vi chương trình (firmware) tự xử lý, y hệt như cách nó xử lý Windows vậy.
* Với máy ảo (VM) nên xài giá trị `x86legacy` để được hỗ trợ Secure Boot tốt nhất.
  * Lưu ý: Nếu bạn chọn bất kỳ kiểu mẫu máy nào khác thì phải bật thêm `ForceSecureBootScheme`.

::: details Xử lý sự cố

Do một cái lỗi khá là "vô tri" từ phía Apple, một số máy có thể bị thiếu mấy file secure boot ngay trên chính ổ cứng. Vì lỗi này mà bạn có thể gặp thông báo:

```
OCB: LoadImage failed - Security Violation (OpenCore Bootloader: Nạp file ảnh thất bại - Vi phạm chính sách Bảo mật!)
```

Để giải quyết, bạn hãy chạy mấy dòng lệnh sau trong macOS:

```bash
# Đầu tiên, bạn cần tìm cái ổ Preboot trên máy
diskutil list

# Từ danh sách bên dưới, ta có thể thấy ổ đĩa Preboot của chúng ta là disk5s2.
/dev/disk5 (được tổng hợp):
   #:      LOẠI Ổ ĐĨA (TYPE NAME)                  KÍCH THƯỚC(SIZE) MÃ ĐỊNH DANH (IDENTIFIER)
   0:      APFS Container Scheme -                      +255.7 GB   disk5
                                 Physical Store disk4s2
   1:                APFS Volume ⁨Big Sur HD - Data⁩       122.5 GB   disk5s1
   2:                APFS Volume ⁨Preboot⁩                 309.4 MB   disk5s2
   3:                APFS Volume ⁨Recovery⁩                887.8 MB   disk5s3
   4:                APFS Volume ⁨VM⁩                      1.1 MB     disk5s4
   5:                APFS Volume ⁨Big Sur HD⁩              16.2 GB    disk5s5
   6:              APFS Snapshot ⁨com.apple.os.update-...⁩ 16.2 GB    disk5s5s
# Bây giờ bạn cần gắn (mount) ổ đĩa Preboot
diskutil mount disk5s2

# Gõ CD (chuyển đến) ổ đĩa Preboot
# Lưu ý rằng ổ đĩa thực tế nằm ở đường dẫn /System/Volumes/Preboot trong macOS.
# Tuy nhiên trong chế độ Recovery nó đơn giản được gắn (mount) ở đường dẫn /Volumes/Preboot
cd /System/Volumes/Preboot

# Lấy UUID của bạn
ls
 46923F6E-968E-46E9-AC6D-9E6141DF52FD
 CD844C38-1A25-48D5-9388-5D62AA46CFB8

# Nếu có nhiều UUID xuất hiện (ví dụ: bạn cài đặt song song nhiều phiên bản macOS), 
# bạn sẽ cần xác định UUID nào là chính xác.
# Cách dễ nhất để xác định là in giá trị của .disk_label.contentDetails
# của mỗi phân vùng.
cat ./46923F6E-968E-46E9-AC6D-9E6141DF52FD/System/Library/CoreServices/.disk_label.contentDetails
 Big Sur HD%

cat ./CD844C38-1A25-48D5-9388-5D62AA46CFB8/System/Library/CoreServices/.disk_label.contentDetails
 Catalina HD%

# Tiếp theo, hãy sao chép các tập tin khởi động an toàn, trong chế độ Recovery sẽ cần các lệnh khác.

# Ví dụ câu lệnh khi ở trong hệ điều hành macOS
# Đổi cái ví dụ CD844C38-1A25-48D5-9388-5D62AA46CFB8 thành cái giá trị UUID của bạn
cd ~
sudo cp -a /usr/standalone/i386/. /System/Volumes/Preboot/CD844C38-1A25-48D5-9388-5D62AA46CFB8/System/Library/CoreServices

# Ví dụ câu lệnh khi ở trong chế độ Recovery của macOS
# Bạn có thể cần thay thế Macintosh\ HD và CD844C38-1A25-48D5-9388-5D62AA46CFB8 thành
# tên tên Ổ đĩa Hệ thống của bạn và UUID của ổ Preboot
cp -a /Volumes/Macintosh\ HD/usr/standalone/i386/. /Volumes/Preboot/CD844C38-1A25-48D5-9388-5D62AA46CFB8/System/Library/CoreServices
```

Giờ đây bạn có thể bật SecureBootModel và khởi động lại máy tính mà không gặp vấn đề gì! Và vì chúng ta không chỉnh sửa trực tiếp phân vùng hệ thống nên không cần lo lắng về việc vô hiệu hóa SIP hoặc làm hỏng các ảnh chụp nhanh macOS.

:::

## ApECID (Mã định danh Apple Enclave)

ApECID được dùng như một mã định danh cho phân vùng bảo mật (Apple Enclave Identifier). Nói dễ hiểu thì nó cho phép mình dùng các mã định danh Apple Secure Boot "hàng độc" của riêng mình để đạt được mức ["Full Security - Bảo mật Đầy đủ"](https://support.apple.com/HT208330) theo trang giới thiệu khởi động an toàn của Apple (khi xài chung với SecureBootModel).

Để tạo giá trị ApECID cho riêng bạn, bạn cần một trình tạo số ngẫu nhiên có độ bảo mật cao để xuất ra một số nguyên 64-bit. Dưới đây là ví dụ bạn có thể chạy nếu máy đã cài [Python 3](https://www.python.org/downloads/):

```py
python3 -c 'import secrets; print(secrets.randbits(64))'
```

Sau khi có con số 64-bit "độc bản" này, bạn điền nó vào mục Misc -> ApECID trong file config.plist.

Tuy nhiên trước khi cài đặt ApECID, có vài điều cần lưu ý:

* Nếu bạn cài mới (fresh install) mà đặt ApECID khác 0, máy sẽ yêu cầu phải có kết nối mạng lúc cài đặt để xác thực.
* SecureBootModel nên được đặt một giá trị cụ thể thay vì để `Default` tránh trường hợp giá trị này bị đổi ở các bản OpenCore sau gây lỗi.
* Với máy đã cài đặt hệ điều hành sẽ cần phải được "cá nhân hóa" phân vùng. Để làm việc này, trước tiên bạn phải khởi động vào Recovery và chạy lệnh sau (thay `Macintosh HD` bằng tên phân vùng hệ thống của bạn - nếu để cùng tên thì bỏ qua khúc thay tên):

```sh
# Chạy lệnh này sau khi thiết lập giá trị ApECID của bạn.
# Bạn cũng cần có kết nối mạng hoạt động trong chế độ phục hồi để chạy lệnh này.
bless --folder "/Volumes/Macintosh HD/System/Library/CoreServices" --bootefi --personalize
```

Và một điều cần nhớ khi cài lại macOS 10.15 hoặc cũ hơn là bạn có thể gặp lỗi "Unable to verify macOS" (Không thể xác thực macOS). Để xử lý, bạn hãy cấp một ổ đĩa RAM (RAM disk) khoảng 2 MB để macOS dùng cho việc cá nhân hóa bằng cách nhập các lệnh sau vào terminal của Recovery trước khi bắt đầu cài đặt:

```sh
disk=$(hdiutil attach -nomount ram://4096)
diskutil erasevolume HFS+ SecureBoot $disk
diskutil unmount $disk
mkdir /var/tmp/OSPersonalizationTemp
diskutil mount -mountpoint /var/tmp/OSPersonalizationTemp $disk
```
