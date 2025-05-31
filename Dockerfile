# Stage 1: Builder
FROM node:22-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Dev (ts-node-dev)
FROM node:22-slim AS dev
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001
CMD ["npm", "run", "start:dev"]

# Stage 3: Runtime (production)
FROM node:22-slim AS runtime
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/keys/firebase-admin-key.json ./src/keys/firebase-admin-key.json
COPY --from=builder /app/.env.production ./.env

EXPOSE 3001
CMD ["node", "dist/main"]