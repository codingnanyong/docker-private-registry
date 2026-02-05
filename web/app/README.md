# ⚛️ Registry Web (React)

React SPA for the Docker Registry resource server. Built with Vite. Served by the cert-server container.

## 🔧 Development (local)

```bash
npm install
npm run dev
```

Open [http://localhost:5173] (API, certs, scripts, docs, and docker endpoints require the real server or a proxy).

## 🐳 Production (Docker)

The cert-server image is built with the React app included; no need to run `npm run build` locally.

```bash
# 📁 From the registry project root
docker compose build cert-server
docker compose up -d cert-server
```

Or run the full stack:

```bash
docker compose up -d --build
```

🔄 After changing React source, rebuild the image:

```bash
docker compose build cert-server && docker compose up -d cert-server
```
