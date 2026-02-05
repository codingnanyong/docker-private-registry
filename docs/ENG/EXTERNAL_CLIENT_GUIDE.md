# 🌐 External Client Setup Guide

This guide explains how to connect to the Docker Private Registry from an external client.

## 📋 Prerequisites

- Docker installed on the client
- Network access to the Registry server
- Registry certificate file (`domain.crt`)

## 🔐 Registry information

- **Registry URL**: `https://{REGISTRY_HOST}:5000`
- **Certificate download**: `http://{REGISTRY_WEB_HOST}:9000/certs/domain.crt`

## 🐧 Linux client setup

### 1. Check Docker

```bash
docker --version
```

If Docker is not installed, see **[DOCKER_INSTALL_GUIDE](DOCKER_INSTALL_GUIDE.md)**.

### 2. Get the certificate

See **[CERT_DOWNLOAD_GUIDE](CERT_DOWNLOAD_GUIDE.md)** for details. Quick download:

```bash
curl http://{REGISTRY_WEB_HOST}:9000/certs/domain.crt -o domain.crt
```

### 3. Install the certificate

```bash
sudo cp domain.crt /usr/local/share/ca-certificates/registry.crt
sudo update-ca-certificates
```

### 4. Configure Docker daemon

```bash
sudo mkdir -p /etc/docker
sudo nano /etc/docker/daemon.json
```

Add:
```json
{
  "insecure-registries": ["{REGISTRY_HOST}:5000"]
}
```

### 5. Restart Docker

```bash
sudo systemctl restart docker
```

### 6. Test connection

```bash
curl -k https://{REGISTRY_HOST}:5000/v2/_catalog
docker pull {REGISTRY_HOST}:5000/your-image:tag
```

## 🪟 Windows client setup

### 1. Install Docker Desktop

Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/).

### 2. Get the certificate

```powershell
Invoke-WebRequest -Uri "http://{REGISTRY_WEB_HOST}:9000/certs/domain.crt" -OutFile "domain.crt"
```

### 3. Install the certificate

Run PowerShell as Administrator:

```powershell
certutil -addstore -f "ROOT" domain.crt
```

### 4. Docker Desktop settings

1. Open Docker Desktop → Settings → Docker Engine
2. Add to the JSON config:

```json
{
  "insecure-registries": ["{REGISTRY_HOST}:5000"]
}
```

3. Apply & Restart

### 5. Test connection

```cmd
curl -k https://{REGISTRY_HOST}:5000/v2/_catalog
docker pull {REGISTRY_HOST}:5000/your-image:tag
```

## 📦 Using the Registry

### Pull images

```bash
docker pull {REGISTRY_HOST}:5000/{image_name}:{tag}
```

### Push images (if allowed)

```bash
docker tag your-image:latest {REGISTRY_HOST}:5000/your-image:latest
docker push {REGISTRY_HOST}:5000/your-image:latest
```

## 🔧 Troubleshooting

### Certificate errors

```bash
openssl x509 -in domain.crt -text -noout
sudo update-ca-certificates --fresh
```

### Connection refused

```bash
ping {REGISTRY_HOST}
telnet {REGISTRY_HOST} 5000
```

### Docker permission (Linux)

```bash
sudo usermod -aG docker $USER
# then log out and back in or run: newgrp docker
```

## 🔧 Environment variables

Replace placeholders with your values:

- `{REGISTRY_HOST}`: Registry server IP or hostname (e.g. `203.228.107.184`)
- `{REGISTRY_WEB_HOST}`: Web/cert server host (often same as REGISTRY_HOST, port 9000)

For more details, see **[CERT_DOWNLOAD_GUIDE](CERT_DOWNLOAD_GUIDE.md)**.
