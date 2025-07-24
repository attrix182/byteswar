# 🚀 Despliegue de BytesWar en VPS

## 📋 Requisitos Previos

- VPS con Ubuntu/Debian
- Docker instalado
- Docker Compose instalado
- Puerto 3001 abierto

## 🛠️ Instalación de Docker (si no está instalado)

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Reiniciar sesión para aplicar cambios
exit
# Volver a conectar al VPS
```

## 🚀 Despliegue Rápido

### 1. Clonar el repositorio
```bash
git clone <tu-repositorio>
cd byteswar
```

### 2. Generar archivo de configuración
```bash
chmod +x generate-env.sh
./generate-env.sh
```

### 3. Ejecutar el script de despliegue
```bash
chmod +x deploy.sh
./deploy.sh
```

### 3. Verificar el despliegue
```bash
# Verificar estado
curl http://localhost:3001/api/status

# Ver logs
docker-compose logs -f byteswar
```

## 🔧 Despliegue Manual

### 1. Construir la imagen
```bash
docker-compose build --no-cache
```

### 2. Iniciar el servicio
```bash
docker-compose up -d
```

### 3. Verificar logs
```bash
docker-compose logs -f byteswar
```

## 🌐 Configuración de Dominio (Opcional)

### Con Nginx como proxy reverso:

```bash
# Instalar Nginx
sudo apt install nginx -y

# Crear configuración
sudo nano /etc/nginx/sites-available/byteswar
```

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/byteswar /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 Configuración de Firewall

```bash
# Abrir puerto 3001
sudo ufw allow 3001

# Si usas Nginx, abrir puerto 80 y 443
sudo ufw allow 80
sudo ufw allow 443

# Habilitar firewall
sudo ufw enable
```

## 📊 Monitoreo

### Verificar estado del servicio:
```bash
# Estado del contenedor
docker-compose ps

# Logs en tiempo real
docker-compose logs -f byteswar

# Estadísticas de recursos
docker stats byteswar-game
```

### Health Check:
```bash
curl http://tu-vps-ip:3001/api/status
```

## 🔄 Actualizaciones

### Actualizar el juego:
```bash
# Detener servicio
docker-compose down

# Obtener cambios
git pull

# Reconstruir y reiniciar
./deploy.sh
```

## 🐛 Troubleshooting

### Si el servicio no inicia:
```bash
# Ver logs detallados
docker-compose logs byteswar

# Verificar puerto
netstat -tlnp | grep 3001

# Reiniciar Docker
sudo systemctl restart docker
```

### Si el juego no carga:
```bash
# Verificar build
docker-compose build --no-cache

# Verificar archivos estáticos
docker exec -it byteswar-game ls -la /app/dist
```

## 📝 Variables de Entorno

Puedes configurar variables de entorno en `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
  - PORT=3001
  - MAX_PLAYERS=8
```

## 🎮 Acceso al Juego

Una vez desplegado, el juego estará disponible en:
- **Producción**: http://byteswar.31.97.151.147.sslip.io
- **Local**: http://localhost:3001
- **VPS**: http://tu-vps-ip:3001
- **Dominio**: http://tu-dominio.com (si configuraste Nginx)

¡Disfruta jugando BytesWar! 🎮 