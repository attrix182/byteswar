#!/bin/bash

# Script para diagnosticar el servidor BytesWar en producción

SERVER_URL="http://byteswar.31.97.151.147.sslip.io"

echo "🔍 Diagnóstico del servidor BytesWar"
echo "=================================="
echo "URL del servidor: $SERVER_URL"
echo ""

# Función para hacer requests con timeout
make_request() {
    local endpoint=$1
    local description=$2
    
    echo "📡 Probando: $description"
    echo "   URL: $SERVER_URL$endpoint"
    
    response=$(curl -s -w "\nHTTP_CODE:%{http_code}\nTIME:%{time_total}s" --max-time 10 "$SERVER_URL$endpoint" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
        time_taken=$(echo "$response" | grep "TIME:" | cut -d: -f2)
        body=$(echo "$response" | sed '/HTTP_CODE:/d' | sed '/TIME:/d')
        
        echo "   ✅ Status: $http_code"
        echo "   ⏱️  Tiempo: ${time_taken}s"
        echo "   📄 Respuesta: $body"
    else
        echo "   ❌ Error: Timeout o conexión fallida"
    fi
    echo ""
}

# Probar diferentes endpoints
make_request "/health" "Health Check"
make_request "/debug" "Debug Endpoint"
make_request "/api/status" "API Status"
make_request "/api/players" "API Players"
make_request "/" "Página Principal"

echo "🔧 Información adicional:"
echo "=========================="

# Verificar si el puerto está abierto
echo "🔌 Verificando puerto 3001..."
nc -z 31.97.151.147 3001 2>/dev/null
if [ $? -eq 0 ]; then
    echo "   ✅ Puerto 3001 está abierto"
else
    echo "   ❌ Puerto 3001 está cerrado"
fi

# Verificar DNS
echo "🌐 Verificando DNS..."
nslookup byteswar.31.97.151.147.sslip.io 2>/dev/null | grep -E "(Name|Address)"
if [ $? -eq 0 ]; then
    echo "   ✅ DNS resuelve correctamente"
else
    echo "   ❌ Problema con DNS"
fi

echo ""
echo "📋 Comandos útiles para debugging:"
echo "=================================="
echo "• Ver logs del contenedor: docker logs <container_id>"
echo "• Verificar estado del contenedor: docker ps"
echo "• Probar conectividad: curl -v $SERVER_URL/health"
echo "• Verificar puertos: netstat -tulpn | grep 3001" 