# Test del Sistema de Muerte y Respawn

## Instrucciones de Prueba

### 1. **Preparación**
```bash
npm run dev:full
```

### 2. **Abrir dos ventanas del navegador**
- Ventana 1: `http://localhost:3000` (Jugador 1)
- Ventana 2: `http://localhost:3000` (Jugador 2)

### 3. **Unirse al juego**
- En cada ventana, ingresar un nombre diferente
- Hacer click en "Unirse al Juego"

### 4. **Probar el sistema de muerte**

#### Paso 1: Verificar que los jugadores aparecen
- Deberías ver dos robots en la arena
- En la esquina superior derecha debería aparecer la lista de jugadores

#### Paso 2: Disparar hasta matar
- Con el Jugador 1, disparar al Jugador 2
- Se necesitan 2 disparos para matar (50 daño cada uno, 100 HP total)
- Observar los logs en la consola del navegador y del servidor

#### Paso 3: Verificar la pantalla de muerte
- Cuando el Jugador 2 muera, debería aparecer una pantalla roja
- Debería mostrar "¡TE HAN ELIMINADO!"
- Debería haber un contador de 5 segundos
- Después de 2 segundos, debería aparecer el botón de respawn

#### Paso 4: Verificar el respawn
- Esperar 5 segundos para respawn automático, O
- Hacer click en "¿QUIERES REAPARECER?" para respawn manual

## Logs a Observar

### En el Servidor (Terminal)
```
💥 Colisión detectada: [Nombre] recibió daño de 50
💔 [Nombre]: 100 -> 50 HP
💀 [Nombre] ha sido eliminado!
📤 Enviando estado de muerte para [Nombre]: { id: "...", isDead: true, deathTime: ... }
🔄 Respawn automático para [Nombre]
📤 Enviando estado de respawn para [Nombre]: { id: "...", isDead: false, health: 100 }
```

### En el Cliente (Consola del navegador)
```
🔍 Estado del jugador local: { name: "...", health: 100, isDead: false, deathTime: undefined }
💀 Jugador local murió!
🖥️ RespawnUI - Renderizando pantalla de muerte
🔄 Jugador local respawneó!
🖥️ RespawnUI - No visible
```

## Problemas Comunes y Soluciones

### 1. **La pantalla de muerte no aparece**
- Verificar que `isDead` se esté enviando como `true` desde el servidor
- Verificar que el estado se esté actualizando en el cliente
- Revisar los logs del servidor y cliente

### 2. **El jugador muerto puede seguir moviéndose**
- Verificar que el InputManager esté bloqueado
- Verificar que el servidor no esté procesando input de jugadores muertos

### 3. **Las colisiones no se detectan**
- Verificar que los proyectiles estén cerca de los jugadores
- Revisar el radio de colisión (0.8 unidades)
- Verificar las posiciones en los logs

### 4. **El respawn no funciona**
- Verificar que el evento `respawn` se esté enviando
- Verificar que el servidor esté procesando el respawn
- Revisar que las propiedades se estén actualizando correctamente

## Debug Adicional

### Verificar Estado del Jugador
En la consola del navegador, ejecutar:
```javascript
// Obtener el estado actual del juego
console.log('Estado del juego:', window.gameState)

// Verificar jugador local
const localPlayer = window.gameState?.players?.find(p => p.id === window.localPlayerId)
console.log('Jugador local:', localPlayer)
```

### Verificar Colisiones
En el servidor, los logs deberían mostrar:
```
🎯 Colisión detectada: [Nombre] <-> proyectil [ID]
📏 Distancia: 0.XX (límite: 0.8)
📍 Posiciones: jugador [x, y, z] | proyectil [x, y, z]
```

## Configuración Actual (Debug)

- **Salud del jugador**: 100 HP
- **Daño del proyectil**: 50 HP (aumentado para debug)
- **Disparos para matar**: 2
- **Tiempo de respawn automático**: 5 segundos
- **Radio de colisión**: 2.0 unidades (aumentado para debug)
- **Velocidad del proyectil**: 15 unidades/segundo 