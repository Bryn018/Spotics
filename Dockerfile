# syntax=docker/dockerfile:1.7

FROM node:20-bullseye-slim
WORKDIR /app

# Install deps (include devDeps for build)
COPY server/package*.json ./server/
RUN cd server && npm ci

# Copy and build server
COPY server/ ./server/
RUN cd server && npm run build

# Prune devDependencies after build
RUN cd server && npm prune --production

# Pre-built client
COPY dist/ ./public/

# Symlink node_modules for runtime
RUN ln -s /app/server/node_modules /app/node_modules

ENV NODE_ENV=production
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:4000/health').then(r=>{if(!r.ok)throw r.status}).catch(()=>process.exit(1))"
CMD ["node", "server/dist/index.js"]
