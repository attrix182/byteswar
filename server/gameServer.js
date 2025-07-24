import { PhysicsManager } from './PhysicsManager.js';
import { GAME_CONFIG, PLAYER_COLORS } from './gameConfig.js';

export class GameServer {
  constructor(io) {
    this.io = io;
    this.gameState = {
      players: [],
      projectiles: [],
      gameTime: 0,
      isGameActive: false
    };
    this.physicsManager = new PhysicsManager();
    this.connectedPlayers = new Map();
    this.gameLoop = null;
    this.lastUpdate = Date.now();
    
    // Iniciar el loop del juego
    this.startGameLoop();
  }

  // Función para logging
  log(level, message, data) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    console.log(logMessage, data || '');
  }

  // Función para crear un nuevo jugador
  createPlayer(id, name) {
    const colorIndex = this.connectedPlayers.size % PLAYER_COLORS.length;
    const spawnAngle = (Math.PI * 2 * colorIndex) / Math.max(this.connectedPlayers.size, 1);
    const spawnRadius = 10;

    return {
      id,
      name,
      position: [
        Math.cos(spawnAngle) * spawnRadius,
        0.5,
        Math.sin(spawnAngle) * spawnRadius
      ],
      rotation: [0, spawnAngle + Math.PI, 0],
      health: GAME_CONFIG.playerHealth,
      maxHealth: GAME_CONFIG.playerHealth,
      color: PLAYER_COLORS[colorIndex],
      isLocal: false
    };
  }

  // Agregar un nuevo jugador
  addPlayer(socket) {
    const playerName = `Player_${socket.id.slice(0, 6)}`;
    const player = this.createPlayer(socket.id, playerName);
    
    this.connectedPlayers.set(socket.id, {
      socket,
      player,
      lastInput: {
        forward: false,
        backward: false,
        left: false,
        right: false,
        shoot: false
      }
    });

    this.gameState.players.push(player);
    
    // Activar el juego si hay al menos 1 jugador
    if (this.gameState.players.length >= 1 && !this.gameState.isGameActive) {
      this.gameState.isGameActive = true;
      this.log('info', '🎮 Juego activado');
    }

    // Enviar estado inicial al jugador
    socket.emit('gameState', this.gameState);
    socket.emit('playerId', socket.id);
    
    this.log('info', `Jugador ${playerName} (${socket.id}) se unió al juego`);
  }

  // Remover un jugador
  removePlayer(playerId) {
    const playerData = this.connectedPlayers.get(playerId);
    if (playerData) {
      this.connectedPlayers.delete(playerId);
      
      // Remover del estado del juego
      this.gameState.players = this.gameState.players.filter(p => p.id !== playerId);
      
      this.log('info', `Jugador ${playerData.player.name} (${playerId}) se desconectó`);
      
      // Desactivar el juego si no hay jugadores
      if (this.gameState.players.length === 0) {
        this.gameState.isGameActive = false;
        this.log('info', '🎮 Juego desactivado - no hay jugadores');
      }
    }
  }

  // Manejar input del jugador
  handlePlayerInput(socket, input) {
    const playerData = this.connectedPlayers.get(socket.id);
    if (!playerData) return;

    // Actualizar el último input del jugador
    playerData.lastInput = { ...input };
    
    // Aplicar movimiento inmediatamente
    if (input.forward || input.backward || input.left || input.right) {
      const movementStep = 0.1; // Movimiento más suave
      
      if (input.forward) {
        playerData.player.position[2] -= Math.cos(playerData.player.rotation[1]) * movementStep;
        playerData.player.position[0] -= Math.sin(playerData.player.rotation[1]) * movementStep;
      }
      if (input.backward) {
        playerData.player.position[2] += Math.cos(playerData.player.rotation[1]) * movementStep;
        playerData.player.position[0] += Math.sin(playerData.player.rotation[1]) * movementStep;
      }
      if (input.left) {
        playerData.player.rotation[1] += 0.05;
      }
      if (input.right) {
        playerData.player.rotation[1] -= 0.05;
      }
      
      // Actualizar en el estado del juego
      const gamePlayerIndex = this.gameState.players.findIndex(p => p.id === socket.id);
      if (gamePlayerIndex !== -1) {
        this.gameState.players[gamePlayerIndex] = { ...playerData.player };
      }
      
      // Enviar estado actualizado inmediatamente
      this.io.emit('gameState', this.gameState);
    }
    
    // Manejar disparo
    if (input.shoot) {
      this.createProjectile(socket.id, playerData.player);
    }
  }

  // Crear proyectil
  createProjectile(ownerId, player) {
    const projectile = {
      id: `projectile_${Date.now()}_${Math.random()}`,
      ownerId,
      position: [...player.position],
      direction: [
        -Math.sin(player.rotation[1]),
        0,
        -Math.cos(player.rotation[1])
      ],
      speed: GAME_CONFIG.projectileSpeed,
      damage: GAME_CONFIG.projectileDamage,
      lifetime: 5000, // 5 segundos
      createdAt: Date.now()
    };
    
    this.gameState.projectiles.push(projectile);
    this.log('info', `Proyectil creado por ${player.name}`);
    
    // Enviar estado actualizado
    this.io.emit('gameState', this.gameState);
  }

  // Actualizar estado del juego
  updateGameState(deltaTime) {
    // Actualizar proyectiles
    this.gameState.projectiles = this.gameState.projectiles
      .map(projectile => this.updateProjectile(projectile, deltaTime))
      .filter(projectile => projectile.lifetime > 0);

    // Verificar colisiones
    this.gameState.projectiles = this.gameState.projectiles.filter(projectile => {
      const hitPlayer = this.gameState.players.find(player => 
        player.id !== projectile.ownerId && 
        this.checkCollision(player, projectile)
      );

      if (hitPlayer) {
        // Aplicar daño
        hitPlayer.health = Math.max(0, hitPlayer.health - projectile.damage);
        
        // Si el jugador murió, respawnear después de un tiempo
        if (hitPlayer.health <= 0) {
          setTimeout(() => {
            hitPlayer.health = GAME_CONFIG.playerHealth;
            hitPlayer.position = [
              (Math.random() - 0.5) * 20,
              0.5,
              (Math.random() - 0.5) * 20
            ];
          }, GAME_CONFIG.respawnTime);
        }
        
        return false; // Eliminar proyectil
      }
      
      return true;
    });

    this.gameState.gameTime += deltaTime;
  }

  // Actualizar proyectil
  updateProjectile(projectile, deltaTime) {
    const timeAlive = Date.now() - projectile.createdAt;
    projectile.lifetime = Math.max(0, 5000 - timeAlive);
    
    if (projectile.lifetime > 0) {
      projectile.position[0] += projectile.direction[0] * projectile.speed * deltaTime;
      projectile.position[2] += projectile.direction[2] * projectile.speed * deltaTime;
    }
    
    return projectile;
  }

  // Verificar colisión
  checkCollision(player, projectile) {
    const dx = player.position[0] - projectile.position[0];
    const dz = player.position[2] - projectile.position[2];
    const distance = Math.sqrt(dx * dx + dz * dz);
    return distance < 1.5; // Radio de colisión
  }

  // Iniciar loop del juego
  startGameLoop() {
    this.gameLoop = setInterval(() => {
      const now = Date.now();
      const deltaTime = (now - this.lastUpdate) / 1000;
      this.lastUpdate = now;
      
      if (this.gameState.isGameActive) {
        this.updateGameState(deltaTime);
        this.io.emit('gameState', this.gameState);
      }
    }, 1000 / 60); // 60 FPS
  }

  // Obtener número de jugadores
  getPlayerCount() {
    return this.gameState.players.length;
  }

  // Obtener número de proyectiles
  getProjectileCount() {
    return this.gameState.projectiles.length;
  }

  // Detener el servidor
  stop() {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
  }
} 