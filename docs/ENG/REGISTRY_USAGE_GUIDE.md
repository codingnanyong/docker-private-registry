# 🐳 Private Docker Registry Usage Guide

This document describes how to push and pull images to and from the Private Docker Registry.

## 📋 Registry information

- **Registry URL**: `https://{REGISTRY_HOST}:5000`
- **Web interface**: `http://{REGISTRY_WEB_HOST}:9000`
- **Protocol**: HTTPS (SSL/TLS certificate required)

## 🔧 Prerequisites

Before using the Registry:

- ✅ **Docker installed**: See [DOCKER_INSTALL_GUIDE](DOCKER_INSTALL_GUIDE.md)
- ✅ **SSL certificate installed**: See [CERT_DOWNLOAD_GUIDE](CERT_DOWNLOAD_GUIDE.md)
- ✅ **External client configured**: See [EXTERNAL_CLIENT_GUIDE](EXTERNAL_CLIENT_GUIDE.md)

### Test Registry connection

```bash
curl -k https://{REGISTRY_HOST}:5000/v2/_catalog
```

Example response:
```json
{"repositories":["nginx","my-app","grafana"]}
```

## 📤 Push images

### Push an existing image

```bash
# 1. Pull the image
docker pull nginx:latest

# 2. Tag for the private registry
docker tag nginx:latest {REGISTRY_HOST}:5000/nginx:latest

# 3. Push
docker push {REGISTRY_HOST}:5000/nginx:latest
```

### Build and push a local app

```bash
# Build with registry tag
docker build -t {REGISTRY_HOST}:5000/my-app:v1.0 .

# Push
docker push {REGISTRY_HOST}:5000/my-app:v1.0
```

### Push multiple tags

```bash
docker tag my-app:latest {REGISTRY_HOST}:5000/my-app:latest
docker tag my-app:latest {REGISTRY_HOST}:5000/my-app:v1.0
docker push {REGISTRY_HOST}:5000/my-app:latest
docker push {REGISTRY_HOST}:5000/my-app:v1.0
```

## 📥 Pull images

```bash
# Pull by tag
docker pull {REGISTRY_HOST}:5000/nginx:latest
docker pull {REGISTRY_HOST}:5000/my-app:v1.0
```

### Run after pull

```bash
docker pull {REGISTRY_HOST}:5000/my-app:latest
docker run -d --name my-container {REGISTRY_HOST}:5000/my-app:latest
```

## 🏷️ Tag management

```bash
# List tags for an image
curl -k https://{REGISTRY_HOST}:5000/v2/my-app/tags/list

# Local images from registry
docker images | grep {REGISTRY_HOST}:5000
```

## 🛠️ Useful commands

### Registry info

```bash
# All repositories
curl -k https://{REGISTRY_HOST}:5000/v2/_catalog

# Tags for an image
curl -k https://{REGISTRY_HOST}:5000/v2/nginx/tags/list
```

### Local cleanup

```bash
docker images | grep {REGISTRY_HOST}:5000
docker system prune -a
```

## 🐞 Troubleshooting

### Push fails

- Ensure the image is tagged correctly: `docker tag my-app:latest {REGISTRY_HOST}:5000/my-app:latest`
- Then: `docker push {REGISTRY_HOST}:5000/my-app:latest`

### Pull fails

- Check catalog: `curl -k https://{REGISTRY_HOST}:5000/v2/_catalog`
- Use the exact image name and tag from the catalog

### SSL or connection issues

- **Certificates**: [CERT_DOWNLOAD_GUIDE](CERT_DOWNLOAD_GUIDE.md)
- **Client setup**: [EXTERNAL_CLIENT_GUIDE](EXTERNAL_CLIENT_GUIDE.md)

## 📚 Related docs

- [CERT_DOWNLOAD_GUIDE](CERT_DOWNLOAD_GUIDE.md) – Certificate download and install
- [EXTERNAL_CLIENT_GUIDE](EXTERNAL_CLIENT_GUIDE.md) – External client setup
- [DOCKER_INSTALL_GUIDE](DOCKER_INSTALL_GUIDE.md) – Docker installation

## 💡 Summary

- **Setup**: Complete the other guides first (Docker, certificate, client).
- **Push**: `docker tag` → `docker push`
- **Pull**: `docker pull {REGISTRY_HOST}:5000/image:tag`
- Use consistent tagging (e.g. by environment or version).

For more details, see the [Docker Registry API](https://docs.docker.com/registry/spec/api/) and [Docker CLI reference](https://docs.docker.com/engine/reference/commandline/docker/).
