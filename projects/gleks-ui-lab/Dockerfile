# Стейдж 1: Билд
FROM node:22-alpine AS build
WORKDIR /app

# Обновляем npm (если это реально необходимо) и ставим зависимости
RUN npm install -g npm@11.6.2

COPY package.json package-lock.json ./

# Используем --prefer-offline или --no-audit для ускорения и стабильности в CI
RUN npm ci --no-audit --maxsockets=5

COPY . .
RUN npm run build:lab

# Стейдж 2: Рантайм
FROM node:22-alpine AS runtime
WORKDIR /app

COPY --from=build /app/dist/gleks-ui-lab ./dist/gleks-ui-lab

ENV PORT=80
EXPOSE 80

CMD ["node", "dist/gleks-ui-lab/server/server.mjs"]
