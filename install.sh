#!/bin/bash
set -e

# ==============================================================================
# vnavhomelab / VNAV-Pi-Server All-in-One Automated Installer
# Supported: Raspberry Pi OS / Debian / Ubuntu (ARM64 & AMD64)
# ==============================================================================

BOLD="\033[1m"
GREEN="\033[0;32m"
CYAN="\033[0;36m"
YELLOW="\033[0;33m"
RESET="\033[0m"

echo -e "${CYAN}${BOLD}"
echo "=========================================================="
echo "      vnavhomelab - Raspberry Pi 5 Control Center        "
echo "             Automated Installation Script                "
echo "=========================================================="
echo -e "${RESET}"

# 1. Check & Install Docker
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}[1/4] Docker not found. Installing official Docker Engine...${RESET}"
    curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
    sudo sh /tmp/get-docker.sh
    rm -f /tmp/get-docker.sh
    echo -e "${GREEN}✓ Docker installed successfully.${RESET}"
else
    echo -e "${GREEN}[1/4] Docker is already installed: $(docker --version)${RESET}"
fi

# Ensure user is in docker group
if ! groups "$USER" | grep -q '\bdocker\b'; then
    echo -e "${YELLOW}Adding $USER to docker group...${RESET}"
    sudo usermod -aG docker "$USER"
fi

# 2. Check & Install Git if missing
if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}[2/4] Installing git...${RESET}"
    sudo apt-get update && sudo apt-get install -y git
fi

# 3. Clone or Update Repository
REPO_DIR="$HOME/VNAV-Pi-Server"
echo -e "${CYAN}[3/4] Preparing repository at ${REPO_DIR}...${RESET}"

if [ -d "$REPO_DIR/.git" ]; then
    echo "Updating existing repository..."
    cd "$REPO_DIR"
    git pull origin main
else
    echo "Cloning repository..."
    git clone https://github.com/NodeNexus/VNAV-Pi-Server.git "$REPO_DIR"
    cd "$REPO_DIR"
fi

# 4. Configure .env if not present
if [ ! -f ".env" ]; then
    echo "Creating .env configuration from template..."
    cp .env.example .env
fi

# 5. Build & Launch Docker Stack
echo -e "${CYAN}[4/4] Building and launching containers...${RESET}"
sudo docker compose up -d --build

# 6. Summary
HOST_IP=$(hostname -I | awk '{print $1}')
echo ""
echo -e "${GREEN}${BOLD}=========================================================="
echo "           DEPLOYMENT COMPLETED SUCCESSFULLY!             "
echo "==========================================================${RESET}"
echo ""
echo -e "Access your dashboard:"
echo -e "  • Local Network: ${CYAN}http://${HOST_IP}:3050${RESET} (or http://vnavhomelab.local:3050)"
echo -e "  • Tailscale:     ${CYAN}http://<your-tailscale-ip>:3050${RESET}"
echo ""
echo -e "Useful Commands:"
echo -e "  • View live logs: ${YELLOW}cd ~/VNAV-Pi-Server && sudo docker compose logs -f${RESET}"
echo -e "  • Check status:   ${YELLOW}cd ~/VNAV-Pi-Server && sudo docker compose ps${RESET}"
echo -e "  • Restart stack:  ${YELLOW}cd ~/VNAV-Pi-Server && sudo docker compose restart${RESET}"
echo ""
