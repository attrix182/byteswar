import { GameConfig } from '../types/game'

export const GAME_CONFIG: GameConfig = {
  arenaSize: 50,
  playerSpeed: 5,
  projectileSpeed: 15,
  projectileDamage: 25,
  playerHealth: 100,
  respawnTime: 3000
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