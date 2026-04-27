# Railway Dockerfile - Force rebuild with Figma design colors
# Generated: $(date -u '+%Y-%m-%dT%H:%M:%SZ')

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist /app/dist

EXPOSE 3000

RUN npm install -g http-server

CMD ["http-server", "dist", "-p", "3000", "-c-1"]
