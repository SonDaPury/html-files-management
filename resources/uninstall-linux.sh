#!/bin/bash

# HTML File Manager - Linux Uninstaller Script
# This script completely removes the HTML File Manager app and all its data

APP_NAME="html-file-manager"
DISPLAY_NAME="Trình quản lý tệp HTML"

echo "🗑️  Gỡ cài đặt $DISPLAY_NAME"
echo "========================================"

# Function to remove directory if it exists
remove_if_exists() {
    if [ -d "$1" ]; then
        echo "Đang xóa: $1"
        rm -rf "$1"
    fi
}

# Function to remove file if it exists
remove_file_if_exists() {
    if [ -f "$1" ]; then
        echo "Đang xóa: $1"
        rm -f "$1"
    fi
}

# Stop the application if it's running
echo "1. Đang dừng ứng dụng nếu đang chạy..."
pkill -f "$APP_NAME" 2>/dev/null || true
pkill -f "html-file-manager" 2>/dev/null || true

# Remove application binary/AppImage
echo "2. Đang xóa ứng dụng..."
remove_file_if_exists "$HOME/Applications/$APP_NAME.AppImage"
remove_file_if_exists "/opt/$APP_NAME/$APP_NAME"
remove_if_exists "/opt/$APP_NAME"
remove_file_if_exists "/usr/local/bin/$APP_NAME"

# Remove desktop entry
echo "3. Đang xóa lối tắt desktop..."
remove_file_if_exists "$HOME/.local/share/applications/$APP_NAME.desktop"
remove_file_if_exists "/usr/share/applications/$APP_NAME.desktop"

# Remove application data
echo "4. Đang xóa dữ liệu ứng dụng..."
remove_if_exists "$HOME/.config/$APP_NAME"
remove_if_exists "$HOME/.local/share/$APP_NAME"

# Remove cache
echo "5. Đang xóa bộ nhớ cache..."
remove_if_exists "$HOME/.cache/$APP_NAME"

# Remove logs
echo "6. Đang xóa tệp nhật ký..."
remove_if_exists "$HOME/.local/share/logs/$APP_NAME"

# Remove temp files
echo "7. Đang xóa tệp tạm thời..."
rm -rf /tmp/*$APP_NAME* 2>/dev/null || true

# Remove systemd user service (if any)
echo "8. Đang xóa dịch vụ systemd..."
remove_file_if_exists "$HOME/.config/systemd/user/$APP_NAME.service"
systemctl --user daemon-reload 2>/dev/null || true

# Remove from menu cache
echo "9. Đang cập nhật menu..."
update-desktop-database "$HOME/.local/share/applications" 2>/dev/null || true

# Remove mime type associations (if any)
echo "10. Đang xóa liên kết kiểu file..."
remove_file_if_exists "$HOME/.local/share/mime/packages/$APP_NAME.xml"
update-mime-database "$HOME/.local/share/mime" 2>/dev/null || true

echo ""
echo "✅ Gỡ cài đặt hoàn tất!"
echo "Ứng dụng $DISPLAY_NAME và tất cả dữ liệu đã được xóa."
echo ""
echo "Cảm ơn bạn đã sử dụng $DISPLAY_NAME!"