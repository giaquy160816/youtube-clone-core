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

### ⚙️ Environment Configuration

Create `.env.development` file with the following:

```env
DB_POSTGRES_HOST=postgres-db
DB_POSTGRES_PORT=5432
DB_POSTGRES_USERNAME=myuser
DB_POSTGRES_PASSWORD=mypassword
DB_POSTGRES_DATABASE=mydatabase

REDIS_HOST=redis-cache
RABBITMQ_URL=amqp://rabbituser:rabbitpassword@rabbitmq:5672
RABBITMQ_QUEUE=my_queue_name
```

> Ensure `ConfigModule.forRoot({ isGlobal: true })` reads from this `.env.development` file.

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

### 🛠 Recommended VS Code Extensions

- Docker
- ESLint
- Prettier
- DotENV
- Prisma (if applicable)

---

### 🤝 Contributing

1. Fork or clone this repo
2. Run project using Docker as described above
3. Submit pull request with proper branch naming and commit message convention

---

Happy coding! 🚀