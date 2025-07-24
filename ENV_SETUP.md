# 🔧 Configuración de Variables de Entorno - BytesWar

## 📝 Archivo .env

El archivo `.env` contiene todas las variables de entorno necesarias para ejecutar BytesWar en diferentes entornos.

## 🚀 Generación Automática

### Opción 1: Script automático (Recomendado)
```bash
chmod +x generate-env.sh
./generate-env.sh
```

### Opción 2: Creación manual
```bash
cp env.config .env
```

## 📋 Variables de Entorno

### 🔧 Configuración del Servidor
```bash
NODE_ENV=production          # Entorno de ejecución
PORT=3001                    # Puerto del servidor
HOST=0.0.0.0                # Host del servidor
```

### 🌐 URLs de Conexión
```bash
SERVER_URL=http://byteswar.31.97.151.147.sslip.io
CLIENT_URL=http://byteswar.31.97.151.147.sslip.io
```

### 🔒 Configuración de CORS
```bash
CORS_ORIGINS=http://byteswar.31.97.151.147.sslip.io,https://byteswar.31.97.151.147.sslip.io,http://localhost:3000,http://localhost:3001
```

### 🎮 Configuración del Juego
```bash
MAX_PLAYERS=8               # Máximo número de jugadores
GAME_TICK_RATE=60           # Tasa de actualización del juego
ARENA_SIZE=50               # Tamaño de la arena
```

### ⚡ Configuración de Física
```bash
PLAYER_SPEED=5              # Velocidad del jugador
PROJECTILE_SPEED=20         # Velocidad de los proyectiles
PROJECTILE_DAMAGE=25        # Daño de los proyectiles
```

### 🐛 Configuración de Desarrollo
```bash
DEBUG=false                 # Modo debug
LOG_LEVEL=info             # Nivel de logs
SHOW_STATS=false           # Mostrar estadísticas
```

### 🐳 Configuración de Docker
```bash
DOCKER_IMAGE_NAME=byteswar
DOCKER_CONTAINER_NAME=byteswar-game
```

### 📊 Configuración de Monitoreo
```bash
HEALTH_CHECK_ENDPOINT=/health
API_STATUS_ENDPOINT=/api/status
```

### 🔐 Configuración de Seguridad
```bash
ENABLE_CORS=true
ENABLE_CREDENTIALS=true
```

## 🔄 Entornos

### Producción
```bash
NODE_ENV=production
DEBUG=false
LOG_LEVEL=info
```

### Desarrollo
```bash
NODE_ENV=development
DEBUG=true
LOG_LEVEL=debug
SHOW_STATS=true
```

## 🚀 Uso con Docker Compose

El archivo `docker-compose.yml` está configurado para usar las variables del archivo `.env`:

```yaml
environment:
  - NODE_ENV=${NODE_ENV:-production}
  - PORT=${PORT:-3001}
  - SERVER_URL=${SERVER_URL:-http://byteswar.31.97.151.147.sslip.io}
```

## 🔧 Personalización

### Cambiar la URL del servidor
```bash
# En el archivo .env
SERVER_URL=http://tu-dominio.com
CLIENT_URL=http://tu-dominio.com
```

### Cambiar la configuración del juego
```bash
# En el archivo .env
MAX_PLAYERS=16
PLAYER_SPEED=8
PROJECTILE_SPEED=25
```

### Habilitar modo debug
```bash
# En el archivo .env
DEBUG=true
LOG_LEVEL=debug
SHOW_STATS=true
```

## 📝 Notas Importantes

- ⚠️ **Nunca subas el archivo `.env` al repositorio** (ya está en `.gitignore`)
- 🔒 **Las variables sensibles deben mantenerse seguras**
- 🔄 **Reinicia el contenedor después de cambiar las variables**
- 📋 **Usa `env.config` como plantilla para nuevos entornos**

## 🚀 Comandos Útiles

```bash
# Generar archivo .env
./generate-env.sh

# Ver variables de entorno
cat .env

# Verificar configuración
docker-compose config

# Reiniciar con nuevas variables
docker-compose down && docker-compose up -d
``` 