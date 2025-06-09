<p align="center">
  <a href="https://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  </a>
</p>

# NestJS YouTube Clone

> A full-featured backend project built with **NestJS** and Docker, replicating the core logic of a YouTube-style platform.

---

## 🐳 Docker Setup for Development & Production

This project uses **multi-stage Docker builds** and `docker-compose` to manage both development (`nestjs-dev`) and production (`nestjs-runtime`) environments. It also includes essential services:

- ✅ PostgreSQL
- ✅ Redis
- ✅ Elasticsearch + Kibana
- ✅ RabbitMQ

---

## 🧱 Project Structure

```bash
.
├── Dockerfile                      # Multi-stage build: builder → dev → runtime
├── docker-compose.yml             # Core services (Postgres, Redis, etc.)
├── docker-compose.dev.yml         # Dev service: nestjs-dev (hot reload)
├── docker-compose.dev.yml    # Overrides for local dev (mount local node_modules)
├── docker-compose.production.yml  # Runtime-only service for production
├── .env.development               # Dev environment variables
├── .env.production                # Production environment variables
└── src/                           # Your NestJS app source code
```

---

## 🚀 Getting Started (Development)

### ✅ First-time setup

```bash
docker-compose -f docker-compose.yml build dev
```

### ▶️ Run NestJS in Dev Mode (with hot reload)

```bash
docker-compose -f docker-compose.yml up dev
```

- Dev API available at: [http://localhost:3002](http://localhost:3002)
- Uses `ts-node-dev` and hot reload
- Mounted source: `.:/app`
- Uses local `./node_modules` for faster install & easier reset

### ⏹ Stop services

Stop all services:

```bash
docker-compose down
```

Stop only NestJS dev:

```bash
docker-compose stop nestjs-dev
```

### 🔄 Reload env vars if `.env.development` changed

```bash
docker-compose stop nestjs-dev
docker-compose up dev
```

---

## 🏗 Running in Production (Optional)

### 🛠 Build and run runtime container

```bash
docker-compose -f docker-compose.yml -f docker-compose.production.yml build runtime
docker-compose -f docker-compose.yml -f docker-compose.production.yml up -d runtime
```

- Production API: [http://localhost:3002](http://localhost:3002)
- Uses compiled `dist/` from multi-stage Dockerfile
- Loads `.env.production` for config

### ⏹ Stop runtime only

```bash
docker-compose stop nestjs-runtime
```

---

## 📂 Persistent Data with Bind Mounts

> 💡 Unlike default Docker volumes, this setup **mounts host folders** to persist data even after volume deletion or re-creation.

### Suggested paths (on VPS/Linux)

| Service       | Host Path                    | Container Path                           |
|---------------|------------------------------|-------------------------------------------|
| PostgreSQL    | `/var/vps-data/postgres`     | `/var/lib/postgresql/data`               |
| Redis         | `/var/vps-data/redis`        | `/data`                                   |
| Elasticsearch | `/var/vps-data/elasticsearch`| `/usr/share/elasticsearch/data`          |
| RabbitMQ      | `/var/vps-data/rabbitmq`     | `/var/lib/rabbitmq`                      |

Create directories and set permission (example):

```bash
sudo mkdir -p /var/vps-data/{postgres,redis,elasticsearch,rabbitmq}
sudo chown -R 999:999 /var/vps-data/postgres  # UID 999 for postgres user
```

---

## 🧪 Useful Docker Commands

```bash
# List containers
docker ps

# Follow logs for NestJS dev
docker-compose -f docker-compose.yml logs -f dev

# Clean up all unused resources
docker system prune -af --volumes

# Rebuild from scratch
docker-compose down --volumes
docker-compose -f docker-compose.yml build --no-cache
```

---

## 🛠 When Installing New Dependencies

### ✅ 1. Stop container

```bash
docker rm -f nestjs-dev
```

### ✅ 2. Remove image (optional)

```bash
docker rmi nestjs-dev:latest
docker image prune -a -f
```

### ✅ 3. Clear local caches (optional)

```bash
rm -rf node_modules
rm -f package-lock.json
```

### ✅ 4. Rebuild container

```bash
docker-compose -f docker-compose.yml build dev
docker-compose -f docker-compose.yml up dev
```

---

## 📦 Installing Locally (optional)

If you want to install locally without Docker:

```bash
npm install
```

---

## 💡 Final Notes

- ✅ This setup **prevents data loss** using bind-mounted volumes instead of named volumes.
- 🔐 Ensure sensitive data (JWT secret, DB password) is managed via `.env` securely.
- 🧩 Supports both `nestjs-dev` (hot reload with local node_modules) and `nestjs-runtime` (dist build).
- 🛡️ Docker host folders are safe from volume pruning and ideal for production backups.

---

Happy coding! 🚀
---

## ⚙️ Docker Shortcut Script

You can use the included `docker-shortcuts.sh` for easier dev workflow:

### 🧪 Setup (first time)

```bash
chmod +x docker-shortcuts.sh
```

### 🚀 Usage

```bash
./docker-shortcuts.sh dev       # Start dev server with hot reload
./docker-shortcuts.sh stop      # Stop dev container
./docker-shortcuts.sh restart   # Restart dev container
./docker-shortcuts.sh logs      # Follow dev logs in real-time
```

> ℹ️ This script automatically includes `docker-compose.dev.yml` for local development