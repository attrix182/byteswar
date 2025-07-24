import { Player, Projectile, GameInput, GameConfig } from '../types/game'
import { GAME_CONFIG } from '../utils/gameConfig'

export class PhysicsManager {
  private config: GameConfig

  constructor(config: GameConfig = GAME_CONFIG) {
    this.config = config
  }

  public updatePlayer(player: Player, input: GameInput, deltaTime: number): Player {
    const speed = this.config.playerSpeed * deltaTime
    const [x, y, z] = player.position
    const [rotX, rotY, rotZ] = player.rotation

    let newX = x
    let newZ = z
    let newRotY = rotY

    // Rotación
    if (input.left) {
      newRotY += speed * 2
    }
    if (input.right) {
      newRotY -= speed * 2
    }

    // Movimiento
    if (input.forward) {
      newX += Math.sin(newRotY) * speed
      newZ += Math.cos(newRotY) * speed
    }
    if (input.backward) {
      newX -= Math.sin(newRotY) * speed
      newZ -= Math.cos(newRotY) * speed
    }

    // Limitar posición dentro de la arena
    const halfArena = this.config.arenaSize / 2 - 1
    newX = Math.max(-halfArena, Math.min(halfArena, newX))
    newZ = Math.max(-halfArena, Math.min(halfArena, newZ))

    return {
      ...player,
      position: [newX, y, newZ],
      rotation: [rotX, newRotY, rotZ]
    }
  }

  public updateProjectile(projectile: Projectile, deltaTime: number): Projectile {
    const [x, y, z] = projectile.position
    const [vx, vy, vz] = projectile.velocity

    const newX = x + vx * deltaTime
    const newY = y + vy * deltaTime
    const newZ = z + vz * deltaTime

    // Verificar límites de la arena
    const halfArena = this.config.arenaSize / 2
    if (Math.abs(newX) > halfArena || Math.abs(newZ) > halfArena || newY > 10 || newY < -5) {
      return { ...projectile, lifetime: 0 }
    }

    return {
      ...projectile,
      position: [newX, newY, newZ],
      lifetime: projectile.lifetime - deltaTime
    }
  }

  public checkCollision(player: Player, projectile: Projectile): boolean {
    const [px, py, pz] = player.position
    const [projx, projy, projz] = projectile.position

    const distance = Math.sqrt(
      Math.pow(px - projx, 2) + 
      Math.pow(py - projy, 2) + 
      Math.pow(pz - projz, 2)
    )

    return distance < 0.8 // Radio de colisión del robot
  }

  public createProjectile(
    player: Player, 
    _direction: [number, number, number]
  ): Projectile {
    const [x, y, z] = player.position
    const [_rotX, rotY, _rotZ] = player.rotation

    // Posición inicial del proyectil (en el cañón)
    const projectileX = x + Math.sin(rotY) * 1.2
    const projectileZ = z + Math.cos(rotY) * 1.2
    const projectileY = y + 0.5

    // Velocidad del proyectil
    const speed = this.config.projectileSpeed
    const velocityX = Math.sin(rotY) * speed
    const velocityZ = Math.cos(rotY) * speed

    return {
      id: Math.random().toString(36).substr(2, 9),
      position: [projectileX, projectileY, projectileZ],
      velocity: [velocityX, 0, velocityZ],
      ownerId: player.id,
      damage: this.config.projectileDamage,
      lifetime: 5.0 // 5 segundos de vida
    }
  }
} 