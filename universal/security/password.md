# Menu mật khẩu OpenCore

Từ bản OpenCore 0.6.1 trở đi, anh em mình đã có thể đặt mật khẩu chuẩn SHA-512 (thuật toán mã hóa cực mạnh) để bảo vệ dàn máy cưng của mình. Khi bật cái này lên, mỗi khi bạn muốn làm mấy việc "hệ trọng" là máy sẽ hỏi mật khẩu ngay. Mấy việc đó bao gồm:

* Hiển thị menu khởi động (boot menu)
* Khởi động các hệ điều hành hoặc công cụ không mặc định (tức là mấy thứ không được chọn sẵn trong Startup Disk (Ổ đĩa khởi động) hoặc Bootcamp Utility (Công cụ Bootcamp))
* Reset NVRAM
* Khởi động các chế độ không mặc định (ví dụ như chế độ Verbose (hiển thị dòng lệnh) hoặc Safe Mode (chế độ an toàn) qua các phím tắt)

Với bản OpenCore 0.6.7, một công cụ mới tên là `ocpasswordgen` (trình tạo mật khẩu OpenCore) đã được thêm vào để giúp bạn tạo mật khẩu dễ dàng hơn.

Để bắt đầu, hãy lấy bản OpenCore 0.6.7 hoặc mới hơn và chạy file nhị phân `ocpasswordgen` trong thư mục `Utilities/ocpasswordgen/`. Nó sẽ hiện ra thông báo yêu cầu bạn tạo mật khẩu:

![](../../images/post-install/security-md/ocpasswordgen.png)

Trong ví dụ này, mình chọn mật khẩu là `Dortania`. Công cụ `ocpasswordgen` sau đó sẽ "nhả" ra 2 giá trị quan trọng để mình điền vào file config.plist (file cấu hình):

* PasswordHash: Hàm băm của mật khẩu (chuỗi mã hóa)
* PasswordSalt: Muối của mật khẩu!?? (giúp bảo đảm 2 người dùng có cùng mật khẩu cũng không bị trùng bản băm)

Tiếp theo, hãy mở file config.plist và thêm các giá trị này vào mục Misc -> Security:

* Lưu ý (Note): Đừng quên bật mục `EnablePassword` (Kích hoạt mật khẩu)

![](../../images/post-install/security-md/password-config.png)

Sau khi thay đổi xong, bạn lưu lại và khởi động lại máy. Bây giờ, khi vào menu của OpenCore, bạn sẽ thấy một bảng hỏi mật khẩu hiện ra:

![](../../images/post-install/security-md/password-demo.png)

Nhập mật khẩu của bạn vào là sẽ thấy các tùy chọn khởi động như bình thường:

* Lưu ý (Note): Trên một số máy đời cũ hoặc máy ảo (VM), từ lúc bạn gõ xong mật khẩu tới lúc nó vào được menu có thể mất hơn 30 giây để xác thực xong. Đoạn này bạn nhớ kiên nhẫn một chút, đừng tưởng máy treo nha.

![](../../images/post-install/security-md/password-done.png)
