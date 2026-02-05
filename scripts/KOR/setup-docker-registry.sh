#!/bin/bash
# Docker Registry 설정 스크립트
# 인증서 다운로드 + daemon.json 업데이트

set -e

DAEMON_JSON="/etc/docker/daemon.json"
BACKUP_FILE="/etc/docker/daemon.json.backup.$(date +%Y%m%d_%H%M%S)"
REGISTRY="203.228.107.184:5000"
CERT_URL="http://203.228.107.184:9000/certs/domain.crt"
CERT_DIR="/etc/docker/certs.d/${REGISTRY}"
TEMP_CERT="/tmp/domain.crt"

if [ "$EUID" -ne 0 ]; then 
    echo "❌ 이 스크립트는 sudo 권한이 필요합니다"
    echo "   실행: sudo ./setup-docker-registry_KR.sh"
    exit 1
fi

echo "🔧 Docker Registry 설정 중..."
echo "Registry: ${REGISTRY}"
echo ""

echo "📥 인증서 다운로드 중..."
if curl -f -s "${CERT_URL}" -o "${TEMP_CERT}"; then
    echo "✅ 인증서 다운로드 완료: ${TEMP_CERT}"
else
    echo "❌ 인증서 다운로드 실패: ${CERT_URL}"
    exit 1
fi

echo ""
echo "📁 인증서 디렉토리 설정 중..."
mkdir -p "${CERT_DIR}"
cp "${TEMP_CERT}" "${CERT_DIR}/ca.crt"
chmod 644 "${CERT_DIR}/ca.crt"
rm -f "${TEMP_CERT}"
echo "✅ 인증서 설정 완료: ${CERT_DIR}/ca.crt"

if [ -f "$DAEMON_JSON" ]; then
    cp "$DAEMON_JSON" "$BACKUP_FILE"
    echo "✅ 백업 생성: $BACKUP_FILE"
else
    echo "{}" > "$DAEMON_JSON"
fi

echo ""
echo "🔧 Docker daemon.json 업데이트 중..."

if command -v jq &> /dev/null; then
    if ! jq -e '."insecure-registries"' "$DAEMON_JSON" > /dev/null 2>&1; then
        jq '. + {"insecure-registries": ["'${REGISTRY}'"]}' "$DAEMON_JSON" > "$DAEMON_JSON.tmp"
    else
        if ! jq -e '."insecure-registries"[] | select(. == "'${REGISTRY}'")' "$DAEMON_JSON" > /dev/null 2>&1; then
            jq '."insecure-registries" += ["'${REGISTRY}'"]' "$DAEMON_JSON" > "$DAEMON_JSON.tmp"
        else
            echo "✅ ${REGISTRY}가 이미 insecure-registries에 등록되어 있습니다"
        fi
    fi
    if [ -f "$DAEMON_JSON.tmp" ]; then
        mv "$DAEMON_JSON.tmp" "$DAEMON_JSON"
    fi
else
    echo "⚠️  jq가 설치되어 있지 않습니다. /etc/docker/daemon.json에 insecure-registries를 수동 추가하세요."
    exit 1
fi

echo "✅ daemon.json 업데이트 완료"
cat "$DAEMON_JSON" | jq '.' 2>/dev/null || cat "$DAEMON_JSON"

echo ""
echo "🔄 Docker daemon 재시작 중..."
systemctl restart docker
sleep 3

if systemctl is-active --quiet docker; then
    echo "✅ Docker daemon 재시작 완료"
    echo ""
    echo "💡 사용 방법:"
    echo "   docker pull ${REGISTRY}/이미지명:태그"
    echo "   docker tag 로컬이미지 ${REGISTRY}/이미지명:태그"
    echo "   docker push ${REGISTRY}/이미지명:태그"
else
    echo "❌ Docker daemon 재시작 실패. 복원: sudo cp $BACKUP_FILE $DAEMON_JSON && sudo systemctl restart docker"
    exit 1
fi

echo ""
echo "✅ Registry 설정 완료!"
