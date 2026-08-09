# Build context is the repo root (this is an Angular workspace, not a standalone app):
#   docker build -f projects/gleks-ui-lab/Dockerfile .

# node:22-alpine bundles an npm whose dependency resolution disagrees on optional
# peer deps (e.g. @napi-rs/wasm-runtime's @emnapi/* peers) with the lock file, which
# makes `npm ci` reject it. Pin to the npm version from package.json's
# "packageManager" field, same workaround as .github/workflows/ci.yml.
FROM node:22-alpine AS build
WORKDIR /app
RUN npm install -g npm@11.6.2
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build:lab

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN npm install -g npm@11.6.2
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist/gleks-ui-lab ./dist/gleks-ui-lab

ENV PORT=4000
EXPOSE 4000
CMD ["node", "dist/gleks-ui-lab/server/server.mjs"]
