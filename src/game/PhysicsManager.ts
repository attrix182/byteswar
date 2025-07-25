import { Player, GameInput, Projectile } from '../types/game'
import { GAME_CONFIG } from '../utils/gameConfig'

export class PhysicsManager {
  private config = GAME_CONFIG

  public updatePlayer(player: Player, input: GameInput, deltaTime: number): Player {
    const [x, y, z] = player.position
    const [rotX, rotY, rotZ] = player.rotation

    let newX = x
    let newZ = z
    let newRotY = rotY

    // Rotación del mouse (horizontal)
/*     if (input.mouseX !== undefined && Math.abs(input.mouseX) > 0) {
      const mouseSensitivity = 0.008 // Sensibilidad más suave
      newRotY -= input.mouseX * mouseSensitivity
    } */

    // Movimiento WASD (A y D rotan al jugador)
    const moveSpeed = this.config.playerSpeed
    const rotationSpeed = 3.0 // radianes por segundo
    
    if (input.forward) {
      newX += Math.sin(newRotY) * moveSpeed * deltaTime
      newZ += Math.cos(newRotY) * moveSpeed * deltaTime
    }
    if (input.backward) {
      newX -= Math.sin(newRotY) * moveSpeed * deltaTime
      newZ -= Math.cos(newRotY) * moveSpeed * deltaTime
    }
    if (input.left) {
      // Rotar a la izquierda
      newRotY += rotationSpeed * deltaTime
    }
    if (input.right) {
      // Rotar a la derecha
      newRotY -= rotationSpeed * deltaTime
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

    // Aplicar velocidad
    const newX = x + vx * deltaTime
    const newY = y + vy * deltaTime
    const newZ = z + vz * deltaTime

    // Aplicar gravedad ligera
    const gravity = -1.0 // Gravedad reducida
    const newVy = vy + gravity * deltaTime

    // Verificar límites de la arena
    const halfArena = this.config.arenaSize / 2
    if (Math.abs(newX) > halfArena || Math.abs(newZ) > halfArena || newY > 10 || newY < -5) {
      return { ...projectile, lifetime: 0 }
    }

    return {
      ...projectile,
      position: [newX, newY, newZ],
      velocity: [vx, newVy, vz],
      lifetime: projectile.lifetime - deltaTime
    }
  }

  public checkCollision(player: Player, projectile: Projectile): boolean {
    const [px, py, pz] = player.position
    const [projx, projy, projz] = projectile.position

    // Distancia simple entre centros
    const distance = Math.sqrt(
      Math.pow(px - projx, 2) + 
      Math.pow(py - projy, 2) + 
      Math.pow(pz - projz, 2)
    )

    // Radio de colisión
    const collisionRadius = 1.0
    return distance < collisionRadius
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

    // Velocidad del proyectil con dirección hacia adelante
    const speed = this.config.projectileSpeed
    const velocityX = Math.sin(rotY) * speed
    const velocityZ = Math.cos(rotY) * speed
    const velocityY = 0.5 // Pequeño impulso hacia arriba

    return {
      id: Math.random().toString(36).substr(2, 9),
      position: [projectileX, projectileY, projectileZ],
      velocity: [velocityX, velocityY, velocityZ],
      ownerId: player.id,
      damage: this.config.projectileDamage,
      lifetime: 5.0 // 5 segundos de vida
    }
  }
} 