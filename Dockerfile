# syntax=docker/dockerfile:1.7

FROM node:20-bullseye-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy server deps and build
COPY server/package*.json ./server/
RUN cd server && npm ci
COPY server/ ./server/
RUN cd server && npm run build

# Move server deps to root for runtime
RUN cp -r server/node_modules ./node_modules && cp server/package.json ./package.json

# Copy pre-built client assets
COPY dist/ ./public/

EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:4000/health').then(r=>{if(!r.ok)throw r.status}).catch(()=>process.exit(1))"
CMD ["node", "server/dist/index.js"]
