import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { GameState, Player, GameInput } from '../types/game'
import { GAME_CONFIG, PLAYER_COLORS } from '../utils/gameConfig'
import { PhysicsManager } from '../game/PhysicsManager'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

app.use(cors())
app.use(express.json())

// Estado del juego
let gameState: GameState = {
  players: [],
  projectiles: [],
  gameTime: 0,
  isGameActive: false
}

const physicsManager = new PhysicsManager()
const connectedPlayers = new Map<string, { socket: any, player: Player, lastInput: GameInput }>()

// Función para crear un nuevo jugador
function createPlayer(id: string, name: string): Player {
  const colorIndex = connectedPlayers.size % PLAYER_COLORS.length
  const spawnAngle = (Math.PI * 2 * colorIndex) / Math.max(connectedPlayers.size, 1)
  const spawnRadius = 10

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
  }
}

// Función para actualizar el estado del juego
function updateGameState(deltaTime: number) {
  // Actualizar posiciones de jugadores basadas en su input
  connectedPlayers.forEach((playerData, playerId) => {
    if (gameState.isGameActive) {
      const updatedPlayer = physicsManager.updatePlayer(
        playerData.player, 
        playerData.lastInput, 
        deltaTime
      )
      
      // Debug: solo log si hay movimiento
      if (playerData.lastInput.forward || playerData.lastInput.backward || 
          playerData.lastInput.left || playerData.lastInput.right) {
        console.log(`Actualizando ${playerData.player.name}:`, {
          oldPos: playerData.player.position,
          newPos: updatedPlayer.position,
          input: playerData.lastInput
        })
      }
      
      playerData.player = updatedPlayer
      
      // Actualizar en el estado del juego
      const gamePlayerIndex = gameState.players.findIndex(p => p.id === playerId)
      if (gamePlayerIndex !== -1) {
        gameState.players[gamePlayerIndex] = updatedPlayer
      }
    }
  })

  // Actualizar proyectiles
  gameState.projectiles = gameState.projectiles
    .map(projectile => physicsManager.updateProjectile(projectile, deltaTime))
    .filter(projectile => projectile.lifetime > 0)

  // Verificar colisiones
  gameState.projectiles = gameState.projectiles.filter(projectile => {
    const hitPlayer = gameState.players.find(player => 
      player.id !== projectile.ownerId && 
      physicsManager.checkCollision(player, projectile)
    )

    if (hitPlayer) {
      // Aplicar daño
      hitPlayer.health = Math.max(0, hitPlayer.health - projectile.damage)
      
      // Si el jugador murió, respawnear después de un tiempo
      if (hitPlayer.health <= 0) {
        setTimeout(() => {
          hitPlayer.health = GAME_CONFIG.playerHealth
          hitPlayer.position = [
            (Math.random() - 0.5) * 20,
            0.5,
            (Math.random() - 0.5) * 20
          ]
        }, GAME_CONFIG.respawnTime)
      }
      
      return false // Eliminar proyectil
    }
    
    return true
  })

  gameState.gameTime += deltaTime
}

// Loop del juego
setInterval(() => {
  if (gameState.isGameActive) {
    updateGameState(1/60) // 60 FPS
    io.emit('gameState', gameState)
  }
}, 1000 / 60)

// Manejo de conexiones Socket.IO
io.on('connection', (socket) => {
  console.log(`Jugador conectado: ${socket.id}`)

  // Unirse al juego
  socket.on('joinGame', (playerName: string) => {
    const player = createPlayer(socket.id, playerName || `Player${socket.id.slice(0, 4)}`)
    
    connectedPlayers.set(socket.id, { 
      socket, 
      player, 
      lastInput: {
        forward: false,
        backward: false,
        left: false,
        right: false,
        shoot: false
      }
    })
    gameState.players.push(player)
    
    // Activar el juego si hay al menos 1 jugador (para pruebas)
    if (gameState.players.length >= 1) {
      gameState.isGameActive = true
    }
    
    socket.emit('playerJoined', player)
    io.emit('gameState', gameState)
    
    console.log(`${player.name} se unió al juego`)
  })

  // Actualizar input del jugador
  socket.on('playerInput', (input: GameInput) => {
    console.log(`Socket ${socket.id} envió input:`, input)
    const playerData = connectedPlayers.get(socket.id)
    if (playerData) {
      playerData.lastInput = input
      console.log(`Input guardado para ${playerData.player.name}:`, input)
      
      // MOVIMIENTO INMEDIATO Y SIMPLE
      if (input.forward) {
        playerData.player.position[2] -= 0.1 // Mover hacia adelante (más suave)
        console.log(`MOVIMIENTO: ${playerData.player.name} se movió hacia adelante`)
      }
      if (input.backward) {
        playerData.player.position[2] += 0.1 // Mover hacia atrás (más suave)
        console.log(`MOVIMIENTO: ${playerData.player.name} se movió hacia atrás`)
      }
      if (input.left) {
        playerData.player.position[0] -= 0.1 // Mover hacia la izquierda (más suave)
        console.log(`MOVIMIENTO: ${playerData.player.name} se movió hacia la izquierda`)
      }
      if (input.right) {
        playerData.player.position[0] += 0.1 // Mover hacia la derecha (más suave)
        console.log(`MOVIMIENTO: ${playerData.player.name} se movió hacia la derecha`)
      }
      
      // Actualizar en el estado del juego inmediatamente
      const gamePlayerIndex = gameState.players.findIndex(p => p.id === socket.id)
      if (gamePlayerIndex !== -1) {
        gameState.players[gamePlayerIndex] = playerData.player
        console.log(`Estado actualizado para ${playerData.player.name}:`, playerData.player.position)
        
        // ENVIAR EL ESTADO ACTUALIZADO INMEDIATAMENTE
        io.emit('gameState', gameState)
        console.log(`Estado enviado a todos los clientes`)
      }
    } else {
      console.log('ERROR: No se encontró playerData para socket:', socket.id)
      console.log('Jugadores conectados:', Array.from(connectedPlayers.keys()))
    }
  })

  // Disparar proyectil
  socket.on('shoot', () => {
    console.log(`🔫 Disparo recibido de ${socket.id}`)
    const playerData = connectedPlayers.get(socket.id)
    if (playerData && gameState.isGameActive) {
      console.log(`💥 Creando proyectil para ${playerData.player.name}`)
      const projectile = physicsManager.createProjectile(playerData.player, [0, 0, 1])
      gameState.projectiles.push(projectile)
      console.log(`🚀 Proyectil creado, total: ${gameState.projectiles.length}`)
      
      // Enviar estado actualizado con el nuevo proyectil
      io.emit('gameState', gameState)
    } else {
      console.log('❌ No se pudo crear proyectil:', { 
        playerData: !!playerData, 
        isGameActive: gameState.isGameActive 
      })
    }
  })

  // Desconexión
  socket.on('disconnect', () => {
    console.log(`Jugador desconectado: ${socket.id}`)
    
    const playerData = connectedPlayers.get(socket.id)
    if (playerData) {
      gameState.players = gameState.players.filter(p => p.id !== socket.id)
      connectedPlayers.delete(socket.id)
      
      // Desactivar el juego si no hay jugadores
      if (gameState.players.length < 1) {
        gameState.isGameActive = false
      }
      
      io.emit('gameState', gameState)
    }
  })
})

// Rutas de la API
app.get('/api/status', (_req, res) => {
  res.json({
    status: 'running',
    players: gameState.players.length,
    isGameActive: gameState.isGameActive
  })
})

app.get('/api/players', (_req, res) => {
  res.json(gameState.players.map(p => ({
    id: p.id,
    name: p.name,
    health: p.health,
    color: p.color
  })))
})

const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`Servidor de BytesWar ejecutándose en puerto ${PORT}`)
  console.log(`API disponible en http://localhost:${PORT}/api`)
}) 