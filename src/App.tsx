import { useState, useEffect, useRef } from 'react'
import { GameWorld } from './game/GameWorld'
import { GameUI } from './components/GameUI'
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
    })

    networkManager.onPlayerJoin((player) => {
      if (player.id === networkManager.getSocketId()) {
        setLocalPlayerId(player.id)
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
    </div>
  )
}

export default App 