# 🐳 Docker and Docker Compose Basics

## Overview

This document explains basic Docker and Docker Compose concepts and main commands for beginners.

## Docker basics

### What is Docker?

Docker is a **container-based virtualization platform** that runs applications in isolated environments.

### Key terms

- **Image**: Read-only template used to create containers
- **Container**: Runnable instance created from an image
- **Dockerfile**: Text file with instructions to build an image
- **Registry**: Storage for storing and distributing Docker images

---

## Main Docker commands

### Images

```bash
docker search [image_name]
docker pull [image_name]:[tag]
docker images
docker rmi [image_id_or_name]
docker build -t [image_name]:[tag] .
```

### Containers

```bash
docker run [options] [image_name] [command]
docker ps
docker ps -a
docker stop [container_id_or_name]
docker start [container_id_or_name]
docker rm [container_id_or_name]
docker logs [container_id_or_name]
docker exec -it [container_id_or_name] /bin/bash
```

### Useful run options

```bash
docker run -d [image_name]                    # Run in background
docker run -p [host_port]:[container_port] [image_name]  # Port mapping
docker run -v [host_path]:[container_path] [image_name] # Volume mount
docker run -e [VAR]=[value] [image_name]      # Environment variable
docker run --name [name] [image_name]         # Container name
```

---

## Docker Compose basics

### What is Docker Compose?

Docker Compose defines and runs **multi-container applications** using a YAML file.

### Example docker-compose.yml

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - .:/code
    depends_on:
      - db
    environment:
      - DEBUG=1

  db:
    image: postgres:13
    volumes:
      - postgres_data:/var/lib/postgresql/data/
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password

volumes:
  postgres_data:
```

---

## Docker Compose commands

```bash
docker-compose up -d          # Start in background
docker-compose down           # Stop
docker-compose restart        # Restart
docker-compose ps             # Status
docker-compose logs           # Logs
docker-compose up --build     # Build and start
docker-compose down -v        # Stop and remove volumes
docker-compose exec [service] bash
docker-compose config         # Validate config
```

---

## Tips and best practices

### Dockerfile

1. Use minimal base images (e.g. Alpine)
2. Use multi-stage builds to reduce image size
3. Use `.dockerignore` to exclude unnecessary files
4. Order layers so frequently changed ones are last

### Security

1. Avoid running as root; create a dedicated user
2. Use environment variables or secrets for sensitive data
3. Keep base images updated

### Performance

1. Minimize layers by combining RUN commands
2. Use volumes for persistent data
3. Set resource limits (memory, CPU)

---

## Related docs

- **[DOCKER_INSTALL_GUIDE](DOCKER_INSTALL_GUIDE.md)** – How to install Docker
- **[REGISTRY_USAGE_GUIDE](REGISTRY_USAGE_GUIDE.md)** – Private Registry usage
- **[EXTERNAL_CLIENT_GUIDE](EXTERNAL_CLIENT_GUIDE.md)** – External client setup

For more details, see the [official Docker documentation](https://docs.docker.com/).
