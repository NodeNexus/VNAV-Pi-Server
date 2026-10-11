#!/bin/bash
set -e

# ==============================================================================
# vnavhomelab / VNAV-Pi-Server All-in-One Automated Installer & Upgrader
# Supported: Raspberry Pi OS / Debian / Ubuntu (ARM64 & AMD64)
# ==============================================================================

BOLD="\033[1m"
GREEN="\033[0;32m"
CYAN="\033[0;36m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
RESET="\033[0m"

echo -e "${CYAN}${BOLD}"
echo "=========================================================="
echo "      vnavhomelab - Raspberry Pi 5 Control Center        "
echo "             All-in-One Automated Installer               "
echo "=========================================================="
echo -e "${RESET}"

# 1. Ensure basic tools (curl, git) are available
echo -e "${YELLOW}[1/5] Checking system prerequisites (curl, git)...${RESET}"
MISSING_PKGS=""
if ! command -v curl &> /dev/null; then MISSING_PKGS="$MISSING_PKGS curl"; fi
if ! command -v git &> /dev/null; then MISSING_PKGS="$MISSING_PKGS git"; fi

if [ -n "$MISSING_PKGS" ]; then
    echo "Installing missing packages:$MISSING_PKGS..."
    sudo apt-get update && sudo apt-get install -y $MISSING_PKGS
fi
echo -e "${GREEN}✓ Prerequisites ready.${RESET}"

# 2. Check & Install Docker
echo -e "${YELLOW}[2/5] Checking Docker installation...${RESET}"
if ! command -v docker &> /dev/null; then
    echo "Docker not detected. Installing official Docker Engine..."
    curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
    sudo sh /tmp/get-docker.sh
    rm -f /tmp/get-docker.sh
    echo -e "${GREEN}✓ Docker installed.${RESET}"
else
    echo -e "${GREEN}✓ Docker is already installed: $(docker --version)${RESET}"
fi

# Ensure Docker starts automatically on system boot (after power loss)
echo "Ensuring Docker starts automatically on system boot..."
sudo systemctl enable docker
sudo systemctl start docker

# Add user to docker group if needed
if ! groups "$USER" | grep -q '\bdocker\b'; then
    echo "Adding $USER to docker group..."
    sudo usermod -aG docker "$USER"
fi

# 3. Setup / Update Repository Directory
echo -e "${YELLOW}[3/5] Setting up project directory...${RESET}"

# Detect if script is run from inside an existing cloned repo
if [ -d ".git" ] && git remote get-url origin 2>/dev/null | grep -qi "VNAV-Pi-Server"; then
    REPO_DIR="$(pwd)"
    echo "Running from inside existing repository: ${REPO_DIR}"
    echo "Pulling latest changes..."
    git pull origin main
else
    REPO_DIR="$HOME/VNAV-Pi-Server"
    if [ -d "$REPO_DIR/.git" ]; then
        echo "Updating existing clone at ${REPO_DIR}..."
        cd "$REPO_DIR"
        git pull origin main
    else
        echo "Cloning repository to ${REPO_DIR}..."
        git clone https://github.com/NodeNexus/VNAV-Pi-Server.git "$REPO_DIR"
        cd "$REPO_DIR"
    fi
fi

# 4. Configure .env file
echo -e "${YELLOW}[4/5] Checking environment configuration...${RESET}"
if [ ! -f ".env" ]; then
    echo "Creating .env configuration from template..."
    cp .env.example .env
else
    echo -e "${GREEN}✓ Existing .env file preserved.${RESET}"
fi

# 5. Build & Launch Docker Stack
echo -e "${CYAN}[5/5] Building and launching vnavhomelab containers...${RESET}"
sudo docker compose up -d --build

# 6. Gather network details for summary
HOST_IP=$(hostname -I | awk '{print $1}')
TAILSCALE_IP=""
if command -v tailscale &> /dev/null; then
    TAILSCALE_IP=$(tailscale ip -4 2>/dev/null || echo "")
fi

echo ""
echo -e "${GREEN}${BOLD}=========================================================="
echo "           DEPLOYMENT COMPLETED SUCCESSFULLY!             "
echo "==========================================================${RESET}"
echo ""
echo -e "${BOLD}Your Raspberry Pi Dashboard is Live:${RESET}"
echo -e "  • Local Network: ${CYAN}http://${HOST_IP}:3050${RESET} (or http://vnavhomelab.local:3050)"
if [ -n "$TAILSCALE_IP" ]; then
    echo -e "  • Tailscale:     ${CYAN}http://${TAILSCALE_IP}:3050${RESET}"
fi
echo ""
echo -e "${BOLD}Useful Commands:${RESET}"
echo -e "  • View live logs: ${YELLOW}cd ${REPO_DIR} && sudo docker compose logs -f${RESET}"
echo -e "  • Check status:   ${YELLOW}cd ${REPO_DIR} && sudo docker compose ps${RESET}"
echo -e "  • Restart stack:  ${YELLOW}cd ${REPO_DIR} && sudo docker compose restart${RESET}"
echo -e "  • Stop stack:     ${YELLOW}cd ${REPO_DIR} && sudo docker compose down${RESET}"
echo ""
