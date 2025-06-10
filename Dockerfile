# Dev stage only, sử dụng ts-node-dev
FROM node:22-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3002

CMD ["npm", "run", "start:dev"]