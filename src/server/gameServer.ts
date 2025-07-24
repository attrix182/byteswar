import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { config } from 'dotenv'
import { GameState, Player, GameInput } from '../types/game'
import { GAME_CONFIG, PLAYER_COLORS } from '../utils/gameConfig'
import { PhysicsManager } from '../game/PhysicsManager'

// Cargar variables de entorno
config()

// Configuración desde variables de entorno
const PORT = process.env.PORT || 3001
const HOST = process.env.HOST || '0.0.0.0'
const NODE_ENV = process.env.NODE_ENV || 'development'
const DEBUG = process.env.DEBUG === 'true'
const LOG_LEVEL = process.env.LOG_LEVEL || 'info' // Nivel de logging configurable
const ENABLE_CORS = process.env.ENABLE_CORS !== 'false'
const CORS_ORIGINS = process.env.CORS_ORIGINS?.split(',') || ['*']
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000'
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001'

const app = express()
const httpServer = createServer(app)

// Configuración de CORS
const corsOptions = {
  origin: ENABLE_CORS ? CORS_ORIGINS : false,
  credentials: process.env.ENABLE_CREDENTIALS === 'true',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}

const io = new Server(httpServer, {
  cors: {
    origin: ENABLE_CORS ? CORS_ORIGINS : false,
    credentials: process.env.ENABLE_CREDENTIALS === 'true',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  },
  transports: ['polling', 'websocket']
})

app.use(cors(corsOptions))
app.use(express.json())

// Servir archivos estáticos del cliente construido
app.use(express.static('dist'))

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    players: gameState.players.length,
    projectiles: gameState.projectiles.length,
    gameActive: gameState.isGameActive
  })
})

// Ruta principal - servir el cliente
app.get('/', (_req, res) => {
  res.sendFile('dist/index.html', { root: '.' })
})

// Estado del juego
let gameState: GameState = {
  players: [],
  projectiles: [],
  gameTime: 0,
  isGameActive: false
}

const physicsManager = new PhysicsManager()
const connectedPlayers = new Map<string, { socket: any, player: Player, lastInput: GameInput }>()

// Función para logging
function log(level: string, message: string, data?: any) {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`
  
  // Determinar si debemos mostrar el log basado en LOG_LEVEL
  const shouldLog = 
    level === 'error' || 
    level === 'warn' || 
    (LOG_LEVEL === 'debug' && level === 'debug') ||
    (LOG_LEVEL === 'info' && (level === 'info' || level === 'warn' || level === 'error')) ||
    DEBUG
  
  if (shouldLog) {
    console.log(logMessage, data || '')
  }
}

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
    isLocal: false,
    isDead: false,
    deathTime: undefined
  }
}

// Función para actualizar el estado del juego
function updateGameState(deltaTime: number) {
  // Actualizar posiciones de jugadores basadas en su input
  connectedPlayers.forEach((playerData, playerId) => {
    if (gameState.isGameActive && !playerData.player.isDead) {
      const updatedPlayer = physicsManager.updatePlayer(
        playerData.player, 
        playerData.lastInput, 
        deltaTime
      )
      
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
    .map(projectile => {
      const updatedProjectile = physicsManager.updateProjectile(projectile, deltaTime)
      
      // Debug: log cuando un proyectil se destruye
      if (updatedProjectile.lifetime <= 0 && projectile.lifetime > 0) {
        console.log(`💥 Proyectil ${projectile.id} destruido por tiempo/límites`)
      }
      
      return updatedProjectile
    })
    .filter(projectile => projectile.lifetime > 0)

  // Verificar colisiones
  gameState.projectiles = gameState.projectiles.filter(projectile => {
    const hitPlayer = gameState.players.find(player => 
      player.id !== projectile.ownerId && 
      physicsManager.checkCollision(player, projectile)
    )

    if (hitPlayer) {
      console.log(`💥 Colisión detectada: ${hitPlayer.name} recibió daño de ${projectile.damage}`)
      
      // Aplicar daño
      const oldHealth = hitPlayer.health
      hitPlayer.health = Math.max(0, hitPlayer.health - projectile.damage)
      console.log(`💔 ${hitPlayer.name}: ${oldHealth} -> ${hitPlayer.health} HP`)
      
      // Si el jugador murió, programar respawn
      if (hitPlayer.health <= 0) {
        console.log(`💀 ${hitPlayer.name} ha sido eliminado!`)
        
        // Marcar como muerto
        hitPlayer.isDead = true
        hitPlayer.deathTime = Date.now()
        
        console.log(`📤 Enviando estado de muerte para ${hitPlayer.name}:`, {
          id: hitPlayer.id,
          isDead: hitPlayer.isDead,
          deathTime: hitPlayer.deathTime
        })
        
        // Enviar estado actualizado inmediatamente para mostrar la pantalla de muerte
        io.emit('gameState', gameState)
        
        // Programar respawn automático después de 5 segundos
        setTimeout(() => {
          if (hitPlayer.health <= 0) { // Solo respawnear si aún está muerto
            console.log(`🔄 Respawn automático para ${hitPlayer.name}`)
            hitPlayer.health = GAME_CONFIG.playerHealth
            hitPlayer.isDead = false
            hitPlayer.deathTime = undefined
            
            // Posición de respawn aleatoria
            hitPlayer.position = [
              (Math.random() - 0.5) * 20,
              0.5,
              (Math.random() - 0.5) * 20
            ]
            
            console.log(`📤 Enviando estado de respawn para ${hitPlayer.name}:`, {
              id: hitPlayer.id,
              isDead: hitPlayer.isDead,
              health: hitPlayer.health
            })
            
            // Enviar estado actualizado
            io.emit('gameState', gameState)
          }
        }, 5000) // 5 segundos
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
    updateGameState(1/30) // 30 FPS consistente
    io.emit('gameState', gameState)
  }
}, 1000 / 30) // 30 FPS para reducir sobrecarga de red

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
    
    console.log(`📤 Enviando playerJoined a ${socket.id}:`, player)
    socket.emit('playerJoined', player)
    io.emit('gameState', gameState)
    
    log('info', `${player.name} se unió al juego`)
  })

  // Actualizar input del jugador
  socket.on('playerInput', (input: GameInput) => {
    const playerData = connectedPlayers.get(socket.id)
    if (playerData) {
      // Solo procesar input si el jugador no está muerto
      if (!playerData.player.isDead) {
        playerData.lastInput = input
      } else {
        // Si está muerto, resetear el input
        playerData.lastInput = {
          forward: false,
          backward: false,
          left: false,
          right: false,
          shoot: false
        }
      }
    } else {
      console.log('ERROR: No se encontró playerData para socket:', socket.id)
    }
  })

  // Disparar proyectil
  socket.on('shoot', () => {
    const playerData = connectedPlayers.get(socket.id)
    if (playerData && gameState.isGameActive && !playerData.player.isDead) {
      console.log(`💥 Creando proyectil para ${playerData.player.name}`)
      const projectile = physicsManager.createProjectile(playerData.player, [0, 0, 1])
      gameState.projectiles.push(projectile)
      
      // Enviar estado actualizado inmediatamente con el nuevo proyectil
      io.emit('gameState', gameState)
      
      // Log para debug
      console.log(`🚀 Proyectil creado:`, {
        id: projectile.id,
        position: projectile.position,
        velocity: projectile.velocity,
        total: gameState.projectiles.length
      })
    } else {
      console.log('❌ No se pudo crear proyectil:', { 
        playerData: !!playerData, 
        isGameActive: gameState.isGameActive,
        isDead: playerData?.player.isDead
      })
    }
  })

  // Respawn manual
  socket.on('respawn', () => {
    const playerData = connectedPlayers.get(socket.id)
    if (playerData && playerData.player.isDead) {
      console.log(`🔄 Respawn manual para ${playerData.player.name}`)
      
      // Respawnear al jugador
      playerData.player.health = GAME_CONFIG.playerHealth
      playerData.player.isDead = false
      playerData.player.deathTime = undefined
      
      // Posición de respawn aleatoria
      playerData.player.position = [
        (Math.random() - 0.5) * 20,
        0.5,
        (Math.random() - 0.5) * 20
      ]
      
      // Enviar estado actualizado
      io.emit('gameState', gameState)
    }
  })

  // Desconexión
  socket.on('disconnect', () => {
    log('info', `Jugador desconectado: ${socket.id}`)
    
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
    isGameActive: gameState.isGameActive,
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
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

// Health check endpoint
app.get(process.env.HEALTH_CHECK_ENDPOINT || '/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'BytesWar Game Server',
    version: '1.0.0',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    players: gameState.players.length
  })
})

httpServer.listen(PORT, () => {
  log('info', '🎮 Servidor del juego inicializado')
  log('info', `🚀 BytesWar servidor de ${NODE_ENV} ejecutándose en ${HOST}:${PORT}`)
  log('info', `🌐 Cliente disponible en: ${CLIENT_URL}`)
  log('info', `📊 Health check en: ${SERVER_URL}${process.env.HEALTH_CHECK_ENDPOINT || '/health'}`)
  log('info', `🔧 API disponible en: ${SERVER_URL}/api`)
  log('info', `🔒 CORS habilitado: ${ENABLE_CORS}`)
  log('info', `🐛 Debug mode: ${DEBUG}`)
}) 