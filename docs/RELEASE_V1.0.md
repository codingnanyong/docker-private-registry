# 🐳 Docker Private Registry Web Interface — v1.0

First stable release of the Docker Private Registry web interface.

---

## ✨ Highlights

- **Web UI** for managing and using your private Docker Registry (Registry API v2)
- **Certificate download** — SSL/TLS certs for client trust (`/certs`)
- **Scripts** — Docker install & Registry setup for Linux/macOS and Windows (KOR/ENG)
- **Documentation viewer** — In-browser Markdown docs (Docker basics, install, cert, external client, registry usage)
- **Registry image list** — Browse repos/tags, download Dockerfile, copy pull/run commands, delete repository
- **Docker Compose list** — Browse and download compose YAML files

---

## 🛠 Tech Stack

- **Registry**: Docker Registry 2
- **Web server**: Nginx (Alpine), serving React SPA
- **Frontend**: React 18, Vite, React Router
- **Orchestration**: Docker Compose

---

## 📦 How to use this release

```bash
git clone https://github.com/codingnanyong/docker-private-registry.git
cd docker-private-registry
git checkout v1.0

# Ensure Docker network exists (e.g. docker network create storage_network)
docker compose up -d --build
```

- **Registry**: `https://<REGISTRY_HOST>:5000`
- **Web interface**: `http://<REGISTRY_WEB_HOST>:9000`

See [README](https://github.com/codingnanyong/docker-private-registry/blob/v1.0/README.md) for certificate setup, scripts, and usage.

---

## 📋 Assets (optional)

Attach pre-built images or install scripts to this release if you provide them (e.g. `registry-cert-server-v1.0.tar`).

---

**Full Changelog**: https://github.com/codingnanyong/docker-private-registry/compare/pre-v1.0...v1.0
