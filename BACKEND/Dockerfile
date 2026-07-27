# Etapa 1: Construcción del Backend NestJS + Prisma
FROM node:20-alpine AS build

WORKDIR /app

# Instalar dependencias necesarias para Prisma en Alpine
RUN apk add --no-cache openssl

# Copiar manifiestos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --legacy-peer-deps

# Copiar el resto del código y generar cliente de Prisma + Build
COPY . .
RUN npx prisma generate
RUN npm run build

# Etapa 2: Imagen final de producción
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

EXPOSE 3000

# Ejecutar migraciones/push automático en inicio y arrancar servidor NestJS
CMD ["sh", "-c", "npx prisma db push --accept-data-loss || true ; node dist/src/main.js"]
