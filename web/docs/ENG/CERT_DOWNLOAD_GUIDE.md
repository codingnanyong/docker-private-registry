# 🐳 Docker Registry Certificate Download Guide

## 🌐 Certificate Download Server

A web server runs alongside the Registry for certificate download.

- **URL**: `http://{REGISTRY_WEB_HOST}:9000/certs/`
- **Certificate download**: `http://{REGISTRY_WEB_HOST}:9000/certs/domain.crt`

## 📥 How to Download the Certificate

### Method 1: Using curl

```bash
# Download certificate
curl http://{REGISTRY_WEB_HOST}:9000/certs/domain.crt -o domain.crt
```

### Method 2: Using wget

```bash
# Download certificate
wget http://{REGISTRY_WEB_HOST}:9000/certs/domain.crt -O domain.crt
```

### Method 3: Web browser

Open the following URL in your browser to download:
```
http://{REGISTRY_WEB_HOST}:9000/certs/domain.crt
```

### Method 4: Browse certificate directory

Open the following URL to see available certificate files:
```
http://{REGISTRY_WEB_HOST}:9000/certs/
```

## 🔒 Security Considerations

### Current setup
- ✅ **domain.crt**: Available for download (public certificate)
- ❌ **domain.key**: Not served (private key, kept secure)

### Private key protection
The `domain.key` file is not exposed via the web server. If you need it, transfer it from the server through a secure channel.

## 🚀 Start the server

```bash
cd /path/to/registry
docker-compose up -d
```

## 📋 Check server status

```bash
# Container status
docker-compose ps

# Logs
docker-compose logs cert-server

# Test certificate download
curl -I http://localhost:9000/certs/domain.crt
```

## 🔧 Change port

To change the cert-server port, edit `docker-compose.yml`:
```yaml
cert-server:
  ports:
    - "DESIRED_PORT:80"  # e.g. "9000:80"
```

## 📝 Usage examples

### Linux: Download and install certificate on client

```bash
# 1. Download certificate
curl http://{REGISTRY_WEB_HOST}:9000/certs/domain.crt -o domain.crt

# 2. Install certificate
sudo cp domain.crt /usr/local/share/ca-certificates/registry.crt
sudo update-ca-certificates

# 3. Restart Docker
sudo systemctl restart docker
```

### Windows: Download and install certificate on client

```powershell
# 1. Download certificate
Invoke-WebRequest -Uri "http://{REGISTRY_WEB_HOST}:9000/certs/domain.crt" -OutFile "domain.crt"

# 2. Install certificate (run as Administrator)
certutil -addstore -f "ROOT" domain.crt
```

## 🌐 External access

To allow external access, open the web server port (e.g. 9000) in the firewall:

```bash
# UFW (Ubuntu)
sudo ufw allow 9000/tcp

# firewalld (CentOS/RHEL)
sudo firewall-cmd --add-port=9000/tcp --permanent
sudo firewall-cmd --reload
```

## ✅ Verification

On the server:
```bash
# Test certificate server
curl http://localhost:9000/certs/domain.crt | head -5
curl -I http://localhost:9000/certs/domain.crt
```

On the client:
```bash
# Test remote download
curl http://{REGISTRY_WEB_HOST}:9000/certs/domain.crt -o /tmp/test.crt
openssl x509 -in /tmp/test.crt -text -noout | head -20
```
