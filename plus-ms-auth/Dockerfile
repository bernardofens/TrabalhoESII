# Estágio 1: Build (Instala tudo e traduz o TS para JS)
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Estágio 2: Produção (Roda o código compilado de forma otimizada)
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist

# A porta que definimos lá no .env do docker-compose
EXPOSE 3001
CMD ["node", "dist/main"]