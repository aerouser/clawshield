#!/bin/bash
#
# ClawShield Installer
# One-liner installation: curl -fsSL https://clawshield.dev/install.sh | bash
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/aerouser/clawshield"
INSTALL_DIR="/usr/local/bin"
TEMP_DIR=$(mktemp -d)

# Detect OS
OS=$(uname -s)
ARCH=$(uname -m)

echo -e "${BLUE}🛡️  ClawShield Installer${NC}"
echo ""

# Check if running as root (warn but allow)
if [ "$EUID" -eq 0 ]; then
  echo -e "${YELLOW}⚠️  Warning: Running as root${NC}"
  echo "   ClawShield will activate Root Safety Mode for enhanced protection."
  echo ""
fi

# Check dependencies
echo -e "${BLUE}Checking dependencies...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is required but not installed.${NC}"
    echo ""
    echo "Install Node.js:"
    echo "  macOS:   brew install node"
    echo "  Ubuntu:  sudo apt install nodejs npm"
    echo "  CentOS:  sudo yum install nodejs npm"
    echo "  Windows: https://nodejs.org/"
    echo ""
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git is required but not installed.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${YELLOW}⚠️  Node.js 18+ recommended (you have $(node -v))${NC}"
    echo ""
fi

echo -e "${GREEN}✅ Dependencies OK${NC}"
echo ""

# Clone repository
echo -e "${BLUE}Downloading ClawShield...${NC}"
cd "$TEMP_DIR"

if git clone --depth 1 "$REPO_URL.git" clawshield 2>/dev/null; then
    echo -e "${GREEN}✅ Downloaded${NC}"
else
    echo -e "${YELLOW}⚠️  Could not clone repository. Trying alternative method...${NC}"
    # Fallback: download zip
    if command -v curl &> /dev/null; then
        curl -fsSL "${REPO_URL}/archive/refs/heads/main.zip" -o clawshield.zip
        unzip -q clawshield.zip
        mv clawshield-main clawshield
    elif command -v wget &> /dev/null; then
        wget -q "${REPO_URL}/archive/refs/heads/main.zip" -O clawshield.zip
        unzip -q clawshield.zip
        mv clawshield-main clawshield
    else
        echo -e "${RED}❌ Failed to download. Please install manually:${NC}"
        echo "   git clone $REPO_URL"
        exit 1
    fi
fi

cd clawshield
echo ""

# Install
echo -e "${BLUE}Installing...${NC}"

# Check if we can write to INSTALL_DIR
if [ -w "$INSTALL_DIR" ] || [ "$EUID" -eq 0 ]; then
    npm install -g . --silent
else
    echo -e "${YELLOW}⚠️  Need sudo access to install globally${NC}"
    sudo npm install -g . --silent
fi

echo -e "${GREEN}✅ Installed${NC}"
echo ""

# Verify installation
echo -e "${BLUE}Verifying installation...${NC}"
if command -v clawshield &> /dev/null; then
    VERSION=$(clawshield version 2>&1 | head -1)
    echo -e "${GREEN}✅ $VERSION installed successfully!${NC}"
else
    echo -e "${RED}❌ Installation verification failed${NC}"
    exit 1
fi

echo ""

# Cleanup
rm -rf "$TEMP_DIR"

# Success message
echo -e "${GREEN}🎉 Installation complete!${NC}"
echo ""
echo "Get started:"
echo ""
echo "  # Scan a skill"
echo -e "  ${YELLOW}clawshield scan ./path/to/skill${NC}"
echo ""
echo "  # Show help"
echo -e "  ${YELLOW}clawshield help${NC}"
echo ""
echo "  # Try with test fixtures"
echo -e "  ${YELLOW}clawshield scan ./tests/fixtures/trigger-exfil-endpoint${NC}"
echo ""
echo "  # Sign up for Cloud (optional)"
echo -e "  ${YELLOW}https://clawshield.dev/dashboard${NC}"
echo ""
echo "─────────────────────────────────────"
echo "Security first. Always scan before installing. 🛡️"
echo ""
