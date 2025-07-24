import { GAME_CONFIG } from './gameConfig.js';

export class PhysicsManager {
  constructor(config = GAME_CONFIG) {
    this.config = config;
  }

  // Actualizar posición del jugador basado en input
  updatePlayer(player, input, deltaTime) {
    const updatedPlayer = { ...player };
    
    if (input.forward) {
      updatedPlayer.position[2] -= Math.cos(player.rotation[1]) * this.config.playerSpeed * deltaTime;
      updatedPlayer.position[0] -= Math.sin(player.rotation[1]) * this.config.playerSpeed * deltaTime;
    }
    if (input.backward) {
      updatedPlayer.position[2] += Math.cos(player.rotation[1]) * this.config.playerSpeed * deltaTime;
      updatedPlayer.position[0] += Math.sin(player.rotation[1]) * this.config.playerSpeed * deltaTime;
    }
    if (input.left) {
      updatedPlayer.rotation[1] += 2 * deltaTime;
    }
    if (input.right) {
      updatedPlayer.rotation[1] -= 2 * deltaTime;
    }
    
    return updatedPlayer;
  }

  // Actualizar proyectil
  updateProjectile(projectile, deltaTime) {
    const updatedProjectile = { ...projectile };
    
    updatedProjectile.position[0] += updatedProjectile.direction[0] * updatedProjectile.speed * deltaTime;
    updatedProjectile.position[2] += updatedProjectile.direction[2] * updatedProjectile.speed * deltaTime;
    
    updatedProjectile.lifetime -= deltaTime * 1000; // Convertir a milisegundos
    
    return updatedProjectile;
  }

  // Crear proyectil
  createProjectile(player, direction) {
    const [x, y, z] = player.position;
    const [rotX, rotY, rotZ] = player.rotation;

    const projectileX = x + Math.sin(rotY) * 1.2;
    const projectileZ = z + Math.cos(rotY) * 1.2;
    const projectileY = y + 0.5;

    const speed = this.config.projectileSpeed;
    const velocityX = Math.sin(rotY) * speed;
    const velocityZ = Math.cos(rotY) * speed;

    return {
      id: Math.random().toString(36).substr(2, 9),
      position: [projectileX, projectileY, projectileZ],
      direction: [velocityX, 0, velocityZ],
      ownerId: player.id,
      damage: this.config.projectileDamage,
      speed: this.config.projectileSpeed,
      lifetime: 5000 // 5 segundos
    };
  }

  // Verificar colisión entre jugador y proyectil
  checkCollision(player, projectile) {
    const dx = player.position[0] - projectile.position[0];
    const dz = player.position[2] - projectile.position[2];
    const distance = Math.sqrt(dx * dx + dz * dz);
    return distance < 1.5; // Radio de colisión
  }

  // Verificar límites de la arena
  checkArenaBounds(position) {
    const halfSize = this.config.arenaSize / 2;
    return {
      x: Math.max(-halfSize, Math.min(halfSize, position[0])),
      y: position[1],
      z: Math.max(-halfSize, Math.min(halfSize, position[2]))
    };
  }
} 