# Hướng dẫn gỡ cài đặt hoàn toàn / Complete Uninstall Guide

## Windows

### Cách 1: Sử dụng Windows Uninstaller (Khuyến nghị)
1. Mở **Settings** > **Apps** > **Apps & features**
2. Tìm "Trình quản lý tệp HTML"
3. Nhấn **Uninstall** và làm theo hướng dẫn

### Cách 2: Sử dụng Control Panel
1. Mở **Control Panel** > **Programs and Features**
2. Tìm "Trình quản lý tệp HTML"
3. Nhấn **Uninstall**

### Gỡ cài đặt thủ công (nếu cần):
Nếu uninstaller không hoạt động, hãy xóa thủ công:
```
- Thư mục ứng dụng: C:\Users\[Username]\AppData\Local\Programs\html-file-manager\
- Dữ liệu người dùng: C:\Users\[Username]\AppData\Roaming\html-file-manager\
- Cache: C:\Users\[Username]\AppData\Local\html-file-manager\
- Lối tắt Desktop và Start Menu
```

---

## macOS

### Cách 1: Sử dụng Uninstaller Script (Khuyến nghị)
1. Mở **Terminal**
2. Chạy lệnh:
```bash
bash "/Applications/Trình quản lý tệp HTML.app/Contents/Resources/Uninstaller.sh"
```

### Cách 2: Gỡ cài đặt thủ công
1. Kéo ứng dụng từ **Applications** vào **Trash**
2. Xóa dữ liệu người dùng:
```bash
rm -rf "~/Library/Application Support/Trình quản lý tệp HTML"
rm -rf "~/Library/Preferences/com.htmlfilemanager.app.plist"
rm -rf "~/Library/Caches/com.htmlfilemanager.app"
rm -rf "~/Library/Logs/Trình quản lý tệp HTML"
```

---

## Linux

### Sử dụng Uninstaller Script
1. Mở **Terminal**
2. Chạy lệnh:
```bash
bash ./uninstall.sh
```

### Gỡ cài đặt AppImage thủ công:
1. Xóa file AppImage
2. Xóa dữ liệu:
```bash
rm -rf ~/.config/html-file-manager
rm -rf ~/.local/share/html-file-manager
rm -rf ~/.cache/html-file-manager
rm -f ~/.local/share/applications/html-file-manager.desktop
```

---

## Dữ liệu được xóa bởi Uninstaller

### ✅ Các thành phần sẽ được xóa:
- **Ứng dụng chính** và tất cả file thực thi
- **Dữ liệu cấu hình** (settings, preferences)
- **File cache** và dữ liệu tạm thời
- **Logs** và crash reports
- **Lối tắt** (Desktop, Start Menu, Applications)
- **Registry entries** (Windows)
- **File associations** (nếu có)
- **Workspace settings** đã lưu

### ❗ Lưu ý quan trọng:
- **Các file HTML** trong workspace của bạn **KHÔNG** bị xóa
- Uninstaller chỉ xóa dữ liệu của ứng dụng, không ảnh hưởng đến file làm việc
- Nếu muốn backup settings, hãy copy thư mục config trước khi gỡ cài đặt

---

## Troubleshooting

### Nếu gặp lỗi "Permission Denied":
**macOS/Linux:**
```bash
chmod +x ./uninstall.sh
sudo ./uninstall.sh
```

**Windows:** Chạy Command Prompt với quyền Administrator

### Nếu ứng dụng vẫn xuất hiện sau khi gỡ:
1. Restart máy tính
2. Kiểm tra lại các thư mục đã liệt kê ở trên
3. Clear browser cache (nếu từng sử dụng web version)

### Liên hệ hỗ trợ:
Nếu gặp vấn đề với việc gỡ cài đặt, vui lòng tạo issue tại GitHub repository.