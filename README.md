# BytesWar - Juego PVP de Robots

¡Bienvenido a **BytesWar**! Un emocionante juego PVP multijugador donde controlas robots aspiradoras que disparan proyectiles en una arena 3D.

## 🎮 Características

- **Multijugador en tiempo real** - Juega contra otros jugadores online
- **Robots 3D únicos** - Cada robot tiene su propio color y diseño
- **Sistema de combate** - Dispara proyectiles para derrotar a tus oponentes
- **Física realista** - Movimiento fluido y colisiones precisas
- **Interfaz moderna** - UI intuitiva con información del juego en tiempo real

## 🚀 Instalación

1. **Clona el repositorio:**
   ```bash
   git clone <tu-repositorio>
   cd byteswar
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Inicia el servidor y el cliente:**
   ```bash
   npm start
   ```

   Esto iniciará:
   - Servidor de juego en `http://localhost:3001`
   - Cliente web en `http://localhost:3000`

## 🎯 Cómo Jugar

### Controles
- **WASD** o **Flechas** - Mover el robot
- **Click izquierdo** - Disparar proyectil
- **Mouse** - Rotar la cámara

### Objetivo
- Reduce la salud de tus oponentes a 0
- Evita los proyectiles enemigos
- ¡Sé el último robot en pie!

### Mecánicas
- Cada proyectil hace 25 puntos de daño
- Los robots tienen 100 puntos de salud
- Al morir, reapareces después de 3 segundos
- El juego continúa hasta que solo quede un jugador

## 🛠️ Desarrollo

### Estructura del Proyecto
```
byteswar/
├── src/
│   ├── components/     # Componentes React 3D
│   ├── game/          # Lógica del juego
│   ├── server/        # Servidor de juego
│   ├── types/         # Tipos TypeScript
│   └── utils/         # Utilidades
├── package.json
└── README.md
```

### Scripts Disponibles
- `npm run dev` - Inicia solo el cliente de desarrollo
- `npm run server` - Inicia solo el servidor
- `npm run dev:server` - Servidor en modo desarrollo con recarga automática
- `npm start` - Inicia servidor y cliente simultáneamente
- `npm run build` - Construye para producción

### Tecnologías Utilizadas
- **Frontend**: React 18, TypeScript, Vite
- **3D Graphics**: Three.js, React Three Fiber, React Three Cannon
- **Backend**: Node.js, Express, Socket.IO
- **Física**: React Three Cannon
- **UI**: CSS personalizado

## 🌐 Multijugador

El juego utiliza Socket.IO para la comunicación en tiempo real:

- **Conexión automática** al servidor
- **Sincronización de estado** en tiempo real
- **Gestión de jugadores** dinámica
- **Colisiones** verificadas en el servidor

## 🎨 Personalización

### Configuración del Juego
Edita `src/utils/gameConfig.ts` para modificar:
- Tamaño de la arena
- Velocidad de los robots
- Daño de los proyectiles
- Salud de los jugadores
- Tiempo de respawn

### Colores de Robots
Los robots se asignan automáticamente de la paleta en `PLAYER_COLORS`.

## 🐛 Solución de Problemas

### Error de Conexión
Si no puedes conectarte al servidor:
1. Verifica que el servidor esté ejecutándose en el puerto 3001
2. Revisa la consola del navegador para errores
3. Asegúrate de que no haya firewalls bloqueando la conexión

### Problemas de Rendimiento
- Reduce la calidad de sombras en el código
- Ajusta la distancia de renderizado
- Cierra otras aplicaciones que consuman GPU

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia ISC. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- [React Three Fiber](https://github.com/pmndrs/react-three-fiber) - Renderer de Three.js para React
- [Socket.IO](https://socket.io/) - Comunicación en tiempo real
- [Three.js](https://threejs.org/) - Biblioteca 3D para la web

---

¡Disfruta jugando **BytesWar**! 🚀🤖 