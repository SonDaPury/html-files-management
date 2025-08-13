# HTML File Manager - Makefile
# Simple commands to build and manage the application

# Default target
.DEFAULT_GOAL := help

# Variables
APP_NAME := "Trình quản lý tệp HTML"
BUILD_SCRIPT := ./build.sh
NODE_MODULES := node_modules
DIST_DIR := dist
RELEASE_DIR := release

# Error cleanup - simplified approach

# Colors
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

##@ Development Commands

.PHONY: install
install: ## Install dependencies (smart: npm ci if package-lock.json exists, npm install otherwise)
	@echo -e "$(BLUE)📦 Cài đặt dependencies...$(NC)"
	@if [ -f "package-lock.json" ]; then \
		echo -e "$(BLUE)🔒 Sử dụng npm ci (package-lock.json tồn tại)...$(NC)"; \
		npm ci; \
	else \
		echo -e "$(BLUE)📦 Sử dụng npm install (không có package-lock.json)...$(NC)"; \
		npm install; \
	fi
	@echo -e "$(GREEN)✅ Dependencies đã được cài đặt$(NC)"

.PHONY: dev
dev: ## Run development server
	@echo -e "$(BLUE)🚀 Khởi động development server...$(NC)"
	npm run dev

.PHONY: build
build: ## Build source code only
	@echo -e "$(BLUE)🔨 Building source code...$(NC)"
	@npm run build || { echo -e "$(RED)❌ Source build thất bại!$(NC)"; rm -rf $(DIST_DIR) $(RELEASE_DIR) resources/*.iconset 2>/dev/null || true; exit 1; }
	@echo -e "$(GREEN)✅ Source code build hoàn tất$(NC)"

##@ Build Commands

.PHONY: build-app
build-app: ## Build app for current platform with auto icon generation
	@echo -e "$(BLUE)🏗️  Building app cho platform hiện tại...$(NC)"
	@$(BUILD_SCRIPT) || { echo -e "$(RED)❌ Build thất bại!$(NC)"; rm -rf $(DIST_DIR) $(RELEASE_DIR) resources/*.iconset 2>/dev/null || true; exit 1; }

.PHONY: build-mac
build-mac: ## Build app for macOS
	@echo -e "$(BLUE)🍎 Building app cho macOS...$(NC)"
	@$(BUILD_SCRIPT) mac || { echo -e "$(RED)❌ Build thất bại!$(NC)"; rm -rf $(DIST_DIR) $(RELEASE_DIR) resources/*.iconset 2>/dev/null || true; exit 1; }

.PHONY: build-win
build-win: ## Build app for Windows
	@echo -e "$(BLUE)🪟 Building app cho Windows...$(NC)"
	@$(BUILD_SCRIPT) win || { echo -e "$(RED)❌ Build thất bại!$(NC)"; rm -rf $(DIST_DIR) $(RELEASE_DIR) resources/*.iconset 2>/dev/null || true; exit 1; }

.PHONY: build-linux
build-linux: ## Build app for Linux
	@echo -e "$(BLUE)🐧 Building app cho Linux...$(NC)"
	@$(BUILD_SCRIPT) linux || { echo -e "$(RED)❌ Build thất bại!$(NC)"; rm -rf $(DIST_DIR) $(RELEASE_DIR) resources/*.iconset 2>/dev/null || true; exit 1; }

.PHONY: build-all
build-all: ## Build app for all platforms
	@echo -e "$(BLUE)🌍 Building app cho tất cả platforms...$(NC)"
	@$(BUILD_SCRIPT) all || { echo -e "$(RED)❌ Build thất bại!$(NC)"; rm -rf $(DIST_DIR) $(RELEASE_DIR) resources/*.iconset 2>/dev/null || true; exit 1; }

##@ Icon Commands

.PHONY: icons
icons: ## Generate icons only
	@echo -e "$(BLUE)🎨 Tạo icons...$(NC)"
	$(BUILD_SCRIPT) --icons

##@ Utility Commands

.PHONY: clean
clean: ## Clean build artifacts
	@echo -e "$(YELLOW)🧹 Dọn dẹp build artifacts...$(NC)"
	rm -rf $(DIST_DIR)
	rm -rf $(RELEASE_DIR)
	rm -rf resources/*.iconset
	@echo -e "$(GREEN)✅ Build artifacts đã được xóa$(NC)"

.PHONY: clean-all
clean-all: clean ## Clean everything including node_modules
	@echo -e "$(YELLOW)🧹 Dọn dẹp tất cả...$(NC)"
	rm -rf $(NODE_MODULES)
	@echo -e "$(GREEN)✅ Đã xóa tất cả$(NC)"

.PHONY: lint
lint: ## Run linter
	@echo -e "$(BLUE)🔍 Chạy linter...$(NC)"
	npm run lint

.PHONY: test
test: ## Run tests
	@echo -e "$(BLUE)🧪 Chạy tests...$(NC)"
	npm run test

.PHONY: typecheck
typecheck: ## Run TypeScript type checking
	@echo -e "$(BLUE)📝 Kiểm tra types...$(NC)"
	npm run typecheck

##@ Release Commands

.PHONY: release
release: clean build-app ## Full release build (clean + build for current platform)
	@echo -e "$(GREEN)🎉 Release build hoàn tất!$(NC)"
	@if [ -d "$(RELEASE_DIR)" ]; then \
		echo -e "$(BLUE)📦 Files được tạo:$(NC)"; \
		find $(RELEASE_DIR) -name "*.dmg" -o -name "*.exe" -o -name "*.AppImage" -o -name "*.zip" -o -name "*.tar.gz" | while read file; do \
			size=$$(ls -lh "$$file" | awk '{print $$5}'); \
			echo -e "  $(GREEN)📦$(NC) $$(basename "$$file") $(YELLOW)($$size)$(NC)"; \
		done; \
	fi

.PHONY: release-all
release-all: clean build-all ## Full release build for all platforms
	@echo -e "$(GREEN)🎉 Release build cho tất cả platforms hoàn tất!$(NC)"

##@ Information Commands

.PHONY: info
info: ## Show project information
	@echo -e "$(BLUE)📊 Project Information:$(NC)"
	@echo -e "  App Name: $(APP_NAME)"
	@echo -e "  Version: $$(node -p 'require(\"./package.json\").version')"
	@echo -e "  Platform: $$(uname -s)"
	@echo -e "  Node Version: $$(node --version)"
	@echo -e "  NPM Version: $$(npm --version)"
	@echo ""
	@if [ -d "$(DIST_DIR)" ]; then \
		echo -e "$(GREEN)✅$(NC) Source đã được build"; \
	else \
		echo -e "$(RED)❌$(NC) Source chưa được build"; \
	fi
	@if [ -d "$(RELEASE_DIR)" ]; then \
		echo -e "$(GREEN)✅$(NC) Release build tồn tại"; \
	else \
		echo -e "$(RED)❌$(NC) Release build chưa có"; \
	fi

.PHONY: open-release
open-release: ## Open release directory
	@if [ -d "$(RELEASE_DIR)" ]; then \
		echo -e "$(BLUE)📂 Mở thư mục release...$(NC)"; \
		if [ "$$(uname)" = "Darwin" ]; then \
			open $(RELEASE_DIR); \
		elif [ "$$(uname)" = "Linux" ]; then \
			xdg-open $(RELEASE_DIR); \
		else \
			echo -e "$(YELLOW)Thư mục release: $$(pwd)/$(RELEASE_DIR)$(NC)"; \
		fi; \
	else \
		echo -e "$(RED)❌ Release directory chưa tồn tại. Chạy 'make build-app' trước.$(NC)"; \
	fi

##@ Help

.PHONY: help
help: ## Show this help message
	@echo -e "$(BLUE)$(APP_NAME) - Makefile Commands$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)
	@echo ""
	@echo -e "$(YELLOW)Examples:$(NC)"
	@echo -e "  make install     # Cài đặt dependencies"
	@echo -e "  make build-app   # Build app cho platform hiện tại"
	@echo -e "  make build-mac   # Build cho macOS"
	@echo -e "  make release     # Clean build và release"
	@echo -e "  make info        # Hiển thị thông tin project"

# Check if build script is executable
$(BUILD_SCRIPT):
	@if [ ! -x "$(BUILD_SCRIPT)" ]; then \
		echo -e "$(YELLOW)⚠️  Making build script executable...$(NC)"; \
		chmod +x $(BUILD_SCRIPT); \
	fi