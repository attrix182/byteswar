#!/bin/bash

# Script de despliegue para BytesWar
echo "🚀 Iniciando despliegue de BytesWar..."

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

# Detener contenedores existentes
echo "🛑 Deteniendo contenedores existentes..."
docker-compose down

# Eliminar imágenes antiguas
echo "🧹 Limpiando imágenes antiguas..."
docker system prune -f

# Construir nueva imagen
echo "🔨 Construyendo nueva imagen..."
docker-compose build --no-cache

# Iniciar servicios
echo "▶️  Iniciando servicios..."
docker-compose up -d

# Esperar a que el servicio esté listo
echo "⏳ Esperando a que el servicio esté listo..."
sleep 10

# Verificar estado
echo "🔍 Verificando estado del servicio..."
if curl -f http://localhost:3001/api/status > /dev/null 2>&1; then
    echo "✅ BytesWar está funcionando correctamente!"
    echo "🌐 Accede al juego en: http://tu-vps-ip:3001"
    echo "📊 Estado del servicio:"
    curl -s http://localhost:3001/api/status | jq .
else
    echo "❌ Error: El servicio no está respondiendo"
    echo "📋 Logs del contenedor:"
    docker-compose logs byteswar
    exit 1
fi

echo "🎉 ¡Despliegue completado!" 