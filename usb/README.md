# Tại sao bạn phải lập sơ đồ cổng USB

Quy trình lập sơ đồ cổng USB (map USB) là việc định nghĩa các cổng kết nối cho macOS biết và nói cho nó biết trên máy có những loại cổng gì. Lý do tụi mình cần làm bước này là vì:

* macOS đoán loại cổng USB trong máy bạn cực kì dở tệ (Vì nó được lập trình cứng chạy với sơ đồ cổng USB do Apple thiết kế tương ứng với số cổng USB có trên máy Mac chứ không làm dạng tự quét rồi lưu sơ đồ cổng giống Windows).
* Một số cổng có thể chạy chậm hơn tốc độ định mức (cổng 3.1 mà chạy ì ạch như 2.0).
* Một số cổng tịt ngòi luôn không chạy.
* Bluetooth đình công không làm việc.
* Mấy cái dịch vụ của hệ điều hành như Handoff có thể chạy không ổn định.
* Chế độ ngủ (Sleep) có thể bị lỗi.
* Tính năng Cắm nóng (Hot-Plug) không sử dụng được (tức là cắm khi máy đã khởi động HĐH rồi thì không nhận mà phải cắm thiết bị USB từ lúc mở máy).
* Thậm chí USB, ổ cứng rời mà bạn cắm có nguy cơ dữ liệu bị hư hỏng do xài `XhciPortLimit`

Giờ thì bạn đã biết tại sao phải lập sơ đồ cổng USB rồi, chúng ta có thể bàn về thông tin kỹ thuật của việc map USB. Phần này cấm có tua nhanh nha, không là đọc mấy phần dưới sẽ cảm giác như đang đọc tiếng Nga ngọng nghịu viết bởi một ông say rượu đó (ý là không hiểu mô tê gì đâu).

Với USB, bạn cần hiểu là không phải cổng nào cũng như cổng nào, một số cổng thực ra đang giấu một cổng khác bên trong nó! Ý mình là như vầy:

* Một cổng USB 3.0 thực ra được macOS nhìn nhận là 2 cổng: một cái USB 2.0 **và** một cái USB 3.0.
* Đây cũng là cách USB giữ khả năng tương thích ngược, vì mọi thiết bị USB 3.0 **phải** hỗ trợ USB 2.0.

Giờ nhìn cái sơ đồ cấu tạo cổng USB này để dễ hình dung nè:

![Image from usb3.com](../images/post-install/usb-md/usb-3.png)

Như bạn thấy đó, 4 chân bên dưới dành riêng cho USB 2.0, khi 5 cái chân thêm ở phía trên được nhận diện thì thiết bị sẽ chuyển sang chế độ USB 3.0.

Giờ đã thông não mấy cái cơ bản rồi, chúng ta phải nói về cái giới hạn 15 cổng đáng sợ.

## macOS và giới hạn 15 cổng

Để mình đưa bạn lên cỗ máy thời gian của Doraemon quay ngược thời gian về cuối năm 2015, lúc OS X 10.11 El Capitan ra mắt. Đây là bản cập nhật mang đến nhiều thứ vừa là ân huệ vừa là nỗi đau cho cộng đồng Hackintosh, điển hình như System Integrity Protection (Bảo vệ toàn vẹn hệ thống) và giới hạn 15 cổng.

Giới hạn 15 cổng trong macOS (hồi đó vẫn còn tên là OS X) là giới hạn cứng chỉ cho phép tối đa 15 cổng trên mỗi bộ điều khiển (controller). Vụ này trở thành rắc rối khi nhìn vào số lượng cổng chipset có trên bo mạch chủ của bạn:

* Chipset Z170 và mới hơn: Tổng cộng 26 cổng.

Và thậm chí máy bạn chả có đủ 26 cổng vật lý thật đâu, nhưng tụi nó vẫn được khai báo trong bảng ACPI gây ra lỗi vì macOS không phân biệt được đâu là cổng thật và đâu là cổng mà mấy ông viết firmware lười xóa đi.

> Nhưng sao Apple lại chọn con số 15 làm giới hạn?

Cái này liên quan đến một mảng thú vị của máy tính: hệ đếm thập lục phân (hexadecimal)! Nó khác hệ thập phân của chúng ta ở chỗ tổng cộng có 15 giá trị (đếm từ 1) với giá trị cuối cùng là `0xF`. Nghĩa là dừng ở 15 thì gọn gàng hơn là mở rộng giới hạn lên tới 255 (0xFF), trong mắt Apple thì việc có hơn 15 cổng là vô nghĩa vì chả có máy Mac nào họ bán ra vượt quá con số này cả. Và nếu người dùng Mac Pro cắm thêm card mở rộng USB, cái card đó sẽ có giới hạn 15 cổng riêng của nó.

Và giờ khi tính đến cái quirk (cài đặt đặc biệt) `XhciPortLimit`, bạn sẽ hiểu *tại sao* dữ liệu có thể bị hỏng. Vì chúng ta đang cố vượt qua giới hạn 0xF và lấn sang vùng nhớ của người khác. Nên hãy tránh dùng cái quirk này nếu có thể.

* Lưu ý: Mặc dù cái tên `XhciPortLimit` nghe như kiểu nó giới hạn số cổng XHCI, nhưng thực tế nó đang vá Giới hạn cổng XHCI lên một giá trị cao hơn.

> Vậy còn USB hub thì sao?

USB Hub cắm vào một trong các cổng của bộ điều khiển USB có giới hạn cổng kiểu khác. Tổng cộng, một cổng USB đơn lẻ có thể chia tách thành 127 cổng. Cái này tính cả USB hub cắm nối tiếp vào USB hub khác luôn.

## Giờ xong phần kể chuyện đêm khuya rồi, chuyển sang phần [Chuẩn bị hệ thống](./system-preparation.md) nào
