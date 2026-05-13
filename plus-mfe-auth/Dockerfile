# Estágio 1: Build (instala deps e compila o bundle do MFE)
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# Estágio 2: Produção (nginx servindo a pasta dist)
FROM nginx:alpine

# Config customizada:
#  - escuta na 4001 (porta esperada pelo Module Federation no Shell)
#  - libera CORS para o Shell em outra origem carregar o remoteEntry.js
#  - fallback para index.html (SPA, caso o MFE seja acessado standalone)
RUN rm /etc/nginx/conf.d/default.conf && \
    printf 'server {\n\
    listen 4001;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    add_header Access-Control-Allow-Origin *;\n\
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";\n\
    add_header Access-Control-Allow-Headers "*";\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 4001
CMD ["nginx", "-g", "daemon off;"]
