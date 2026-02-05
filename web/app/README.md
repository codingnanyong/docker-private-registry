# Registry Web (React)

React SPA for the Docker Registry resource server. Built with Vite. Served by the cert-server container.

## Development (local)

```bash
npm install
npm run dev
```

Open http://localhost:5173 (API/certs/scripts/docs/docker need the real server or a proxy).

## Production (Docker)

cert-server 이미지는 React 앱을 포함해 빌드됩니다. 로컬에서 npm 빌드할 필요 없음.

```bash
# registry 프로젝트 루트에서
docker compose build cert-server
docker compose up -d cert-server
```

또는 전체 스택:

```bash
docker compose up -d --build
```

React 소스 수정 후 이미지 다시 빌드:

```bash
docker compose build cert-server && docker compose up -d cert-server
```
