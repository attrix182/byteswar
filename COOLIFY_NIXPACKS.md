# 🚀 Despliegue con Nixpacks en Coolify - BytesWar

## 📋 Configuración en Coolify

### **1. Crear Nueva Aplicación**

1. Ve a tu panel de Coolify
2. Crea una nueva **Application**
3. Selecciona **"Nixpacks"** como build pack
4. Conecta tu repositorio Git

### **2. Configuración de Build**

En la sección **"Build Configuration"**:

```
Build Pack: Nixpacks
Branch: main
```

### **3. Configuración de Puerto**

En la sección **"Port Configuration"**:

```
Internal Port: 3001
External Port: 3001
Protocol: HTTP
```

### **4. Variables de Entorno**

En la sección **"Environment Variables"**, agrega:

```env
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
DEBUG=false
LOG_LEVEL=info
ENABLE_CORS=true
CORS_ORIGINS=*
ENABLE_CREDENTIALS=false
CLIENT_URL=http://tu-dominio.com
```

### **5. Health Check**

En la sección **"Health Check"**:

```
Path: /health
Interval: 30
Timeout: 10
Retries: 3
Start Period: 40
```

### **6. Configuración de Proxy**

En la sección **"Proxy Configuration"**:

```
Enable Proxy: ✅
Upstream: http://localhost:3001
Path: /
```

## 🏗️ Archivos de Configuración

### **nixpacks.toml**
```toml
[phases.setup]
nixPkgs = ["nodejs_18", "wget"]

[phases.install]
cmds = ["npm ci --only=production"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "node --import tsx/esm src/server/gameServer.ts"

[variables]
NODE_ENV = "production"
PORT = "3001"
HOST = "0.0.0.0"
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
curl http://tu-dominio.com/health
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
- Verifica que `nixpacks.toml` esté en la raíz del proyecto
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