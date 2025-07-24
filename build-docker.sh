#!/bin/bash

# Script para construir y probar la imagen Docker de BytesWar

echo "🐳 Construyendo imagen Docker de BytesWar..."

# Construir la imagen
docker build -t byteswar:latest .

if [ $? -eq 0 ]; then
    echo "✅ Imagen construida exitosamente"
    
    echo "🚀 Iniciando contenedor de prueba..."
    
    # Detener contenedor existente si existe
    docker stop byteswar-test 2>/dev/null
    docker rm byteswar-test 2>/dev/null
    
    # Ejecutar contenedor de prueba
    docker run -d \
        --name byteswar-test \
        -p 3001:3001 \
        -e NODE_ENV=production \
        -e PORT=3001 \
        -e HOST=0.0.0.0 \
        byteswar:latest
    
    if [ $? -eq 0 ]; then
        echo "✅ Contenedor iniciado en puerto 3001"
        echo "🌐 Accede al juego en: http://localhost:3001"
        echo "🔍 Health check: http://localhost:3001/health"
        echo ""
        echo "📋 Comandos útiles:"
        echo "  Ver logs: docker logs -f byteswar-test"
        echo "  Detener: docker stop byteswar-test"
        echo "  Eliminar: docker rm byteswar-test"
    else
        echo "❌ Error al iniciar el contenedor"
        exit 1
    fi
else
    echo "❌ Error al construir la imagen"
    exit 1
fi 