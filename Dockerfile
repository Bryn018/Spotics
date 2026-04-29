# Multi-stage spotics build
FROM node:22-alpine AS builder
ARG CACHE_BUSTER=unused
ARG BUILD_TIMESTAMP
ENV BUILD_TIMESTAMP=${BUILD_TIMESTAMP:-unknown}
ARG SOURCE_DATE_EPOCH

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY server/package*.json ./server/
RUN cd server && npm ci

COPY . .
# Note: CACHE_BUSTER forces rebuild when source changes


# Build frontend and server
RUN npm run build

# Production runtime
FROM node:22-alpine AS runtime
WORKDIR /app

# Copy only production dependencies
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy built artifacts (frontend -> public for express.static, server dist)
COPY --from=builder /app/public ./public
COPY --from=builder /app/server/dist ./server/dist

ENV NODE_ENV=production
ENV PORT=4000

CMD ["node", "server/dist/index.js"]
