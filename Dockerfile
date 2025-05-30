# Stage 1: Builder – Build dist/
FROM node:22-alpine AS builder
WORKDIR /app

# Cài dependencies đầy đủ (cả dev)
COPY package*.json ./
RUN npm install

# Copy mã nguồn và build
COPY . .
RUN npm run build

# Stage 2: Development – Dùng ts-node-dev + volume mount
FROM node:22-alpine AS dev
WORKDIR /app

# Cài đầy đủ dependencies để dùng ts-node-dev
COPY package*.json ./
RUN npm install

# Copy source vào container
COPY . .

# Expose cổng mặc định của NestJS
EXPOSE 3001

CMD ["npm", "run", "start:dev"]

# Stage 3: Runtime – Production bản đã build
FROM node:22-alpine AS runtime
WORKDIR /app

# Cài chỉ dependencies cần cho production
COPY package*.json ./
RUN npm install --omit=dev

# Copy từ builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/keys/firebase-admin-key.json ./src/keys/firebase-admin-key.json
COPY --from=builder /app/.env.production ./.env

EXPOSE 3001
CMD ["node", "dist/main"]