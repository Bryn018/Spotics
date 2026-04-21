# syntax=docker/dockerfile:1.7

FROM node:20-bullseye-slim
WORKDIR /app

# Install server deps (include devDeps for build)
COPY server/package*.json ./server/
RUN cd server && npm ci

# Copy and build server
COPY server/ ./server/
RUN cd server && npm run build

# Prune server devDependencies
RUN cd server && npm prune --production

# Install frontend deps (include devDeps for build)
COPY package*.json ./
RUN npm ci

# Copy frontend source and build with VITE_API_URL
COPY tsconfig.json vite.config.ts postcss.config.js tailwind.config.js index.html ./
COPY src/ ./src/

ARG VITE_API_URL=https://spotics.insights.autos
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build:client

# Copy built frontend to where server expects it
RUN cp -r dist public

# Prune frontend devDependencies
RUN npm prune --production

# Symlink node_modules for runtime
RUN ln -s /app/server/node_modules /app/node_modules

ENV NODE_ENV=production
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:4000/health').then(r=>{if(!r.ok)throw r.status}).catch(()=>process.exit(1))"
CMD ["node", "server/dist/index.js"]
