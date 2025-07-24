import { GameConfig } from '../types/game'

export const GAME_CONFIG: GameConfig = {
  // Tamaño de la arena
  arenaSize: 120,
  
  // Configuración del jugador
  playerSpeed: 10,
  playerHealth: 100,
  
  // Configuración de proyectiles
  projectileSpeed: 15,
  projectileDamage: 10, // Aumentado para debug
  
  // Configuración de respawn
  respawnTime: 5000, // 5 segundos
  
  // Configuración adicional
  maxPlayers: 8,
  gameTickRate: 60
}

export const PLAYER_COLORS = [
  '#ff4444', // Rojo
  '#44ff44', // Verde
  '#4444ff', // Azul
  '#ffff44', // Amarillo
  '#ff44ff', // Magenta
  '#44ffff', // Cyan
  '#ff8844', // Naranja
  '#8844ff'  // Púrpura
] 