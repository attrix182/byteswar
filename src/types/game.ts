export interface Player {
  id: string
  name: string
  position: [number, number, number]
  rotation: [number, number, number]
  health: number
  maxHealth: number
  color: string
  isLocal: boolean
  isDead?: boolean
  deathTime?: number
}

export interface Projectile {
  id: string
  position: [number, number, number]
  velocity: [number, number, number]
  ownerId: string
  damage: number
  lifetime: number
}

export interface GameState {
  players: Player[]
  projectiles: Projectile[]
  gameTime: number
  isGameActive: boolean
}

export interface GameInput {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  shoot: boolean
  mouseX?: number
  mouseY?: number
}

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