@echo off
REM HTML File Manager - Windows Build Script
setlocal enabledelayedexpansion

REM Cleanup function for errors
:cleanup_on_error
echo %ERROR% Build that bai! Don dep build artifacts...
if exist "dist" rmdir /s /q "dist" 2>nul
if exist "release" rmdir /s /q "release" 2>nul
del /q resources\*.iconset 2>nul
echo %ERROR% Build artifacts da duoc xoa do loi build.
goto :eof

echo ========================================
echo  HTML FILE MANAGER - BUILD SCRIPT
echo ========================================

REM Colors (limited in Windows)
set "INFO=[INFO]"
set "SUCCESS=[SUCCESS]"
set "ERROR=[ERROR]"
set "WARNING=[WARNING]"

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo %ERROR% Node.js khong duoc tim thay. Vui long cai dat Node.js
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo %ERROR% npm khong duoc tim thay. Vui long cai dat npm
    pause
    exit /b 1
)

echo %INFO% Kiem tra dependencies...

REM Smart npm install function
:smart_npm_install
if exist "package-lock.json" (
    echo %INFO% Su dung npm ci (package-lock.json ton tai)...
    call npm ci
) else (
    echo %INFO% Su dung npm install (khong co package-lock.json)...
    call npm install
)
if errorlevel 1 (
    echo %ERROR% Khong the cai dat dependencies
    pause
    exit /b 1
)
goto :eof

REM Check if dependencies need to be installed or updated
set "need_install=0"

REM Check if node_modules doesn't exist
if not exist "node_modules" set "need_install=1"

REM Check if package-lock.json is newer than node_modules
if exist "package-lock.json" (
    for %%i in ("package-lock.json") do set "lock_date=%%~ti"
    for %%i in ("node_modules") do set "modules_date=%%~ti"
    if "!lock_date!" gtr "!modules_date!" set "need_install=1"
)

REM Check if package.json is newer than node_modules  
if exist "package.json" (
    for %%i in ("package.json") do set "pkg_date=%%~ti"
    for %%i in ("node_modules") do set "modules_date=%%~ti"
    if "!pkg_date!" gtr "!modules_date!" set "need_install=1"
)

if "%need_install%"=="1" (
    echo %INFO% Cai dat dependencies...
    call :smart_npm_install
)

echo %SUCCESS% Dependencies OK

REM Create resources directory if it doesn't exist
if not exist "resources" mkdir resources

REM Create default icon if none exists
if not exist "resources\icon.png" (
    echo %INFO% Tao icon mac dinh...
    REM We'll use a simple base64 encoded PNG for default icon
    echo Creating default icon...
)

REM Clean previous builds
echo %INFO% Don dep build cu...
if exist "dist" rmdir /s /q "dist"
if exist "release" rmdir /s /q "release"
echo %SUCCESS% Build cu da duoc xoa

REM Build the application
echo %INFO% Building application...
call npm run build
if errorlevel 1 (
    echo %ERROR% Source build that bai!
    call :cleanup_on_error
    pause
    exit /b 1
)
echo %SUCCESS% Application build hoan tat

REM Create distributables based on argument
set "platform=%1"
if "%platform%"=="" set "platform=win"

echo %INFO% Tao distributables cho platform: %platform%

if /i "%platform%"=="mac" (
    call npm run dist:mac
    if errorlevel 1 (
        echo %ERROR% Tao distributables that bai cho platform: %platform%
        call :cleanup_on_error
        pause
        exit /b 1
    )
) else if /i "%platform%"=="linux" (
    call npm run dist:linux
    if errorlevel 1 (
        echo %ERROR% Tao distributables that bai cho platform: %platform%
        call :cleanup_on_error
        pause
        exit /b 1
    )
) else if /i "%platform%"=="all" (
    call npm run dist:all
    if errorlevel 1 (
        echo %ERROR% Tao distributables that bai cho platform: %platform%
        call :cleanup_on_error
        pause
        exit /b 1
    )
) else (
    call npm run dist:win
    if errorlevel 1 (
        echo %ERROR% Tao distributables that bai cho platform: %platform%
        call :cleanup_on_error
        pause
        exit /b 1
    )
)

echo ========================================
echo           KET QUA BUILD
echo ========================================

if exist "release" (
    echo %SUCCESS% Build thanh cong! Cac file da duoc tao:
    echo.
    dir /b release\*.exe release\*.zip 2>nul
    echo.
    echo %INFO% Duong dan build: %cd%\release
    echo.
    echo Ban co muon mo thu muc build? (y/n)
    set /p "open_folder="
    if /i "!open_folder!"=="y" start "" "release"
) else (
    echo %ERROR% Build directory khong ton tai. Build co the da that bai.
)

echo %SUCCESS% Build process hoan tat!
pause