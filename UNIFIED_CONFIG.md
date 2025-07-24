# Configuración Unificada del Juego

## Problema Resuelto

Antes había múltiples archivos de configuración que se pisaban entre sí:
- `src/utils/gameConfig.ts`
- `src/config/environment.ts` (con configuración duplicada)
- `server/gameConfig.js` (archivo JavaScript)

## Solución Implementada

### 1. **Archivo Principal: `src/utils/gameConfig.ts`**
```typescript
export const GAME_CONFIG: GameConfig = {
  // Tamaño de la arena
  arenaSize: 50,
  
  // Configuración del jugador
  playerSpeed: 5,
  playerHealth: 100,
  
  // Configuración de proyectiles
  projectileSpeed: 15,
  projectileDamage: 50, // Aumentado para debug
  
  // Configuración de respawn
  respawnTime: 5000, // 5 segundos
  
  // Configuración adicional
  maxPlayers: 8,
  gameTickRate: 60
}
```

### 2. **Tipo Actualizado: `src/types/game.ts`**
```typescript
export interface GameConfig {
  arenaSize: number
  playerSpeed: number
  projectileSpeed: number
  projectileDamage: number
  playerHealth: number
  respawnTime: number
  maxPlayers: number
  gameTickRate: number
}
```

### 3. **Configuración de Entorno: `src/config/environment.ts`**
```typescript
import { GAME_CONFIG } from '../utils/gameConfig'

export const ENV_CONFIG = {
  SERVER_URL: import.meta.env.PROD
    ? 'http://byteswar.31.97.151.147.sslip.io'
    : window.location.origin,
  
  // Usar la configuración unificada
  GAME_CONFIG,
  
  DEV: {
    debug: import.meta.env.DEV,
    showStats: import.meta.env.DEV,
    logLevel: import.meta.env.PROD ? 'error' : 'debug'
  }
}
```

## Configuración Actual

### **Arena**
- **Tamaño**: 50x50 unidades
- **Forma**: Cuadrada

### **Jugador**
- **Velocidad**: 5 unidades/segundo
- **Salud**: 100 HP
- **Máximo de jugadores**: 8

### **Proyectiles**
- **Velocidad**: 15 unidades/segundo
- **Daño**: 50 HP (aumentado para debug)
- **Disparos para matar**: 2 (100 HP ÷ 50 daño)

### **Respawn**
- **Tiempo automático**: 5 segundos
- **Posición**: Aleatoria dentro de la arena

### **Rendimiento**
- **Tick rate**: 60 FPS
- **Interpolación**: Suave para movimiento remoto

## Archivos que Usan la Configuración

### **Servidor**
- `src/server/gameServer.ts` - Importa `GAME_CONFIG` de `../utils/gameConfig`

### **Cliente**
- `src/game/PhysicsManager.ts` - Usa `GAME_CONFIG` para física
- `src/components/Arena.tsx` - Usa `arenaSize` para el tamaño
- `src/config/environment.ts` - Re-exporta `GAME_CONFIG`

## Ventajas de la Unificación

1. **Una sola fuente de verdad**: Todos los valores vienen de `src/utils/gameConfig.ts`
2. **Fácil mantenimiento**: Cambiar un valor lo actualiza en todo el juego
3. **Consistencia**: No hay conflictos entre diferentes configuraciones
4. **TypeScript**: Tipado completo para evitar errores

## Cómo Modificar la Configuración

Para cambiar cualquier valor del juego, solo edita `src/utils/gameConfig.ts`:

```typescript
// Ejemplo: Hacer el juego más fácil
export const GAME_CONFIG: GameConfig = {
  arenaSize: 50,
  playerSpeed: 8,        // Más rápido
  playerHealth: 150,     // Más salud
  projectileSpeed: 20,   // Proyectiles más rápidos
  projectileDamage: 30,  // Menos daño
  respawnTime: 3000,     // Respawn más rápido
  maxPlayers: 8,
  gameTickRate: 60
}
```

## Configuración de Debug Actual

Para facilitar las pruebas, la configuración actual tiene:
- **Daño alto**: 50 HP por disparo (2 disparos para matar)
- **Radio de colisión aumentado**: 2.0 unidades
- **Respawn automático**: 5 segundos

Esto hace que sea más fácil probar el sistema de muerte y respawn. 