import { useState, useEffect, useRef, useCallback } from 'react'
import { GameWorld } from './game/GameWorld'
import { GameUI } from './components/GameUI'
import { RespawnUI } from './components/RespawnUI'
import { NetworkManager } from './game/NetworkManager'
import { GameState, Player, GameInput } from './types/game'

function App() {
  const [networkManager] = useState(() => new NetworkManager())
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    projectiles: [],
    gameTime: 0,
    isGameActive: false
  })
  const [localPlayerId, setLocalPlayerId] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isDead, setIsDead] = useState(false)
  const [deathTime, setDeathTime] = useState<number | null>(null)
  
  // Debug: log cuando cambia localPlayerId
  useEffect(() => {
    console.log('🔄 localPlayerId cambió a:', localPlayerId)
  }, [localPlayerId])
  
  // Función para verificar la muerte del jugador
  const checkPlayerDeath = useCallback((newGameState: GameState) => {
    if (!localPlayerId) {
      console.log('❌ No hay localPlayerId configurado para verificar muerte')
      return
    }
    
    const localPlayer = newGameState.players.find(p => p.id === localPlayerId)
    if (localPlayer) {
      console.log(`🔍 Estado del jugador local:`, {
        name: localPlayer.name,
        health: localPlayer.health,
        isDead: localPlayer.isDead,
        deathTime: localPlayer.deathTime,
        currentIsDead: isDead
      })
      
      // Detectar muerte
      if (localPlayer.isDead && !isDead) {
        console.log('💀 Jugador local murió!')
        setIsDead(true)
        setDeathTime(localPlayer.deathTime || Date.now())
      } 
      // Detectar respawn
      else if (!localPlayer.isDead && isDead) {
        console.log('🔄 Jugador local respawneó!')
        setIsDead(false)
        setDeathTime(null)
      }
      // Mantener estado si ya está muerto
      else if (localPlayer.isDead && isDead) {
        console.log('💀 Jugador sigue muerto...')
      }
      // Mantener estado si está vivo
      else if (!localPlayer.isDead && !isDead) {
        console.log('✅ Jugador sigue vivo')
      }
    } else {
      console.log('❌ No se encontró jugador local en el estado del juego')
    }
  }, [localPlayerId, isDead])
  
  // Verificar muerte cuando cambie el estado del juego
  useEffect(() => {
    if (gameState.players.length > 0) {
      checkPlayerDeath(gameState)
    }
  }, [gameState, checkPlayerDeath])
  const lastInputRef = useRef<GameInput>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    shoot: false
  })

  useEffect(() => {
    // Conectar al servidor
    networkManager.connect()
      .then(() => {
        setIsConnected(true)
        console.log('Conectado al servidor')
      })
      .catch((error) => {
        console.error('Error al conectar:', error)
        setIsConnected(false)
      })

    // Configurar callbacks
    networkManager.onGameState((newGameState) => {
      console.log('🎮 Estado del juego actualizado:', newGameState)
      console.log('👥 Jugadores:', newGameState.players.map(p => `${p.name}: [${p.position.join(', ')}]`))
      setGameState(newGameState)
      
      // Lógica de respaldo para establecer localPlayerId si no se ha establecido
      if (!localPlayerId && networkManager.getSocketId()) {
        const socketId = networkManager.getSocketId()
        const localPlayer = newGameState.players.find(p => p.id === socketId)
        if (localPlayer) {
          console.log('🔄 Estableciendo localPlayerId por respaldo:', localPlayer.name, 'ID:', socketId)
          setLocalPlayerId(socketId)
        }
      }
    })

    networkManager.onPlayerJoin((player) => {
      console.log('🎯 Evento playerJoined recibido:', player)
      console.log('🎯 Socket ID actual:', networkManager.getSocketId())
      console.log('🎯 Comparación de IDs:', player.id === networkManager.getSocketId())
      
      if (player.id === networkManager.getSocketId()) {
        console.log('✅ Jugador local identificado:', player.name)
        setLocalPlayerId(player.id)
      } else {
        console.log('❌ No es el jugador local:', player.name)
      }
    })

    // Cleanup al desmontar
    return () => {
      networkManager.disconnect()
    }
  }, [networkManager])

  const handleJoinGame = (playerName: string) => {
    networkManager.joinGame(playerName)
  }

  const handlePlayerUpdate = (_player: Player) => {
    // Enviar input al servidor en lugar de solo actualizar localmente
    const currentInput = lastInputRef.current
    networkManager.sendInput(currentInput)
  }

  const handleShoot = () => {
    networkManager.shoot()
  }

  const handleRespawn = () => {
    networkManager.respawn()
  }

  // Función para actualizar el input y enviarlo al servidor
  const updateInput = (input: GameInput) => {
    lastInputRef.current = input
    if (isConnected && localPlayerId) {
      console.log('Enviando input desde App:', input)
      networkManager.sendInput(input)
    } else {
      console.log('No enviando input - no conectado:', { isConnected, localPlayerId: !!localPlayerId })
    }
  }

  // Calcular tiempo restante para respawn automático
  const timeRemaining = deathTime ? Math.max(0, 5000 - (Date.now() - deathTime)) : 0

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <GameWorld
        localPlayerId={localPlayerId || ''}
        gameState={gameState}
        onPlayerUpdate={handlePlayerUpdate}
        onShoot={handleShoot}
        onInputUpdate={updateInput}
      />
      
      <GameUI
        gameState={gameState}
        localPlayerId={localPlayerId}
        onJoinGame={handleJoinGame}
        isConnected={isConnected}
      />
      <RespawnUI
        isVisible={isDead}
        onRespawn={handleRespawn}
        timeRemaining={timeRemaining}
      />
    </div>
  )
}

export default App 