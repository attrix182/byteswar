import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

// Configuración del juego
const GAME_CONFIG = {
  playerSpeed: 5,
  projectileSpeed: 20,
  projectileDamage: 25,
  arenaSize: 50,
  maxPlayers: 8
}

// Tipos de datos
class Player {
  constructor(id, name) {
    this.id = id
    this.name = name
    this.position = [10, 0.5, 0]
    this.rotation = [0, 0, 0]
    this.health = 100
    this.maxHealth = 100
    this.color = this.getRandomColor()
    this.score = 0
  }

  getRandomColor() {
    const colors = ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff', '#44ffff']
    return colors[Math.floor(Math.random() * colors.length)]
  }
}

class Projectile {
  constructor(id, position, velocity, ownerId, damage) {
    this.id = id
    this.position = position
    this.velocity = velocity
    this.ownerId = ownerId
    this.damage = damage
    this.lifetime = 5.0
  }
}

class PhysicsManager {
  constructor(config = GAME_CONFIG) {
    this.config = config
  }

  createProjectile(player, direction) {
    const [x, y, z] = player.position
    const [rotX, rotY, rotZ] = player.rotation

    const projectileX = x + Math.sin(rotY) * 1.2
    const projectileZ = z + Math.cos(rotY) * 1.2
    const projectileY = y + 0.5

    const speed = this.config.projectileSpeed
    const velocityX = Math.sin(rotY) * speed
    const velocityZ = Math.cos(rotY) * speed

    return new Projectile(
      Math.random().toString(36).substr(2, 9),
      [projectileX, projectileY, projectileZ],
      [velocityX, 0, velocityZ],
      player.id,
      this.config.projectileDamage
    )
  }
}

// Estado del juego
const gameState = {
  players: [],
  projectiles: [],
  gameTime: 0,
  isGameActive: false
}

const connectedPlayers = new Map()
const physicsManager = new PhysicsManager()

// Configurar servidor
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: ["http://byteswar.31.97.151.147.sslip.io", "https://byteswar.31.97.151.147.sslip.io", "http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
    credentials: true
  }
})

// Middleware
app.use(cors())
app.use(express.json())

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

// Socket.IO events
io.on('connection', (socket) => {
  console.log(`Jugador conectado: ${socket.id}`)

  socket.on('joinGame', (playerName) => {
    const player = new Player(socket.id, playerName)
    gameState.players.push(player)
    connectedPlayers.set(socket.id, { player, lastInput: null })
    
    if (gameState.players.length >= 1 && !gameState.isGameActive) {
      gameState.isGameActive = true
    }

    socket.emit('playerJoined', player)
    io.emit('gameState', gameState)
    
    console.log(`${player.name} se unió al juego`)
  })

  socket.on('playerInput', (input) => {
    const playerData = connectedPlayers.get(socket.id)
    if (playerData) {
      playerData.lastInput = input
      
      // Movimiento suavizado
      if (input.forward) {
        playerData.player.position[2] -= 0.1
      }
      if (input.backward) {
        playerData.player.position[2] += 0.1
      }
      if (input.left) {
        playerData.player.position[0] -= 0.1
      }
      if (input.right) {
        playerData.player.position[0] += 0.1
      }
      
      const gamePlayerIndex = gameState.players.findIndex(p => p.id === socket.id)
      if (gamePlayerIndex !== -1) {
        gameState.players[gamePlayerIndex] = playerData.player
        io.emit('gameState', gameState)
      }
    }
  })

  socket.on('shoot', () => {
    const playerData = connectedPlayers.get(socket.id)
    if (playerData && gameState.isGameActive) {
      const projectile = physicsManager.createProjectile(playerData.player, [0, 0, 1])
      gameState.projectiles.push(projectile)
      io.emit('gameState', gameState)
    }
  })

  socket.on('disconnect', () => {
    console.log(`Jugador desconectado: ${socket.id}`)
    
    const playerData = connectedPlayers.get(socket.id)
    if (playerData) {
      gameState.players = gameState.players.filter(p => p.id !== socket.id)
      connectedPlayers.delete(socket.id)
      
      if (gameState.players.length < 1) {
        gameState.isGameActive = false
      }
      
      io.emit('gameState', gameState)
    }
  })
})

// Loop del juego
setInterval(() => {
  if (gameState.isGameActive) {
    gameState.gameTime += 1/60
    
    // Actualizar proyectiles
    gameState.projectiles = gameState.projectiles.filter(projectile => {
      projectile.lifetime -= 1/60
      return projectile.lifetime > 0
    })
    
    // Enviar estado actualizado
    io.emit('gameState', gameState)
  }
}, 1000 / 60)

console.log('🎮 Servidor del juego inicializado') 