# Stage 1: build
# Keep in step with .nvmrc: CI (lint) and the image must build on the same Node.
FROM node:24.21.0-alpine AS build
WORKDIR /app

RUN npm install -g npm@11.6.2

COPY package.json package-lock.json ./
RUN npm ci --no-audit --maxsockets=5

COPY . .
RUN npm run build:lab

# Stage 2: runtime
FROM node:24.21.0-alpine AS runtime
WORKDIR /app

# 8080, not 80: an unprivileged process may bind it under any container runtime. Port 80 as the
# `node` user works only where the runtime lowers ip_unprivileged_port_start (rootful Docker does,
# rootless Docker and Podman do not -- measured: "listen EACCES: permission denied 0.0.0.0:80").
# The deploy workflow maps the host port to this one and also passes PORT explicitly.
ENV NODE_ENV=production \
    PORT=8080

# The files stay owned by root: the process can read them but not change them.
COPY --from=build /app/dist/gleks-ui-lab ./dist/gleks-ui-lab

# Not root.
USER node

EXPOSE 8080

# A light "the process is alive and answering" check; the pipeline does the deep SSR probe.
# It requests 127.0.0.1, so that host has to stay in server.ts's ALLOWED_HOSTS.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -q -O /dev/null "http://127.0.0.1:${PORT}/" || exit 1

CMD ["node", "dist/gleks-ui-lab/server/server.mjs"]
