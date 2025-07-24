# 🚀 BytesWar - Configuración de Producción

## 🌐 URL de Producción

**BytesWar está desplegado en:** [http://byteswar.31.97.151.147.sslip.io](http://byteswar.31.97.151.147.sslip.io)

## 🔧 Configuración Actual

### Servidor
- **URL**: http://byteswar.31.97.151.147.sslip.io
- **Puerto**: 3001
- **Entorno**: Producción
- **Plataforma**: VPS con Docker

### Cliente
- **URL de conexión**: http://byteswar.31.97.151.147.sslip.io
- **WebSocket**: http://byteswar.31.97.151.147.sslip.io
- **CORS**: Configurado para el dominio de producción

## 🎮 Cómo Jugar

1. **Accede al juego**: [http://byteswar.31.97.151.147.sslip.io](http://byteswar.31.97.151.147.sslip.io)
2. **Ingresa tu nombre** en el campo de texto
3. **Haz click en "Unirse al Juego"**
4. **Usa WASD** para mover tu robot
5. **Haz click izquierdo** para disparar

## 🔄 Actualizaciones

Para actualizar el juego en producción:

```bash
# En tu VPS
cd byteswar
git pull

# Generar archivo de configuración (si no existe)
./generate-env.sh

# Desplegar
./deploy.sh
```

## 📊 Monitoreo

### Verificar estado del servicio:
```bash
curl http://byteswar.31.97.151.147.sslip.io/api/status
```

### Ver logs del contenedor:
```bash
docker-compose logs -f byteswar
```

## 🐛 Troubleshooting

### Si el juego no carga:
1. Verifica que el servidor esté funcionando: `curl http://byteswar.31.97.151.147.sslip.io/health`
2. Revisa los logs: `docker-compose logs byteswar`
3. Reinicia el servicio: `docker-compose restart byteswar`

### Si no puedes conectarte:
1. Verifica que el puerto 3001 esté abierto
2. Comprueba que el firewall permita conexiones
3. Verifica que el dominio esté configurado correctamente

## 📝 Variables de Entorno

```bash
NODE_ENV=production
PORT=3001
SERVER_URL=http://byteswar.31.97.151.147.sslip.io
```

## 🎯 Características de Producción

- ✅ **Optimizado** para rendimiento
- ✅ **Seguro** con CORS configurado
- ✅ **Escalable** con Docker
- ✅ **Monitoreado** con health checks
- ✅ **Automático** con restart policies

¡Disfruta jugando BytesWar en producción! 🎮 