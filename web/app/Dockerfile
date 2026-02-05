# Stage 1: Build React app
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json ./
RUN npm install

COPY index.html vite.config.js ./
COPY src ./src

RUN npm run build

# Stage 2: Nginx with built app
FROM nginx:alpine

# Copy built React app from build stage
COPY --from=build /app/dist /usr/share/nginx/html/app

# nginx config is mounted at runtime via docker-compose (nginx-cert-server.conf)
EXPOSE 80
