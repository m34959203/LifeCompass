#!/usr/bin/env bash
# ============================================================
# LifeCompass Uni — Deploy to hoster.kz
# Domain: lifecompass.zhezu.kz
# ============================================================
#
# Prerequisites:
#   1. Node.js >= 18, npm installed
#   2. .env file with GEMINI_API_KEY (optional — app works without it)
#   3. lftp installed (for FTP upload): sudo apt install lftp / brew install lftp
#
# Usage:
#   ./deploy.sh                  # Build only (output in dist/)
#   ./deploy.sh --upload         # Build + FTP upload to hoster.kz
#
# FTP credentials (set via environment variables or .env.deploy):
#   FTP_HOST=ftp.zhezu.kz        (or hoster.kz FTP address)
#   FTP_USER=your_ftp_login
#   FTP_PASS=your_ftp_password
#   FTP_DIR=/httpdocs             (Plesk default, or /lifecompass.zhezu.kz)
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}═══════════════════════════════════════════${NC}"
echo -e "${CYAN}  LifeCompass Uni — Production Build${NC}"
echo -e "${CYAN}  Domain: lifecompass.zhezu.kz${NC}"
echo -e "${CYAN}═══════════════════════════════════════════${NC}"

# Step 1: Check dependencies
echo -e "\n${YELLOW}[1/4]${NC} Checking dependencies..."
if [ ! -d "node_modules" ]; then
  echo "  Installing npm packages..."
  npm install --silent
fi
echo -e "  ${GREEN}✓${NC} Dependencies ready"

# Step 2: Check .env
echo -e "\n${YELLOW}[2/4]${NC} Checking environment..."
if [ -f ".env" ] && grep -q "GEMINI_API_KEY" .env; then
  echo -e "  ${GREEN}✓${NC} GEMINI_API_KEY found — AI features will be enabled"
else
  echo -e "  ${YELLOW}⚠${NC} No .env or GEMINI_API_KEY — app will work without AI chat"
  echo -e "  ${YELLOW}  ${NC} Copy .env.example → .env and add your key to enable AI"
fi

# Step 3: Build
echo -e "\n${YELLOW}[3/4]${NC} Building for production..."
npx vite build 2>&1

DIST_SIZE=$(du -sh dist/ 2>/dev/null | cut -f1)
echo -e "\n  ${GREEN}✓${NC} Build complete: dist/ (${DIST_SIZE})"

# Step 4: Upload (optional)
if [[ "${1:-}" == "--upload" ]]; then
  echo -e "\n${YELLOW}[4/4]${NC} Uploading to hoster.kz via FTP..."

  # Load FTP credentials
  if [ -f ".env.deploy" ]; then
    source .env.deploy
  fi

  FTP_HOST="${FTP_HOST:-}"
  FTP_USER="${FTP_USER:-}"
  FTP_PASS="${FTP_PASS:-}"
  FTP_DIR="${FTP_DIR:-/httpdocs}"

  if [ -z "$FTP_HOST" ] || [ -z "$FTP_USER" ] || [ -z "$FTP_PASS" ]; then
    echo -e "  ${RED}✗${NC} FTP credentials missing!"
    echo ""
    echo "  Create .env.deploy with:"
    echo "    FTP_HOST=ftp.zhezu.kz"
    echo "    FTP_USER=your_login"
    echo "    FTP_PASS=your_password"
    echo "    FTP_DIR=/httpdocs"
    echo ""
    echo "  Or set environment variables before running."
    exit 1
  fi

  if ! command -v lftp &>/dev/null; then
    echo -e "  ${RED}✗${NC} lftp not found. Install: sudo apt install lftp"
    exit 1
  fi

  echo "  Uploading dist/ → ${FTP_HOST}:${FTP_DIR}..."
  lftp -c "
    set ssl:verify-certificate no;
    open -u ${FTP_USER},${FTP_PASS} ${FTP_HOST};
    mirror --reverse --delete --verbose dist/ ${FTP_DIR}/;
    quit
  "

  echo -e "\n  ${GREEN}✓${NC} Upload complete!"
  echo -e "  ${GREEN}✓${NC} Site live at: ${CYAN}https://lifecompass.zhezu.kz${NC}"
else
  echo -e "\n${YELLOW}[4/4]${NC} Skipping upload (use --upload to deploy via FTP)"
  echo ""
  echo -e "  ${CYAN}Ready to deploy!${NC} Upload dist/ contents to hoster.kz:"
  echo ""
  echo "  Option A: Run ./deploy.sh --upload (requires lftp + .env.deploy)"
  echo "  Option B: Plesk File Manager → upload dist/* to httpdocs/"
  echo "  Option C: FTP client (FileZilla) → upload dist/* to /"
fi

echo -e "\n${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}  Done!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
