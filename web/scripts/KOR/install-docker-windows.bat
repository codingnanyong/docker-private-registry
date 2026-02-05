@echo off
REM Windows용 Docker Desktop 설치 스크립트
setlocal EnableDelayedExpansion

echo Windows Docker Desktop 설치
echo ===========================

net session >nul 2>&1
if %errorlevel% neq 0 (
    echo 오류: 관리자 권한으로 실행하세요!
    pause
    exit /b 1
)

for /f "tokens=4-5 delims=. " %%i in ('ver') do set VERSION=%%i.%%j
if "%VERSION%" lss "10.0" (
    echo 오류: Windows 10 이상 필요!
    pause
    exit /b 1
)

wsl --status >nul 2>&1
if %errorlevel% neq 0 (
    echo WSL2 설치 중...
    dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
    dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
    echo WSL2 설치됨. 재부팅 필요!
    pause
    shutdown /r /t 10
    exit /b 0
)

wsl --set-default-version 2 >nul 2>&1

docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Docker가 이미 설치되어 있습니다.
    docker --version
    goto :setup_registry
)

set TEMP_DIR=%TEMP%\docker-install
mkdir "%TEMP_DIR%" 2>nul
cd /d "%TEMP_DIR%"

echo Docker Desktop 다운로드 중...
curl -L "https://desktop.docker.com/win/main/amd64/Docker%%20Desktop%%20Installer.exe" -o "DockerDesktopInstaller.exe"
if %errorlevel% neq 0 (
    echo 다운로드 실패! 인터넷 연결을 확인하세요.
    pause
    exit /b 1
)

echo Docker Desktop 설치 중...
start /wait "" "DockerDesktopInstaller.exe" install --quiet
if %errorlevel% neq 0 (
    echo 설치 실패!
    pause
    exit /b 1
)

cd /d %~dp0
rmdir /s /q "%TEMP_DIR%" 2>nul

echo Docker Desktop 시작 중...
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

set RETRY_COUNT=0
:wait_docker
timeout /t 10 /nobreak >nul
docker --version >nul 2>&1
if %errorlevel% equ 0 goto :docker_ready
set /a RETRY_COUNT+=1
if %RETRY_COUNT% lss 30 goto :wait_docker

echo Docker 시작 대기 시간 초과. 수동 확인하세요.
pause
exit /b 1

:docker_ready
echo Docker 준비됨!

:setup_registry
echo Registry 설정
echo =============

set REGISTRY_DIR=%USERPROFILE%\docker-registry
mkdir "%REGISTRY_DIR%\certs" 2>nul

echo 인증서 다운로드 중...
cd /d "%REGISTRY_DIR%\certs"
curl -k https://203.228.107.184:9000/certs/domain.crt -o domain.crt
if %errorlevel% neq 0 (
    echo 인증서 다운로드 실패!
    pause
    exit /b 1
)

echo 인증서 설치 중...
certlm.msc -import domain.crt -s Root >nul 2>&1

echo Docker 테스트...
docker run hello-world >nul 2>&1

echo Registry 테스트...
docker pull alpine:latest >nul 2>&1
docker tag alpine:latest 203.228.107.184:5000/test-image:latest >nul 2>&1
docker push 203.228.107.184:5000/test-image:latest >nul 2>&1

echo.
echo 설치 완료!
echo ==========
echo Registry: https://203.228.107.184:5000
echo Web UI: http://203.228.107.184:9000
echo 인증서: %REGISTRY_DIR%\certs\domain.crt
echo.
pause
