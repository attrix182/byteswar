# Dockerfile para BytesWar - Juego PVP de robots
FROM node:18-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache dumb-init wget

WORKDIR /app

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copiar package.json e instalar dependencias
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Copiar todo el código fuente
COPY . .

# Construir el cliente
RUN npm run build

# Crear archivo de configuración de producción
RUN echo 'NODE_ENV=production' > .env

# Cambiar ownership al usuario nodejs
RUN chown -R nodejs:nodejs /app

# Cambiar al usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Comando de inicio con dumb-init para manejo correcto de señales
ENTRYPOINT ["dumb-init", "--"]

# Comando para ejecutar el servidor
CMD ["node", "--import", "tsx/esm", "src/server/gameServer.ts"] 