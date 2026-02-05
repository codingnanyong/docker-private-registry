# 🐳 Docker Private Registry Web Interface

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Registry-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Docker Compose](https://img.shields.io/badge/Docker%20Compose-supported-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![Nginx](https://img.shields.io/badge/Nginx-Alpine-009639?logo=nginx&logoColor=white)](https://nginx.org/)
[![Registry API](https://img.shields.io/badge/Registry%20API-v2-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/registry/spec/api/)
[![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)

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
- Registry image list and Docker Compose files

### 2. Certificate Download (`/certs`)

Download SSL certificates required to connect to the Registry.

**Download methods:**

```bash
curl http://{REGISTRY_WEB_HOST}:9000/certs/domain.crt -o domain.crt
```

**Or via web browser:**

- Visit `http://{REGISTRY_WEB_HOST}:9000/certs`
- Download the `domain.crt` file

### 3. Script Download (`/scripts`)

Download automation scripts for Docker installation and Registry configuration.

**Available scripts (in `KOR/` or `ENG/` folder):**

- `KOR/install-docker.sh` / `ENG/install-docker.sh` – Docker auto-install (Linux/macOS)
- `KOR/setup-docker-registry.sh` / `ENG/setup-docker-registry.sh` – Registry setup (Linux/macOS)
- `KOR/install-docker-windows.bat` / `ENG/install-docker-windows.bat` – Docker Desktop install (Windows)
- `KOR/setup-docker-registry-windows.bat` / `ENG/setup-docker-registry-windows.bat` – Registry setup (Windows)

**Download methods:**

```bash
# Korean (KOR) or English (ENG) folder
curl http://{REGISTRY_WEB_HOST}:9000/scripts/KOR/install-docker.sh -o install-docker.sh
curl http://{REGISTRY_WEB_HOST}:9000/scripts/KOR/setup-docker-registry.sh -o setup-docker-registry.sh
```

### 4. Document Viewer (`/docs`)

View all Registry-related documentation in the browser.

**Available documents:**

- `DOCKER_BASICS_GUIDE_KR.md` / `DOCKER_BASICS_GUIDE_EN.md` – Docker & Docker Compose basics
- `DOCKER_INSTALL_GUIDE_KR.md` / `DOCKER_INSTALL_GUIDE_EN.md` – Docker installation guide
- `CERT_DOWNLOAD_GUIDE_KR.md` / `CERT_DOWNLOAD_GUIDE_EN.md` – Certificate download guide
- `EXTERNAL_CLIENT_GUIDE_KR.md` / `EXTERNAL_CLIENT_GUIDE_EN.md` – External client configuration guide
- `REGISTRY_USAGE_GUIDE_KR.md` / `REGISTRY_USAGE_GUIDE_EN.md` – Private Registry usage guide ⭐

**Access:**

- `http://{REGISTRY_WEB_HOST}:9000/docs`
- Or click "View All Documentation" on the home page

### 5. Registry Image List (`/registry-list`)

View all Docker images stored in the Registry, choose tags, and download Dockerfiles or copy pull/run commands.

**Features:**

- Image list with tag selector per repository
- Dockerfile download (for selected tag)
- Copy pull/run commands (single line or full block)
- Manual refresh and Garbage Collection hint
- 🗑️ Delete repository (per repo)

**Access:**

- `http://{REGISTRY_WEB_HOST}:9000/registry-list`
- Or click "View Image List" on the home page

**Dockerfile & commands:**

- Use the **Dockerfile** button to download a regenerated `Dockerfile` for the selected tag
- Use the **Commands** button to open a modal with pull/run commands and copy options

### 6. Docker Compose List (`/compose-list`)

Browse and download Docker Compose YAML files served from the server.

**Features:**

- List of `.yml` / `.yaml` compose files
- Search filter
- Download or view file content in a modal
- Copy file content to clipboard

**Access:**

- `http://{REGISTRY_WEB_HOST}:9000/compose-list`
- Or click "Docker Compose Files" on the home page

## 🔧 Tech Stack

- **Web server**: Nginx (Alpine), serving built React app
- **Frontend**: React 18, Vite
- **Routing**: React Router
- **Markdown rendering**: marked (in-app)
- **Registry API**: Docker Registry API v2

## 📁 Directory Structure

```text
registry/
├── config/                     # Configuration files
│   ├── nginx-cert-server.conf  # Nginx config for cert-server
│   └── openssl-san.cnf         # OpenSSL SAN config
├── docs/                       # Markdown documents (served at /docs/)
│   ├── KOR/                    # Korean
│   │   ├── DOCKER_BASICS_GUIDE.md
│   │   ├── DOCKER_INSTALL_GUIDE.md
│   │   ├── CERT_DOWNLOAD_GUIDE.md
│   │   ├── EXTERNAL_CLIENT_GUIDE.md
│   │   └── REGISTRY_USAGE_GUIDE.md
│   └── ENG/                    # English
│       ├── DOCKER_BASICS_GUIDE.md
│       ├── DOCKER_INSTALL_GUIDE.md
│       ├── CERT_DOWNLOAD_GUIDE.md
│       ├── EXTERNAL_CLIENT_GUIDE.md
│       └── REGISTRY_USAGE_GUIDE.md
├── scripts/                    # Scripts (served at /scripts/)
│   ├── KOR/                    # Korean
│   │   ├── install-docker.sh
│   │   ├── setup-docker-registry.sh
│   │   ├── install-docker-windows.bat
│   │   └── setup-docker-registry-windows.bat
│   └── ENG/                    # English
│       ├── install-docker.sh
│       ├── setup-docker-registry.sh
│       ├── install-docker-windows.bat
│       └── setup-docker-registry-windows.bat
├── web/                        # Web application
│   ├── app/                    # React app (Vite build → served as SPA)
│   │   ├── src/
│   │   │   ├── components/     # Layout, etc.
│   │   │   ├── pages/         # Home, Certs, Scripts, DocsViewer, RegistryList, ComposeList
│   │   │   ├── styles/        # Page-specific CSS
│   │   │   ├── utils/         # registry helpers
│   │   │   ├── App.jsx
│   │   │   ├── main.jsx
│   │   │   └── index.css      # Global styles
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   └── Dockerfile         # Multi-stage: build + nginx serve
│   ├── docker/                # Compose YAML files (served at /docker/)
│   │   ├── example-compose.yml
│   │   └── ...
│   └── legacy/                 # Pre-React static files (reference only)
│       ├── html/
│       ├── js/
│       ├── css/
│       └── README.md
├── LICENSE
├── README.md                   # This file
└── docker-compose.yml          # Registry + cert-server
```

## 🚀 Getting Started

### 1. Access the Web Interface

Open the following URL in your browser:

```text
http://{REGISTRY_WEB_HOST}:9000
```

### 2. Download Certificates

1. Click "Browse Certificates Directory" on the home page, or go to `/certs`
2. Download the `domain.crt` file

### 3. Download Scripts

1. Click "Browse Scripts Directory" on the home page, or go to `/scripts`
2. Download the scripts you need (Linux/macOS or Windows)

### 4. View Image List

1. Click "View Image List" on the home page, or go to `/registry-list`
2. Select a tag per repository, then use **Dockerfile** or **Commands** as needed
3. Use the 🗑️ Delete button to remove a repository (then run Garbage Collection on the Registry server if needed)

### 5. Docker Compose Files

1. Click "Docker Compose Files" on the home page, or go to `/compose-list`
2. Search, download, or view compose YAML files

### 6. Registry Usage (Push/Pull) ⭐

**Upload image:**

```bash
# 1. Tag the image
docker tag my-app:latest {REGISTRY_HOST}:5000/my-app:latest

# 2. Push to Registry
docker push {REGISTRY_HOST}:5000/my-app:latest
```

**Download image:**

```bash
docker pull {REGISTRY_HOST}:5000/my-app:latest
```

See [Registry Usage Guide](./docs/REGISTRY_USAGE_GUIDE_KR.md) (Korean) or [REGISTRY_USAGE_GUIDE_EN.md](./docs/REGISTRY_USAGE_GUIDE_EN.md) (English) for detailed instructions.

## 📖 Reading Documentation

1. Click "View All Documentation" on the home page, or go to `/docs`
2. Select the desired document from the dropdown
3. View the document rendered in Markdown format

## 🔗 Related Links

- **Registry URL**: `https://{REGISTRY_HOST}:5000`
- **Web interface**: `http://{REGISTRY_WEB_HOST}:9000`
- **Certificate download**: `http://{REGISTRY_WEB_HOST}:9000/certs/`
- **Script download**: `http://{REGISTRY_WEB_HOST}:9000/scripts/`
- **Image list**: `http://{REGISTRY_WEB_HOST}:9000/registry-list`
- **Compose files**: `http://{REGISTRY_WEB_HOST}:9000/compose-list`
- **Document viewer**: `http://{REGISTRY_WEB_HOST}:9000/docs`

## 🔒 Security

- SSL/TLS certificates are served for download; private key (`domain.key`) is not exposed via the web
- Mounted resources (certs, scripts, docs, docker) are read-only (ro) in the container

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

- [REGISTRY_USAGE_GUIDE_KR.md](./docs/REGISTRY_USAGE_GUIDE_KR.md) / [REGISTRY_USAGE_GUIDE_EN.md](./docs/REGISTRY_USAGE_GUIDE_EN.md) – **Private Registry Usage Guide** ⭐
- [DOCKER_BASICS_GUIDE_KR.md](./docs/DOCKER_BASICS_GUIDE_KR.md) / [DOCKER_BASICS_GUIDE_EN.md](./docs/DOCKER_BASICS_GUIDE_EN.md) – Docker & Docker Compose basics
- [DOCKER_INSTALL_GUIDE_KR.md](./docs/DOCKER_INSTALL_GUIDE_KR.md) / [DOCKER_INSTALL_GUIDE_EN.md](./docs/DOCKER_INSTALL_GUIDE_EN.md) – Docker installation guide
- [EXTERNAL_CLIENT_GUIDE_KR.md](./docs/EXTERNAL_CLIENT_GUIDE_KR.md) / [EXTERNAL_CLIENT_GUIDE_EN.md](./docs/EXTERNAL_CLIENT_GUIDE_EN.md) – External client configuration guide
- [CERT_DOWNLOAD_GUIDE_KR.md](./docs/CERT_DOWNLOAD_GUIDE_KR.md) / [CERT_DOWNLOAD_GUIDE_EN.md](./docs/CERT_DOWNLOAD_GUIDE_EN.md) – Certificate download guide
