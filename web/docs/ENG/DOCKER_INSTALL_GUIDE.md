# 🐳 Docker Installation Guide

This document describes how to install Docker and Docker Compose.

## 📋 Prerequisites

- Linux, Windows, or macOS
- Administrator privileges (sudo or root)
- Internet connection

## 🐧 Linux installation

### Method 1: Automated install script (recommended)

Use the script provided by the Registry web server:

```bash
# Download script (Korean: KOR folder, English: ENG folder)
curl http://{REGISTRY_WEB_HOST}:9000/scripts/ENG/install-docker.sh -o install-docker.sh

# Make executable
chmod +x install-docker.sh

# Run
sudo ./install-docker.sh
```

The script will:
- Remove existing Docker (optional)
- Install required packages
- Add Docker’s official repository
- Install Docker Engine, CLI, Containerd, Buildx, and Compose
- Start Docker and enable it at boot
- Add the current user to the `docker` group

### Method 2: Official Docker repository

#### Ubuntu/Debian

```bash
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg lsb-release
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

Log out and back in (or run `newgrp docker`) after adding your user to the `docker` group.

#### CentOS/RHEL

```bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

### Method 3: Ubuntu default repository (simpler, may be older)

```bash
sudo apt update
sudo apt install docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

## 🪟 Windows installation

1. Download [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
2. Run the installer and complete setup
3. Start Docker Desktop and reboot if prompted

**Requirements**: Windows 10/11 64-bit, WSL 2 enabled, virtualization enabled in BIOS.

**Verify**:
```powershell
docker --version
docker compose version
docker run hello-world
```

## 🍎 macOS installation

1. Download [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop) (Intel or Apple Silicon)
2. Run the installer and open Docker Desktop

**Requirements**: macOS 10.15+, 4GB RAM minimum.

**Verify**:
```bash
docker --version
docker compose version
docker run hello-world
```

## ✅ Verify installation

```bash
docker --version
docker compose version
sudo systemctl status docker   # Linux
docker run hello-world
```

## 🔧 Troubleshooting

### Permission denied (Linux)

```bash
sudo usermod -aG docker $USER
newgrp docker
```

### Docker service not starting (Linux)

```bash
sudo systemctl status docker
sudo systemctl restart docker
sudo journalctl -u docker
```

### Windows WSL 2 issues

1. Enable “Windows Subsystem for Linux” and install [WSL 2 kernel update](https://aka.ms/wsl2kernel)
2. In PowerShell: `wsl --set-default-version 2`

## 📚 Additional resources

- [Docker official documentation](https://docs.docker.com/)
- [Docker Compose documentation](https://docs.docker.com/compose/)
- [Get Docker](https://docs.docker.com/get-docker/)
