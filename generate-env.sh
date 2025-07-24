#!/bin/bash

# Script para generar el archivo .env para BytesWar

echo "🔧 Generando archivo .env para BytesWar..."

# Verificar si ya existe un archivo .env
if [ -f ".env" ]; then
    echo "⚠️  El archivo .env ya existe. ¿Quieres sobrescribirlo? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "❌ Operación cancelada"
        exit 1
    fi
fi

# Crear el archivo .env
cat > .env << 'EOF'
# ========================================
# BytesWar - Variables de Entorno
# ========================================

# Entorno de ejecución
NODE_ENV=production

# Configuración del servidor
PORT=3001
HOST=0.0.0.0

# URLs del servidor
SERVER_URL=http://byteswar.31.97.151.147.sslip.io
CLIENT_URL=http://byteswar.31.97.151.147.sslip.io

# Configuración de CORS
CORS_ORIGINS=http://byteswar.31.97.151.147.sslip.io,https://byteswar.31.97.151.147.sslip.io,http://localhost:3000,http://localhost:3001

# Configuración del juego
MAX_PLAYERS=8
GAME_TICK_RATE=60
ARENA_SIZE=50

# Configuración de física
PLAYER_SPEED=5
PROJECTILE_SPEED=20
PROJECTILE_DAMAGE=25

# Configuración de desarrollo
DEBUG=false
LOG_LEVEL=info
SHOW_STATS=false

# Configuración de Docker
DOCKER_IMAGE_NAME=byteswar
DOCKER_CONTAINER_NAME=byteswar-game

# Configuración de monitoreo
HEALTH_CHECK_ENDPOINT=/health
API_STATUS_ENDPOINT=/api/status

# Configuración de seguridad
ENABLE_CORS=true
ENABLE_CREDENTIALS=true
EOF

echo "✅ Archivo .env generado correctamente!"
echo "📝 Contenido del archivo .env:"
echo "----------------------------------------"
cat .env
echo "----------------------------------------"
echo ""
echo "🚀 Ahora puedes ejecutar: ./deploy.sh" 