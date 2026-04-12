# syntax=docker/dockerfile:1.7

# --- Build client (Vite) ----------------------------------------------------
FROM node:20-bullseye-slim AS client-builder
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Build server (Express API) ---------------------------------------------
FROM node:20-bullseye-slim AS server-builder
WORKDIR /app

COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# --- Runtime ----------------------------------------------------------------
FROM node:20-bullseye-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy server build + deps
COPY --from=server-builder /app/dist ./dist
COPY --from=server-builder /app/node_modules ./node_modules
COPY --from=server-builder /app/package.json ./package.json

# Copy client assets the API will serve statically
COPY --from=client-builder /app/dist ./public

EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:4000/health').then(r=>{if(!r.ok)throw r.status}).catch(()=>process.exit(1))"
CMD ["node", "dist/index.js"]
