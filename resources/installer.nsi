; NSIS Installer Script for HTML File Manager
; This script provides complete installation and uninstallation functionality

!include "MUI2.nsh"
!include "FileFunc.nsh"
!include "LogicLib.nsh"

; Application information
!define APP_NAME "Trình quản lý tệp HTML"
!define APP_VERSION "${VERSION}"
!define APP_PUBLISHER "HTML File Manager Team"
!define APP_URL "https://github.com/your-repo/html-file-manager"

; MUI Configuration
!define MUI_ABORTWARNING
!define MUI_ICON "icon.ico"
!define MUI_UNICON "icon.ico"

; Welcome page
!insertmacro MUI_PAGE_WELCOME

; License page (optional)
; !insertmacro MUI_PAGE_LICENSE "license.txt"

; Directory page
!insertmacro MUI_PAGE_DIRECTORY

; Installation page
!insertmacro MUI_PAGE_INSTFILES

; Finish page
!define MUI_FINISHPAGE_RUN "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
!insertmacro MUI_PAGE_FINISH

; Uninstaller pages
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

; Languages
!insertmacro MUI_LANGUAGE "Vietnamese"
!insertmacro MUI_LANGUAGE "English"

; Uninstaller section
Section "Uninstall"
  ; Stop any running instances
  DetailPrint "Đang dừng các tiến trình đang chạy..."
  
  ; Remove application files
  DetailPrint "Đang xóa tệp ứng dụng..."
  RMDir /r "$INSTDIR"
  
  ; Remove shortcuts
  DetailPrint "Đang xóa lối tắt..."
  Delete "$DESKTOP\${APP_NAME}.lnk"
  Delete "$SMPROGRAMS\${APP_NAME}.lnk"
  RMDir "$SMPROGRAMS\${APP_NAME}"
  
  ; Remove application data directories
  DetailPrint "Đang xóa dữ liệu ứng dụng..."
  RMDir /r "$APPDATA\${APP_NAME}"
  RMDir /r "$APPDATA\html-file-manager"
  RMDir /r "$LOCALAPPDATA\${APP_NAME}"
  RMDir /r "$LOCALAPPDATA\html-file-manager"
  RMDir /r "$LOCALAPPDATA\${APP_NAME}-updater"
  
  ; Remove temporary files
  DetailPrint "Đang xóa tệp tạm thời..."
  RMDir /r "$TEMP\${APP_NAME}"
  RMDir /r "$TEMP\html-file-manager"
  
  ; Remove registry entries
  DetailPrint "Đang xóa mục đăng ký..."
  DeleteRegKey HKCU "Software\${APP_NAME}"
  DeleteRegKey HKCU "Software\html-file-manager"
  DeleteRegKey HKLM "Software\${APP_NAME}"
  DeleteRegKey HKLM "Software\html-file-manager"
  
  ; Remove uninstaller registry entry
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}"
  
  ; Remove file associations (if any)
  DeleteRegKey HKCR "htmlfilemanager"
  DeleteRegKey HKCR ".htmlfm"
  
  MessageBox MB_OK "Ứng dụng ${APP_NAME} đã được gỡ cài đặt hoàn toàn!"
SectionEnd