#!/bin/bash
# Docker Registry setup script
# Download certificate and update daemon.json

set -e

DAEMON_JSON="/etc/docker/daemon.json"
BACKUP_FILE="/etc/docker/daemon.json.backup.$(date +%Y%m%d_%H%M%S)"
REGISTRY="203.228.107.184:5000"
CERT_URL="http://203.228.107.184:9000/certs/domain.crt"
CERT_DIR="/etc/docker/certs.d/${REGISTRY}"
TEMP_CERT="/tmp/domain.crt"

if [ "$EUID" -ne 0 ]; then 
    echo "This script requires sudo. Run: sudo ./setup-docker-registry_EN.sh"
    exit 1
fi

echo "Configuring Docker Registry: ${REGISTRY}"
echo ""

echo "Downloading certificate..."
if curl -f -s "${CERT_URL}" -o "${TEMP_CERT}"; then
    echo "Certificate saved: ${TEMP_CERT}"
else
    echo "Certificate download failed: ${CERT_URL}"
    exit 1
fi

echo ""
mkdir -p "${CERT_DIR}"
cp "${TEMP_CERT}" "${CERT_DIR}/ca.crt"
chmod 644 "${CERT_DIR}/ca.crt"
rm -f "${TEMP_CERT}"
echo "Certificate installed: ${CERT_DIR}/ca.crt"

if [ -f "$DAEMON_JSON" ]; then
    cp "$DAEMON_JSON" "$BACKUP_FILE"
    echo "Backup: $BACKUP_FILE"
else
    echo "{}" > "$DAEMON_JSON"
fi

echo ""
echo "Updating daemon.json..."

if command -v jq &> /dev/null; then
    if ! jq -e '."insecure-registries"' "$DAEMON_JSON" > /dev/null 2>&1; then
        jq '. + {"insecure-registries": ["'${REGISTRY}'"]}' "$DAEMON_JSON" > "$DAEMON_JSON.tmp"
    else
        if ! jq -e '."insecure-registries"[] | select(. == "'${REGISTRY}'")' "$DAEMON_JSON" > /dev/null 2>&1; then
            jq '."insecure-registries" += ["'${REGISTRY}'"]' "$DAEMON_JSON" > "$DAEMON_JSON.tmp"
        else
            echo "${REGISTRY} already in insecure-registries"
        fi
    fi
    if [ -f "$DAEMON_JSON.tmp" ]; then
        mv "$DAEMON_JSON.tmp" "$DAEMON_JSON"
    fi
else
    echo "jq not found. Add insecure-registries to /etc/docker/daemon.json manually."
    exit 1
fi

echo "daemon.json updated."
cat "$DAEMON_JSON" | jq '.' 2>/dev/null || cat "$DAEMON_JSON"

echo ""
echo "Restarting Docker..."
systemctl restart docker
sleep 3

if systemctl is-active --quiet docker; then
    echo "Docker restarted."
    echo "Usage: docker pull ${REGISTRY}/image:tag  |  docker push ${REGISTRY}/image:tag"
else
    echo "Docker restart failed. Restore: sudo cp $BACKUP_FILE $DAEMON_JSON && sudo systemctl restart docker"
    exit 1
fi

echo ""
echo "Registry setup complete."
