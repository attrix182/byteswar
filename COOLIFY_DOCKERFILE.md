# 🐳 Despliegue con Dockerfile en Coolify - BytesWar

## 📋 Configuración en Coolify

### **1. Cambiar Build Pack**

En tu aplicación de Coolify:

1. Ve a **Settings** o **Configure**
2. Busca la sección **"Build Configuration"**
3. Cambia **Build Pack** de "Nixpacks" a **"Dockerfile"**
4. Guarda los cambios

### **2. Configuración de Puerto**

```
Internal Port: 3001
External Port: 3001
Protocol: HTTP
```

### **3. Variables de Entorno**

Agrega estas variables en la sección **"Environment Variables"**:

```env
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
DEBUG=false
LOG_LEVEL=info
ENABLE_CORS=true
CORS_ORIGINS=*
ENABLE_CREDENTIALS=false
CLIENT_URL=http://byteswar.31.97.151.147.sslip.io
```

### **4. Health Check**

```
Path: /health
Interval: 30
Timeout: 10
Retries: 3
Start Period: 40
```

### **5. Configuración de Proxy**

```
Enable Proxy: ✅
Upstream: http://localhost:3001
Path: /
```

## 🏗️ Archivos de Configuración

### **Dockerfile**
```dockerfile
FROM node:18-alpine
RUN apk add --no-cache dumb-init
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
COPY package*.json ./
RUN npm ci && npm cache clean --force
COPY . .
RUN npm run build
RUN chown -R nodejs:nodejs /app
USER nodejs
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
```

### **package.json**
```json
{
  "scripts": {
    "start": "node --import tsx/esm src/server/gameServer.ts",
    "build": "tsc && vite build"
  }
}
```

## 🔍 Verificación del Despliegue

### **1. Logs de Build**
Durante el build, deberías ver:
```
✓ Installing dependencies
✓ Building client
✓ Starting server
```

### **2. Health Check**
```bash
curl http://byteswar.31.97.151.147.sslip.io/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "players": 0,
  "projectiles": 0,
  "gameActive": false
}
```

### **3. Endpoints Disponibles**
- **`/`** - Cliente del juego
- **`/health`** - Health check
- **`/debug`** - Información de debug
- **`/api/status`** - Estado de la API

## 🛠️ Troubleshooting

### **Problema: Build falla**
- Verifica que `Dockerfile` esté en la raíz del proyecto
- Asegúrate de que `package.json` tenga el script `start` correcto
- Revisa los logs de build en Coolify

### **Problema: Puerto no accesible**
- Verifica la configuración de puertos en Coolify
- Asegúrate de que el proxy esté habilitado
- Comprueba que el health check pase

### **Problema: Variables de entorno**
- Verifica que todas las variables estén configuradas
- Asegúrate de que `NODE_ENV=production`
- Comprueba que `PORT=3001`

## 🎮 ¡Listo para Jugar!

Una vez desplegado correctamente:
1. El servidor estará disponible en tu dominio
2. Los jugadores podrán conectarse desde cualquier lugar
3. El juego funcionará con todas las características

## 📊 Monitoreo

- **Logs**: Disponibles en tiempo real en Coolify
- **Health Check**: Automático cada 30 segundos
- **Métricas**: Número de jugadores, proyectiles, estado del juego 