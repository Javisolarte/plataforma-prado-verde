# Etapa 1: Construcción del Frontend Angular
FROM node:20-alpine AS build

WORKDIR /app

# Copiar manifiestos e instalar dependencias
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copiar el código fuente y construir para producción
COPY . .
RUN npm run build -- --configuration production

# Etapa 2: Servidor Nginx ultra ligero
FROM nginx:alpine

# Copiar la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los estáticos compilados de Angular
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
