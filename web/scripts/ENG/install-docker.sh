#!/bin/bash
# Docker installation script (Ubuntu)
# Installs Docker Engine, CLI, Containerd, Buildx, Compose

set -e

if [ "$EUID" -ne 0 ]; then 
    echo "This script requires sudo."
    echo "   Run: sudo ./install-docker_EN.sh"
    exit 1
fi

echo "Starting Docker installation..."
echo ""

# 1. Remove existing Docker (optional)
if command -v docker &> /dev/null; then
    echo "Docker is already installed."
    read -p "Remove and reinstall? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Removing existing Docker..."
        sudo apt-get remove -y docker docker-engine docker.io containerd runc || true
        sudo apt-get purge -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin || true
        sudo rm -rf /var/lib/docker /var/lib/containerd
        echo "Done."
    else
        echo "Cancelled."
        exit 0
    fi
fi

# 2. Install prerequisites
echo "Installing prerequisites..."
apt-get update
apt-get install -y ca-certificates curl gnupg

# 3. Docker GPG key
echo "Setting up Docker GPG key..."
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

# 4. Docker APT repository
echo "Adding Docker APT repository..."
ARCH=$(dpkg --print-architecture)
UBUNTU_CODENAME=$(. /etc/os-release && echo ${UBUNTU_CODENAME:-$(lsb_release -cs)})
echo "deb [arch=${ARCH} signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${UBUNTU_CODENAME} stable" | \
    tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. Install Docker
echo "Updating package list..."
apt-get update
echo "Installing Docker..."
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 6. Enable and start Docker
echo "Enabling Docker service..."
systemctl enable --now docker

echo ""
echo "Docker installed."
echo ""
docker --version
docker compose version

# 7. Add current user to docker group
if [ -n "$SUDO_USER" ]; then
    ACTUAL_USER="$SUDO_USER"
elif [ -n "$USER" ] && [ "$USER" != "root" ]; then
    ACTUAL_USER="$USER"
else
    ACTUAL_USER=$(logname 2>/dev/null || echo "")
fi

if [ -n "$ACTUAL_USER" ]; then
    echo ""
    echo "Adding user '${ACTUAL_USER}' to docker group..."
    usermod -aG docker "$ACTUAL_USER"
    echo "Apply group change: new terminal, or log out/in, or run: newgrp docker"
fi

# 8. Test
echo ""
echo "Testing Docker..."
if systemctl is-active --quiet docker; then
    if groups | grep -q docker || [ "$EUID" -eq 0 ]; then
        docker run --rm hello-world && echo "Docker test OK." || echo "Test failed (try after newgrp docker)."
    else
        echo "Skipping test. Run in a new terminal: docker run --rm hello-world"
    fi
else
    echo "Docker service is not running."
    exit 1
fi

echo ""
echo "Installation complete."
echo "Next: sudo ./setup-docker-registry_EN.sh (optional), then newgrp docker"
