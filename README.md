# 🐳 Docker Private Registry Web Interface

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Registry-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Docker Compose](https://img.shields.io/badge/Docker%20Compose-supported-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![Nginx](https://img.shields.io/badge/Nginx-Alpine-009639?logo=nginx&logoColor=white)](https://nginx.org/)
[![Registry API](https://img.shields.io/badge/Registry%20API-v2-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/registry/spec/api/)

This document describes the Docker Private Registry web interface.

## 📋 Overview

This web interface is a web-based tool that makes it easy to manage and use Docker Private Registry.

**Access URL**: `http://{REGISTRY_WEB_HOST}:9000` (replace with your actual host when deploying)

## 🌐 Key Features

### 1. Home Page (`/`)

The main page of the Registry resource download server.

**Features:**

- SSL/TLS certificate download
- Install and setup script download
- Document viewer access
- Registry image list view

### 2. Certificate Download (`/certs/`)

Download SSL certificates required to connect to the Registry.

**Download methods:**

```bash
curl http://{REGISTRY_WEB_HOST}:9000/certs/domain.crt -o domain.crt
```

**Or via web browser:**

- Visit `http://{REGISTRY_WEB_HOST}:9000/certs/`
- Download the `domain.crt` file

### 3. Script Download (`/scripts/`)

Download automation scripts for Docker installation and Registry configuration.

**Available scripts:**

- `install-docker.sh` - Docker auto-install script
- `setup-docker-registry.sh` - Registry setup script

**Download methods:**

```bash
curl http://{REGISTRY_WEB_HOST}:9000/scripts/install-docker.sh -o install-docker.sh
curl http://{REGISTRY_WEB_HOST}:9000/scripts/setup-docker-registry.sh -o setup-docker-registry.sh
```

### 4. Document Viewer (`/docs-viewer.html`)

View all Registry-related documentation in the browser.

**Available documents:**

- `README.md` - Main guide
- `REGISTRY_USAGE_GUIDE.md` - Private Registry usage guide ⭐
- `DOCKER_INSTALL_GUIDE.md` - Docker installation guide
- `EXTERNAL_CLIENT_GUIDE.md` - External client configuration guide
- `CERT_DOWNLOAD_GUIDE.md` - Certificate download guide

**Access:**

- `http://{REGISTRY_WEB_HOST}:9000/docs-viewer.html`
- Or click the "View All Documentation" button on the home page

### 5. Registry Image List (`/registry-list`)

View all Docker images stored in the Registry and download Dockerfiles.

**Features:**

- Image list query
- Dockerfile download on image click
- Image information view
- Auto-refresh (every 30 seconds)
- Manual refresh button
- Real-time refresh status display

**Access:**

- `http://{REGISTRY_WEB_HOST}:9000/registry-list`
- Or click the "View Image List" button on the home page

**Auto-refresh:**

- Toggle switch in the top-right corner to enable/disable auto-refresh
- Default: ON (auto-refresh every 30 seconds)
- Clicking the manual refresh button automatically turns it OFF

**Dockerfile download:**

- Click an image card or the "Download Dockerfile" button
- Filename: `Dockerfile` (no extension)
- Regenerated Dockerfile is downloaded to your browser

## 🔧 Tech Stack

- **Web server**: Nginx (Alpine)
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Markdown rendering**: Marked.js (CDN)
- **Registry API**: Docker Registry API v2

## 📁 Directory Structure

```text
registry/
├── config/                 # Configuration files
│   ├── nginx-cert-server.conf  # Nginx config
│   └── openssl-san.cnf        # OpenSSL config
├── docs/                   # Documents
│   ├── DOCKER_INSTALL_GUIDE.md
│   ├── EXTERNAL_CLIENT_GUIDE.md
│   └── CERT_DOWNLOAD_GUIDE.md
├── scripts/                # Scripts
│   ├── install-docker.sh
│   └── setup-docker-registry.sh
├── web/                    # Web files
│   ├── css/                   # Stylesheets
│   │   ├── common.css            # Common styles
│   │   ├── registry-list.css     # Image list page styles
│   │   ├── docs-viewer.css       # Document viewer styles
│   │   ├── certs-index.css       # Certificate page styles
│   │   └── scripts-index.css     # Script page styles
│   ├── js/                    # JavaScript files
│   │   ├── common.js             # Common JavaScript
│   │   ├── index.js              # Home page JavaScript
│   │   ├── registry-list.js      # Image list page JavaScript
│   │   └── docs-viewer.js        # Document viewer JavaScript
│   ├── index.html             # Home page
│   ├── registry-list.html     # Image list page
│   ├── docs-viewer.html       # Document viewer
│   ├── certs-index.html       # Certificate list page
│   └── scripts-index.html     # Script list page
├── LICENSE                 # License file
├── README.md              # Web interface description (this file)
└── docker-compose.yml      # Docker Compose config
```

## 🚀 Getting Started

### 1. Access the Web Interface

Open the following URL in your browser:

```text
http://{REGISTRY_WEB_HOST}:9000
```

### 2. Download Certificates

1. Click "Browse Certificates Directory" on the home page
2. Or visit the `/certs/` path directly
3. Download the `domain.crt` file

### 3. Download Scripts

1. Click "Browse Scripts Directory" on the home page
2. Or visit the `/scripts/` path directly
3. Download the scripts you need

### 4. View Image List

1. Click "View Image List" on the home page
2. View the list of images stored in the Registry
3. Click an image to download its Dockerfile
4. Use the 🗑️ Delete button to remove unnecessary images

### 5. Registry Usage (Push/Pull) ⭐

**Upload image:**

```bash
# 1. Tag the image
docker tag my-app:latest {REGISTRY_HOST}:5000/my-app:latest

# 2. Push to Registry
docker push {REGISTRY_HOST}:5000/my-app:latest
```

**Download image:**

```bash
# Pull image from Registry
docker pull {REGISTRY_HOST}:5000/my-app:latest
```

See [Registry Usage Guide](./docs/REGISTRY_USAGE_GUIDE.md) for detailed instructions.

## 📖 Reading Documentation

1. Click "View All Documentation" on the home page
2. Select the desired document from the dropdown
3. View the document rendered in Markdown format

## 🔗 Related Links

- **Registry URL**: `https://{REGISTRY_HOST}:5000`
- **Web interface**: `http://{REGISTRY_WEB_HOST}:9000`
- **Certificate download**: `http://{REGISTRY_WEB_HOST}:9000/certs/`
- **Script download**: `http://{REGISTRY_WEB_HOST}:9000/scripts/`
- **Image list**: `http://{REGISTRY_WEB_HOST}:9000/registry-list`
- **Document viewer**: `http://{REGISTRY_WEB_HOST}:9000/docs-viewer.html`

## 🔒 Security

- SSL/TLS certificates are served securely over HTTPS
- Private key (`domain.key`) is not exposed via the web
- All resources are mounted read-only (ro)

## 🛠️ Troubleshooting

### Page fails to load

```bash
# Check container status
docker ps | grep registry-cert-server

# Restart container
docker restart registry-cert-server

# View logs
docker logs registry-cert-server
```

### API requests fail

```bash
# Check Registry service status
docker ps | grep registry

# Verify network connectivity
docker network inspect storage_network
```

## 📚 Additional Documentation

- [REGISTRY_USAGE_GUIDE.md](./docs/REGISTRY_USAGE_GUIDE.md) - **Private Registry Usage Guide** ⭐
- [DOCKER_INSTALL_GUIDE.md](./docs/DOCKER_INSTALL_GUIDE.md) - Docker installation guide
- [EXTERNAL_CLIENT_GUIDE.md](./docs/EXTERNAL_CLIENT_GUIDE.md) - External client configuration guide
- [CERT_DOWNLOAD_GUIDE.md](./docs/CERT_DOWNLOAD_GUIDE.md) - Certificate download guide
