# Build context is the repo root (this is an Angular workspace, not a standalone app):
#   docker build -f projects/gleks-ui-lab/Dockerfile .

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build:lab

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist/gleks-ui-lab ./dist/gleks-ui-lab

ENV PORT=4000
EXPOSE 4000
CMD ["node", "dist/gleks-ui-lab/server/server.mjs"]
