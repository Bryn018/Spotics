# syntax=docker/dockerfile:1.7

FROM node:20-bullseye-slim
WORKDIR /app
ENV NODE_ENV=production

# Server
COPY server/package*.json ./server/
RUN cd server && npm ci
COPY server/ ./server/
RUN cd server && npm run build

# Pre-built client
COPY dist/ ./public/

# Symlink node_modules for runtime
RUN ln -s /app/server/node_modules /app/node_modules

EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:4000/health').then(r=>{if(!r.ok)throw r.status}).catch(()=>process.exit(1))"
CMD ["node", "server/dist/index.js"]
