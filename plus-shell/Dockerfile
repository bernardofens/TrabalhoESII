# Estágio 1: Build do Shell
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .

# URL do MFE de auth em tempo de build
ARG MFE_AUTH_URL=http://localhost:4001/assets/remoteEntry.js
ENV MFE_AUTH_URL=$MFE_AUTH_URL

RUN npm run build

# Estágio 2: Produção (nginx servindo a SPA)
FROM nginx:alpine

# Escuta na 3000 + fallback para index.html (React Router)
RUN rm /etc/nginx/conf.d/default.conf && \
    printf 'server {\n\
    listen 3000;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
