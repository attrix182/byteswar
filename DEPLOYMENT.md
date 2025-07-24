# 🚀 Despliegue en Coolify - BytesWar

## 📋 Requisitos Previos

- Coolify instalado en tu VPS
- Docker habilitado en el servidor
- Puerto 3001 disponible

## 🔧 Configuración en Coolify

### 1. Crear Nuevo Proyecto

1. Ve a tu panel de Coolify
2. Crea un nuevo **Application**
3. Selecciona **Docker Compose** como tipo de aplicación

### 2. Configurar Repositorio

- **Source**: Tu repositorio Git (GitHub, GitLab, etc.)
- **Branch**: `main` (o la rama que uses)
- **Docker Compose File**: `docker-compose.yml`

### 3. Variables de Entorno (Opcional)

Puedes configurar estas variables en Coolify si necesitas personalizar el comportamiento:

```env
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
DEBUG=false
LOG_LEVEL=info
ENABLE_CORS=true
CORS_ORIGINS=*
ENABLE_CREDENTIALS=false
```

### 4. Configuración de Red

- **Port**: 3001
- **Protocol**: HTTP
- **Domain**: Tu dominio (ej: `game.tudominio.com`)

### 5. Health Check

El contenedor incluye un health check automático que verifica:
- Endpoint: `http://localhost:3001/health`
- Comando: `wget --no-verbose --tries=1 --spider http://localhost:3001/health`
- Intervalo: 30 segundos
- Timeout: 10 segundos
- Reintentos: 3

## 🏗️ Estructura del Dockerfile

### Multi-Service Container
- **Cliente**: React + Vite (construido y servido estáticamente)
- **Servidor**: Node.js + Socket.IO + Express
- **Puerto**: 3001 (ambos servicios)

### Características de Seguridad
- Usuario no-root (`nodejs`)
- `dumb-init` para manejo correcto de señales
- Health checks automáticos
- Optimización de capas Docker

## 🌐 Acceso al Juego

Una vez desplegado, podrás acceder al juego en:
```
http://tu-dominio.com:3001
```

O si configuras un dominio:
```
https://game.tudominio.com
```

## 🔍 Verificación del Despliegue

### 1. Health Check
```bash
curl http://tu-dominio.com:3001/health
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

### 2. Logs del Contenedor
En Coolify, puedes ver los logs en tiempo real:
- **Build logs**: Durante la construcción
- **Runtime logs**: Durante la ejecución

### 3. Estado del Juego
- El servidor inicia automáticamente
- Los jugadores pueden conectarse inmediatamente
- El juego está activo por defecto

## 🛠️ Troubleshooting

### Problema: Contenedor no inicia
- Verifica que el puerto 3001 esté disponible
- Revisa los logs de build en Coolify
- Asegúrate de que Docker esté funcionando

### Problema: Health check falla
- Verifica que el servidor esté respondiendo en el puerto correcto
- Revisa los logs del contenedor
- Asegúrate de que no haya conflictos de red

### Problema: Cliente no carga
- Verifica que el build del cliente se haya completado
- Revisa que el archivo `dist/index.html` exista
- Comprueba la configuración de CORS

## 📊 Monitoreo

### Métricas Disponibles
- Número de jugadores conectados
- Número de proyectiles activos
- Estado del juego (activo/inactivo)
- Tiempo de respuesta del servidor

### Logs Importantes
- Conexiones de jugadores
- Disparos y colisiones
- Errores de red
- Estado del health check

## 🔄 Actualizaciones

Para actualizar el juego:
1. Haz push a tu repositorio
2. Coolify detectará automáticamente los cambios
3. Reconstruirá la imagen Docker
4. Reiniciará el contenedor con la nueva versión

## 🎮 ¡Listo para Jugar!

Una vez desplegado, tu juego BytesWar estará disponible para que los jugadores se conecten y jueguen desde cualquier lugar del mundo. 