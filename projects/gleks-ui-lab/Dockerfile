# Стейдж 1: Билд
FROM node:22-alpine AS build
WORKDIR /app
RUN npm install -g npm@11.6.2
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build:lab

# Стейдж 2: Рантайм
FROM node:22-alpine AS runtime
WORKDIR /app

# Копируем готовый билд (проверь пути!)
COPY --from=build /app/dist/gleks-ui-lab ./dist/gleks-ui-lab

# Настраиваем порт 80, как в твоем "хорошем" примере
ENV PORT=80
EXPOSE 80

# Путь к серверу (убедись, что он такой после npm run build:lab)
CMD ["node", "dist/gleks-ui-lab/server/server.mjs"]
