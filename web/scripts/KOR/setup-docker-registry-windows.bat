@echo off
REM Windows용 Docker Registry 설정 스크립트
setlocal EnableDelayedExpansion

echo Docker Registry 설정
echo ====================

docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker를 찾을 수 없습니다. 먼저 Docker를 설치하세요.
    pause
    exit /b 1
)

set REGISTRY_HOST=203.228.107.184
set REGISTRY_PORT=5000
set REGISTRY_URL=%REGISTRY_HOST%:%REGISTRY_PORT%
set REGISTRY_DIR=%USERPROFILE%\docker-registry

mkdir "%REGISTRY_DIR%\certs" 2>nul
mkdir "%REGISTRY_DIR%\scripts" 2>nul

echo 인증서 다운로드 중...
cd /d "%REGISTRY_DIR%\certs"
curl -k -L http://%REGISTRY_HOST%:9000/certs/domain.crt -o domain.crt
if %errorlevel% neq 0 (
    echo 인증서 다운로드 실패!
    pause
    exit /b 1
)

echo 인증서 설치 중...
certlm.msc -import domain.crt -s Root >nul 2>&1 || powershell -Command "Import-Certificate -FilePath './domain.crt' -CertStoreLocation Cert:\CurrentUser\Root" >nul 2>&1

echo Docker daemon 설정 중...
set DAEMON_JSON=%USERPROFILE%\.docker\daemon.json
mkdir "%USERPROFILE%\.docker" 2>nul
if exist "%DAEMON_JSON%" copy "%DAEMON_JSON%" "%DAEMON_JSON%.backup" >nul 2>&1

(
echo {"insecure-registries":["%REGISTRY_URL%"]}
) > "%DAEMON_JSON%"

echo Docker 재시작 중...
taskkill /f /im "Docker Desktop.exe" >nul 2>&1
timeout /t 3 /nobreak >nul
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

set RETRY_COUNT=0
:wait_docker_restart
timeout /t 10 /nobreak >nul
docker info >nul 2>&1
if %errorlevel% equ 0 goto :docker_ready
set /a RETRY_COUNT+=1
if %RETRY_COUNT% lss 20 goto :wait_docker_restart
echo Docker 재시작 대기 시간 초과. 수동으로 확인하세요.

:docker_ready

echo Registry 테스트 중...
docker pull alpine:latest >nul 2>&1
docker tag alpine:latest %REGISTRY_URL%/test:latest >nul 2>&1
docker push %REGISTRY_URL%/test:latest >nul 2>&1

echo 바로가기 생성 중...
cd /d "%REGISTRY_DIR%\scripts"

echo @echo off > test-registry.bat
echo docker pull alpine:latest >> test-registry.bat
echo docker tag alpine:latest %REGISTRY_URL%/test:latest >> test-registry.bat 
echo docker push %REGISTRY_URL%/test:latest >> test-registry.bat
echo pause >> test-registry.bat

set SHORTCUT_PATH=%USERPROFILE%\Desktop\Docker Registry.url
echo [InternetShortcut] > "%SHORTCUT_PATH%"
echo URL=http://%REGISTRY_HOST%:9000 >> "%SHORTCUT_PATH%"

echo.
echo 설정 완료!
echo ===========
echo Registry: https://%REGISTRY_URL%
echo Web UI: http://%REGISTRY_HOST%:9000
echo 설정: %DAEMON_JSON%
echo 테스트: %REGISTRY_DIR%\scripts\test-registry.bat
echo.
pause
