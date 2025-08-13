#!/bin/bash

# HTML File Manager - macOS Uninstaller Script
# This script completely removes the HTML File Manager app and all its data

APP_NAME="Trình quản lý tệp HTML"
APP_BUNDLE="Trình quản lý tệp HTML.app"
BUNDLE_ID="com.htmlfilemanager.app"

echo "🗑️  Gỡ cài đặt $APP_NAME"
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
pkill -f "$APP_BUNDLE" 2>/dev/null || true
killall "$APP_NAME" 2>/dev/null || true

# Remove the application bundle
echo "2. Đang xóa ứng dụng..."
remove_if_exists "/Applications/$APP_BUNDLE"
remove_if_exists "$HOME/Applications/$APP_BUNDLE"

# Remove application data and preferences
echo "3. Đang xóa dữ liệu ứng dụng..."
remove_if_exists "$HOME/Library/Application Support/$APP_NAME"
remove_if_exists "$HOME/Library/Application Support/html-file-manager"
remove_if_exists "$HOME/Library/Preferences/$BUNDLE_ID.plist"
remove_if_exists "$HOME/Library/Preferences/html-file-manager.plist"

# Remove caches
echo "4. Đang xóa bộ nhớ cache..."
remove_if_exists "$HOME/Library/Caches/$BUNDLE_ID"
remove_if_exists "$HOME/Library/Caches/html-file-manager"

# Remove logs
echo "5. Đang xóa tệp nhật ký..."
remove_if_exists "$HOME/Library/Logs/$APP_NAME"
remove_if_exists "$HOME/Library/Logs/html-file-manager"

# Remove saved application state
echo "6. Đang xóa trạng thái ứng dụng đã lưu..."
remove_if_exists "$HOME/Library/Saved Application State/$BUNDLE_ID.savedState"

# Remove webkit storage
echo "7. Đang xóa dữ liệu webkit..."
remove_if_exists "$HOME/Library/WebKit/$BUNDLE_ID"

# Remove crash reports
echo "8. Đang xóa báo cáo lỗi..."
remove_if_exists "$HOME/Library/Application Support/CrashReporter/$APP_NAME"*

# Remove temp files
echo "9. Đang xóa tệp tạm thời..."
rm -rf /tmp/*$BUNDLE_ID* 2>/dev/null || true
rm -rf /tmp/*html-file-manager* 2>/dev/null || true

# Remove quarantine attributes (if any)
echo "10. Đang xóa thuộc tính quarantine..."
xattr -d -r com.apple.quarantine "/Applications/$APP_BUNDLE" 2>/dev/null || true

# Remove from Dock (if pinned)
echo "11. Đang xóa khỏi Dock..."
defaults delete com.apple.dock persistent-apps -array-add "$(defaults read com.apple.dock persistent-apps | grep -v "$BUNDLE_ID")" 2>/dev/null || true
killall Dock 2>/dev/null || true

echo ""
echo "✅ Gỡ cài đặt hoàn tất!"
echo "Ứng dụng $APP_NAME và tất cả dữ liệu đã được xóa."
echo ""
echo "Cảm ơn bạn đã sử dụng $APP_NAME!"