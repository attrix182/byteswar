import { Player, Projectile, GameInput, GameConfig } from '../types/game'
import { GAME_CONFIG } from '../utils/gameConfig'

export class PhysicsManager {
  private config: GameConfig

  constructor(config: GameConfig = GAME_CONFIG) {
    this.config = config
  }

  public updatePlayer(player: Player, input: GameInput, deltaTime: number): Player {
    const [x, y, z] = player.position
    const [rotX, rotY, rotZ] = player.rotation

    let newX = x
    let newZ = z
    let newRotY = rotY

    // Rotación más suave
    const rotationSpeed = 3.0 // radianes por segundo
    if (input.left) {
      newRotY += rotationSpeed * deltaTime
    }
    if (input.right) {
      newRotY -= rotationSpeed * deltaTime
    }

    // Movimiento más suave con aceleración
    const moveSpeed = 4.0 // unidades por segundo
    if (input.forward) {
      newX += Math.sin(newRotY) * moveSpeed * deltaTime
      newZ += Math.cos(newRotY) * moveSpeed * deltaTime
    }
    if (input.backward) {
      newX -= Math.sin(newRotY) * moveSpeed * deltaTime
      newZ -= Math.cos(newRotY) * moveSpeed * deltaTime
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
    const gravity = -2.0 // Gravedad reducida para proyectiles
    const newVy = vy + gravity * deltaTime

    // Verificar límites de la arena
    const halfArena = this.config.arenaSize / 2
    if (Math.abs(newX) > halfArena || Math.abs(newZ) > halfArena || newY > 15 || newY < -10) {
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

    const distance = Math.sqrt(
      Math.pow(px - projx, 2) + 
      Math.pow(py - projy, 2) + 
      Math.pow(pz - projz, 2)
    )

    const isColliding = distance < 2.0 // Radio de colisión aumentado para debug
    
    // Debug: log colisiones
    if (isColliding) {
      console.log(`🎯 Colisión detectada: ${player.name} <-> proyectil ${projectile.id}`)
      console.log(`📏 Distancia: ${distance.toFixed(2)} (límite: 0.8)`)
      console.log(`📍 Posiciones: jugador [${px.toFixed(2)}, ${py.toFixed(2)}, ${pz.toFixed(2)}] | proyectil [${projx.toFixed(2)}, ${projy.toFixed(2)}, ${projz.toFixed(2)}]`)
    }

    return isColliding
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
    const velocityY = 0.5 // Pequeño impulso hacia arriba

    // Agregar un poco de aleatoriedad para hacer el disparo más interesante
    const spread = 0.1 // Spread de 0.1 radianes
    const randomSpread = (Math.random() - 0.5) * spread
    const finalRotY = rotY + randomSpread

    const finalVelocityX = Math.sin(finalRotY) * speed
    const finalVelocityZ = Math.cos(finalRotY) * speed

    return {
      id: Math.random().toString(36).substr(2, 9),
      position: [projectileX, projectileY, projectileZ],
      velocity: [finalVelocityX, velocityY, finalVelocityZ],
      ownerId: player.id,
      damage: this.config.projectileDamage,
      lifetime: 8.0 // 8 segundos de vida para proyectiles más duraderos
    }
  }
} 