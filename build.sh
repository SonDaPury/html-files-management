#!/bin/bash

# HTML File Manager - Automated Build Script
# This script handles the complete build process including icon generation

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# App information
APP_NAME="Trình quản lý tệp HTML"
VERSION=$(node -p "require('./package.json').version")
BUILD_DIR="release"
RESOURCES_DIR="resources"

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}========================================${NC}"
    echo -e "${PURPLE} $1${NC}"
    echo -e "${PURPLE}========================================${NC}"
}

# Detect operating system
detect_os() {
    case "$OSTYPE" in
        darwin*)  echo "mac" ;;
        linux*)   echo "linux" ;;
        msys*|cygwin*|win32*) echo "windows" ;;
        *)        echo "unknown" ;;
    esac
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Smart npm install - use npm ci if package-lock.json exists, otherwise npm install
smart_npm_install() {
    if [ -f "package-lock.json" ]; then
        print_status "Sử dụng npm ci (package-lock.json tồn tại)..."
        npm ci
    else
        print_status "Sử dụng npm install (không có package-lock.json)..."
        npm install
    fi
}

# Install dependencies if needed
check_dependencies() {
    print_status "Kiểm tra dependencies..."
    
    if ! command_exists node; then
        print_error "Node.js không được tìm thấy. Vui lòng cài đặt Node.js"
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm không được tìm thấy. Vui lòng cài đặt npm"
        exit 1
    fi
    
    # Check if node_modules exists or if package-lock.json is newer
    if [ ! -d "node_modules" ] || ([ -f "package-lock.json" ] && [ "package-lock.json" -nt "node_modules" ]); then
        print_status "Cài đặt dependencies..."
        smart_npm_install
    elif [ -f "package.json" ] && [ "package.json" -nt "node_modules" ]; then
        print_status "package.json đã thay đổi, cài đặt lại dependencies..."
        smart_npm_install
    fi
    
    print_success "Dependencies OK"
}

# Create default icon if none exists
create_default_icon() {
    print_status "Tạo icon mặc định..."
    
    # Create a simple SVG icon
    cat > "$RESOURCES_DIR/icon.svg" << 'EOF'
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="64" fill="#2563eb"/>
  <path d="M128 128h256v64H128zm0 96h256v32H128zm0 64h192v32H128zm0 64h256v32H128z" fill="white"/>
  <circle cx="384" cy="384" r="48" fill="#fbbf24"/>
  <path d="M384 352l-16 16h32z" fill="#2563eb"/>
</svg>
EOF

    # Convert SVG to PNG using built-in tools or fallback
    if command_exists rsvg-convert; then
        rsvg-convert -w 512 -h 512 "$RESOURCES_DIR/icon.svg" > "$RESOURCES_DIR/icon.png"
    elif command_exists convert; then
        convert -background none "$RESOURCES_DIR/icon.svg" -resize 512x512 "$RESOURCES_DIR/icon.png"
    else
        # Fallback: Create a simple colored square PNG using ImageMagick alternative
        if command_exists sips; then
            # macOS has sips
            sips -s format png -z 512 512 "$RESOURCES_DIR/icon.svg" --out "$RESOURCES_DIR/icon.png" 2>/dev/null || true
        fi
    fi
    
    print_success "Icon mặc định đã được tạo"
}

# Generate icons for all platforms
generate_icons() {
    print_status "Tạo icons cho các nền tảng..."
    
    mkdir -p "$RESOURCES_DIR"
    
    # Check if we have a source icon
    if [ ! -f "$RESOURCES_DIR/icon.png" ] && [ ! -f "$RESOURCES_DIR/icon.svg" ]; then
        create_default_icon
    fi
    
    # Use the PNG as source
    SOURCE_ICON="$RESOURCES_DIR/icon.png"
    
    if [ ! -f "$SOURCE_ICON" ]; then
        print_warning "Không tìm thấy icon source. Sử dụng icon mặc định."
        create_default_icon
    fi
    
    OS=$(detect_os)
    
    # Generate macOS icon (.icns)
    if [ "$OS" = "mac" ] && command_exists iconutil; then
        print_status "Tạo macOS icon (.icns)..."
        ICONSET_DIR="$RESOURCES_DIR/icon.iconset"
        mkdir -p "$ICONSET_DIR"
        
        # Generate different sizes for iconset
        sips -z 16 16     "$SOURCE_ICON" --out "$ICONSET_DIR/icon_16x16.png" 2>/dev/null || true
        sips -z 32 32     "$SOURCE_ICON" --out "$ICONSET_DIR/icon_16x16@2x.png" 2>/dev/null || true
        sips -z 32 32     "$SOURCE_ICON" --out "$ICONSET_DIR/icon_32x32.png" 2>/dev/null || true
        sips -z 64 64     "$SOURCE_ICON" --out "$ICONSET_DIR/icon_32x32@2x.png" 2>/dev/null || true
        sips -z 128 128   "$SOURCE_ICON" --out "$ICONSET_DIR/icon_128x128.png" 2>/dev/null || true
        sips -z 256 256   "$SOURCE_ICON" --out "$ICONSET_DIR/icon_128x128@2x.png" 2>/dev/null || true
        sips -z 256 256   "$SOURCE_ICON" --out "$ICONSET_DIR/icon_256x256.png" 2>/dev/null || true
        sips -z 512 512   "$SOURCE_ICON" --out "$ICONSET_DIR/icon_256x256@2x.png" 2>/dev/null || true
        sips -z 512 512   "$SOURCE_ICON" --out "$ICONSET_DIR/icon_512x512.png" 2>/dev/null || true
        cp "$SOURCE_ICON" "$ICONSET_DIR/icon_512x512@2x.png"
        
        iconutil -c icns "$ICONSET_DIR" -o "$RESOURCES_DIR/icon.icns"
        rm -rf "$ICONSET_DIR"
        
        print_success "macOS icon (.icns) đã được tạo"
    fi
    
    # Generate Windows icon (.ico)
    if command_exists convert; then
        print_status "Tạo Windows icon (.ico)..."
        convert "$SOURCE_ICON" -resize 256x256 \
               \( -clone 0 -resize 16x16 \) \
               \( -clone 0 -resize 32x32 \) \
               \( -clone 0 -resize 48x48 \) \
               \( -clone 0 -resize 64x64 \) \
               \( -clone 0 -resize 128x128 \) \
               -delete 0 "$RESOURCES_DIR/icon.ico" 2>/dev/null || {
            # Fallback: simple conversion
            convert "$SOURCE_ICON" -resize 256x256 "$RESOURCES_DIR/icon.ico"
        }
        print_success "Windows icon (.ico) đã được tạo"
    elif [ "$OS" = "mac" ] && command_exists sips; then
        # macOS fallback
        sips -s format ico "$SOURCE_ICON" --out "$RESOURCES_DIR/icon.ico" 2>/dev/null || true
    fi
    
    print_success "Icons đã được tạo cho tất cả platforms"
}

# Clean previous builds
clean_build() {
    print_status "Dọn dẹp build cũ..."
    rm -rf dist/
    rm -rf "$BUILD_DIR/"
    print_success "Build cũ đã được xóa"
}

# Build the application
build_app() {
    print_status "Building application..."
    
    # Run the build process
    npm run build
    
    print_success "Application build hoàn tất"
}

# Create distributables
create_distributables() {
    local platform=$1
    
    print_status "Tạo distributables cho platform: $platform"
    
    case $platform in
        "mac"|"darwin")
            npm run dist:mac
            ;;
        "win"|"windows")
            npm run dist:win
            ;;
        "linux")
            npm run dist:linux
            ;;
        "all")
            npm run dist:all
            ;;
        *)
            # Auto-detect current platform
            OS=$(detect_os)
            case $OS in
                "mac")
                    npm run dist:mac
                    ;;
                "linux")
                    npm run dist:linux
                    ;;
                "windows")
                    npm run dist:win
                    ;;
                *)
                    print_warning "Platform không được nhận diện. Build cho tất cả platforms..."
                    npm run dist:all
                    ;;
            esac
            ;;
    esac
}

# Show build results
show_results() {
    print_header "KẾT QUẢ BUILD"
    
    if [ -d "$BUILD_DIR" ]; then
        print_success "Build thành công! Các file đã được tạo:"
        echo ""
        
        find "$BUILD_DIR" -name "*.dmg" -o -name "*.exe" -o -name "*.AppImage" -o -name "*.zip" -o -name "*.tar.gz" | while read -r file; do
            size=$(ls -lh "$file" | awk '{print $5}')
            echo -e "  ${GREEN}📦${NC} $(basename "$file") ${YELLOW}($size)${NC}"
        done
        
        echo ""
        print_status "Đường dẫn build: $(pwd)/$BUILD_DIR"
        
        # Open build directory
        OS=$(detect_os)
        if [ "$OS" = "mac" ]; then
            read -p "Mở thư mục build? (y/n): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                open "$BUILD_DIR"
            fi
        fi
    else
        print_error "Build directory không tồn tại. Build có thể đã thất bại."
    fi
}

# Show help
show_help() {
    echo "HTML File Manager - Build Script"
    echo ""
    echo "Sử dụng: ./build.sh [OPTIONS] [PLATFORM]"
    echo ""
    echo "PLATFORMS:"
    echo "  mac, darwin     - Build cho macOS"
    echo "  win, windows    - Build cho Windows"  
    echo "  linux          - Build cho Linux"
    echo "  all            - Build cho tất cả platforms"
    echo "  (không chỉ định) - Auto-detect platform hiện tại"
    echo ""
    echo "OPTIONS:"
    echo "  -h, --help     - Hiển thị help này"
    echo "  -c, --clean    - Clean build trước khi build"
    echo "  -i, --icons    - Chỉ tạo icons"
    echo "  -b, --build    - Chỉ build source (không tạo distributables)"
    echo ""
    echo "Ví dụ:"
    echo "  ./build.sh                 - Build cho platform hiện tại"
    echo "  ./build.sh mac             - Build cho macOS"
    echo "  ./build.sh all             - Build cho tất cả platforms"
    echo "  ./build.sh --clean mac     - Clean và build cho macOS"
    echo "  ./build.sh --icons         - Chỉ tạo icons"
}

# Main function
main() {
    print_header "HTML FILE MANAGER - BUILD SCRIPT"
    
    local platform=""
    local clean_only=false
    local icons_only=false
    local build_only=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -c|--clean)
                clean_only=true
                shift
                ;;
            -i|--icons)
                icons_only=true
                shift
                ;;
            -b|--build)
                build_only=true
                shift
                ;;
            mac|darwin|win|windows|linux|all)
                platform=$1
                shift
                ;;
            *)
                print_error "Tham số không hợp lệ: $1"
                echo ""
                show_help
                exit 1
                ;;
        esac
    done
    
    # Check dependencies
    check_dependencies
    
    # Icons only mode
    if [ "$icons_only" = true ]; then
        generate_icons
        print_success "Icons đã được tạo xong!"
        exit 0
    fi
    
    # Clean build
    if [ "$clean_only" = true ] || [ "$build_only" = false ]; then
        clean_build
    fi
    
    # Generate icons
    generate_icons
    
    # Build application
    build_app
    
    # Build only mode
    if [ "$build_only" = true ]; then
        print_success "Source build hoàn tất!"
        exit 0
    fi
    
    # Create distributables
    create_distributables "$platform"
    
    # Show results
    show_results
    
    print_success "Build process hoàn tất!"
}

# Run main function with all arguments
main "$@"