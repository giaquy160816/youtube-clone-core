<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Description

Project clone youtube with nestjs frame

## 🐳 Docker Setup Guide for Local Development

This project uses **Docker Compose** to run NestJS in both development (`nestjs-dev`) and production (`nestjs-runtime`) modes. It also includes essential services: **PostgreSQL**, **Redis**, **Elasticsearch**, **Kibana**, and **RabbitMQ**.

---

### 🧱 Project Structure

```bash
.
├── Dockerfile                      # Multi-stage build: builder, dev, runtime
├── docker-compose.yml              # Core services (DB, Redis, etc.)
├── docker-compose.dev.yml         # Dev-specific service (nestjs-dev)
├── .env.development               # Environment variables for dev mode
└── src/
```

---

### 🚀 Running Locally

#### ✅ First-time setup

Build dev environment (NestJS + services):

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml build dev
```

#### ▶️ Start development server with hot reload:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up dev
```

- Dev API available at: http://localhost:3002
- Uses `ts-node-dev` for automatic reload on code change

> 💡 To watch logs in real-time:  
> `docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f dev`

#### ⏹ Stop services

Stop all services (including databases, message brokers, etc.):  
```bash
docker-compose down
```

Or stop only NestJS dev:  
```bash
docker-compose stop nestjs-dev
```

#### 🔄 When you update `.env.development`

Docker won't reload env vars automatically. Do this instead:

```bash
docker-compose stop nestjs-dev
docker-compose up dev
```

---

### 🏗 Production Runtime (Optional)

To build and run production-ready container (`nestjs-runtime`):

```bash
docker-compose build runtime
docker-compose up -d runtime
```

- Runs at: http://localhost:3001
- Uses compiled `dist/` from Dockerfile multi-stage build
- Uses `.env.production` internally

To stop only runtime:

```bash
docker-compose stop nestjs-runtime
```

---

### 🧪 Useful Docker Commands

```bash
# Check running containers
docker ps

# Show logs for NestJS dev
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f dev

# Clean up all stopped containers & volumes
docker system prune -af --volumes

# Rebuild everything (force clean)
docker-compose down --volumes
docker-compose -f docker-compose.yml -f docker-compose.dev.yml build --no-cache
```

---

### 🛠 When you need to install a new library, follow these steps:

#### ✅ 1. Dừng và xóa container

```bash
# -f: ép dừng container nếu đang chạy
docker rm -f nestjs-dev nestjs-runtime
```

#### ✅ 2. Xóa image

```bash
# Lọc image có tên chứa nestjs (hoặc cụ thể hơn: nestjs-dev, nestjs-runtime)
docker rmi $(docker images | grep 'nestjs' | awk '{print $3}')
```

#### ✅ 3. Xóa volume liên quan (nếu cần)

```bash
# Kiểm tra volume nào có tên liên quan nestjs
docker volume ls | grep nestjs

# Sau đó xóa:
docker volume rm <volume-name>
## Hoặc xóa tất cả volume không dùng:
docker volume prune -f
```

#### ✅ 4. Xóa thư mục node_modules / file package-lock.json dưới local

```bash
rm -rf node_modules    
rm -f package-lock.json
```

#### ✅ 5. Tiến hành build lại container dev - runtime 

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml build dev    
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up dev
```

## Project setup local when finish when docker run success

```bash
$ npm install
```

---

Happy coding! 🚀