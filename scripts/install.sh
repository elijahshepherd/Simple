#!/bin/bash
# Simple Programming Language - Universal Installer for Linux and macOS
# Usage: curl -fsSL https://raw.githubusercontent.com/elijahshepherd/Simple/main/scripts/install.sh | bash
#        wget -qO- https://raw.githubusercontent.com/elijahshepherd/Simple/main/scripts/install.sh | bash

set -euo pipefail

APP_NAME="Simple Programming Language"
VERSION="1.5.0"
GITHUB_REPO="elijahshepherd/Simple"
INSTALL_DIR="${HOME}/.local/share/simple"
BIN_DIR="${HOME}/.local/bin"
EXAMPLES_DIR="${INSTALL_DIR}/examples"
EXE_NAME="simple"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $*"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $*"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_error() { echo -e "${RED}[ERROR]${NC} $*"; }

# Detect OS and architecture
detect_platform() {
    OS=$(uname -s | tr '[:upper:]' '[:lower:]')
    ARCH=$(uname -m)

    case "$OS" in
        linux)
            PLATFORM="linux"
            ;;
        darwin)
            PLATFORM="macos"
            ;;
        *)
            log_error "Unsupported operating system: $OS"
            exit 1
            ;;
    esac

    case "$ARCH" in
        x86_64|amd64)
            ARCH="x64"
            ;;
        arm64|aarch64)
            ARCH="arm64"
            ;;
        *)
            log_error "Unsupported architecture: $ARCH"
            exit 1
            ;;
    esac

    log_info "Detected platform: $PLATFORM-$ARCH"
}

# Get latest release version from GitHub
get_latest_version() {
    log_info "Fetching latest version..."
    LATEST_VERSION=$(curl -fsSL "https://api.github.com/repos/${GITHUB_REPO}/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/' | sed 's/^v//')
    if [ -z "$LATEST_VERSION" ]; then
        log_warn "Could not fetch latest version, using fallback: $VERSION"
        LATEST_VERSION="$VERSION"
    else
        log_info "Latest version: $LATEST_VERSION"
        VERSION="$LATEST_VERSION"
    fi
}

# Download the binary
download_binary() {
    local download_url="https://github.com/${GITHUB_REPO}/releases/download/v${VERSION}/simple-${PLATFORM}-${ARCH}"
    local temp_file=$(mktemp)

    log_info "Downloading Simple ${VERSION} for ${PLATFORM}-${ARCH}..."
    log_info "URL: $download_url"

    if curl -fsSL -o "$temp_file" "$download_url"; then
        chmod +x "$temp_file"
        echo "$temp_file"
    else
        log_error "Failed to download binary from $download_url"
        log_error "Please check if a release exists for your platform: https://github.com/${GITHUB_REPO}/releases"
        exit 1
    fi
}

# Install the binary
install_binary() {
    local binary_path="$1"

    log_info "Installing to $BIN_DIR/$EXE_NAME..."
    mkdir -p "$BIN_DIR"
    mkdir -p "$EXAMPLES_DIR"

    cp "$binary_path" "$BIN_DIR/$EXE_NAME"
    chmod +x "$BIN_DIR/$EXE_NAME"

    # Copy examples if they exist in the release
    log_info "Installing examples..."
    # Examples would be downloaded separately or bundled
}

# Add to PATH
setup_path() {
    local shell_rc=""
    local path_export="export PATH=\"\$HOME/.local/bin:\$PATH\""

    case "$SHELL" in
        */zsh)
            shell_rc="${HOME}/.zshrc"
            ;;
        */bash)
            shell_rc="${HOME}/.bashrc"
            ;;
        */fish)
            shell_rc="${HOME}/.config/fish/config.fish"
            path_export="set -gx PATH \$HOME/.local/bin \$PATH"
            ;;
        *)
            shell_rc="${HOME}/.profile"
            ;;
    esac

    if [ -f "$shell_rc" ]; then
        if ! grep -q '\.local/bin' "$shell_rc" 2>/dev/null; then
            log_info "Adding $BIN_DIR to PATH in $shell_rc"
            echo "" >> "$shell_rc"
            echo "# Added by Simple installer" >> "$shell_rc"
            echo "$path_export" >> "$shell_rc"
            log_success "Added to PATH. Restart your shell or run: source $shell_rc"
        else
            log_info "PATH already configured in $shell_rc"
        fi
    else
        log_warn "Could not find shell config file ($shell_rc). Please add $BIN_DIR to your PATH manually."
    fi
}

# Verify installation
verify_installation() {
    if command -v "$EXE_NAME" >/dev/null 2>&1; then
        log_success "Simple installed successfully!"
        log_info "Run 'simple --help' to get started"
        log_info "Try: simple run-example hello"
    else
        log_warn "Installation complete but 'simple' command not found in PATH."
        log_warn "You may need to restart your shell or run: export PATH=\"\$HOME/.local/bin:\$PATH\""
        log_warn "Then try: simple --help"
    fi
}

# Main installation flow
main() {
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║     Simple Programming Language Installer v${VERSION}          ║"
    echo "║     https://github.com/${GITHUB_REPO}                        ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""

    detect_platform
    get_latest_version

    binary_path=$(download_binary)
    install_binary "$binary_path"
    setup_path
    verify_installation

    # Cleanup
    rm -f "$binary_path"

    echo ""
    log_success "Installation complete!"
}

main "$@"