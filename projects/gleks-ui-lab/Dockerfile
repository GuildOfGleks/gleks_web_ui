# Stage 1: build
FROM node:22-alpine AS build
WORKDIR /app

# Update npm (only where genuinely needed) and install dependencies
RUN npm install -g npm@11.6.2

COPY package.json package-lock.json ./

# --prefer-offline / --no-audit for speed and CI stability
RUN npm ci --no-audit --maxsockets=5

COPY . .
RUN npm run build:lab

# Stage 2: runtime
FROM node:22-alpine AS runtime
WORKDIR /app

COPY --from=build /app/dist/gleks-ui-lab ./dist/gleks-ui-lab

ENV PORT=80
EXPOSE 80

CMD ["node", "dist/gleks-ui-lab/server/server.mjs"]
