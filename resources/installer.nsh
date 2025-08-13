; Custom NSIS installer functions for HTML File Manager

; Custom uninstaller function
!macro customUnInstallCheck
  ; Close any running instances of the app
  DetailPrint "Đang kiểm tra các tiến trình đang chạy..."
  !insertmacro TerminateApp
!macroend

; Terminate running application processes
!macro TerminateApp
  ${Do}
    ${nsProcess::FindProcess} "${APP_EXECUTABLE_FILENAME}" $R0
    ${If} $R0 = 0
      DetailPrint "Đang dừng ứng dụng Trình quản lý tệp HTML..."
      ${nsProcess::KillProcess} "${APP_EXECUTABLE_FILENAME}" $R0
      Sleep 1000
    ${Else}
      ${ExitDo}
    ${EndIf}
  ${Loop}
!macroend

; Custom uninstall function to remove user data
!macro customUnInstall
  ; Remove application data
  DetailPrint "Đang xóa dữ liệu ứng dụng..."
  RMDir /r "$APPDATA\${APP_FILENAME}"
  RMDir /r "$LOCALAPPDATA\${APP_FILENAME}"
  
  ; Remove user configuration
  DetailPrint "Đang xóa cấu hình người dùng..."
  RMDir /r "$APPDATA\html-file-manager"
  RMDir /r "$LOCALAPPDATA\html-file-manager"
  
  ; Remove temp files
  DetailPrint "Đang xóa tệp tạm thời..."
  RMDir /r "$TEMP\${APP_FILENAME}"
  
  ; Remove registry entries
  DetailPrint "Đang xóa mục đăng ký..."
  DeleteRegKey HKCU "Software\${APP_FILENAME}"
  DeleteRegKey HKLM "Software\${APP_FILENAME}"
  
  ; Remove from Add/Remove Programs
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_FILENAME}"
  
  DetailPrint "Gỡ cài đặt hoàn tất!"
!macroend