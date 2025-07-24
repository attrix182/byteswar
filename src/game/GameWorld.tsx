import React, { useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/cannon'
import { OrbitControls, Stats } from '@react-three/drei'
import { Robot } from '../components/Robot'
import { ProjectileComponent } from '../components/Projectile'
import { Arena } from '../components/Arena'
import { InputManager } from './InputManager'
import { PhysicsManager } from './PhysicsManager'
import { Player, GameState, GameInput } from '../types/game'
import { GAME_CONFIG, PLAYER_COLORS } from '../utils/gameConfig'

interface GameWorldProps {
  localPlayerId: string
  gameState: GameState
  onPlayerUpdate: (player: Player) => void
  onShoot: () => void
  onInputUpdate: (input: GameInput) => void
}

// Componente interno que maneja la lógica del juego
const GameLogic: React.FC<GameWorldProps> = ({
  localPlayerId,
  gameState,
  onPlayerUpdate,
  onShoot,
  onInputUpdate
}) => {
  const inputManager = useRef<InputManager>()
  const physicsManager = useRef<PhysicsManager>()
  const lastShootTime = useRef(0)
  const shootCooldown = 500 // 500ms entre disparos

  useEffect(() => {
    inputManager.current = new InputManager()
    physicsManager.current = new PhysicsManager()

    return () => {
      inputManager.current?.destroy()
    }
  }, [])

  // Mover la lógica de input fuera de useFrame
  useEffect(() => {
    const handleInput = () => {
      if (!inputManager.current || !physicsManager.current) return

      const input = inputManager.current.getInput()
      
      // Enviar input al servidor
      onInputUpdate(input)
      
      const localPlayer = gameState.players.find(p => p.id === localPlayerId)

      if (localPlayer) {
        // Actualizar jugador local para suavizar el movimiento
        const updatedPlayer = physicsManager.current.updatePlayer(localPlayer, input, 1/60)
        onPlayerUpdate(updatedPlayer)

        // Manejar disparos - enviar directamente al servidor
        if (input.shoot && Date.now() - lastShootTime.current > shootCooldown) {
          console.log('🔫 Disparo detectado, enviando al servidor')
          onShoot()
          lastShootTime.current = Date.now()
        }
      }
    }

    const interval = setInterval(handleInput, 1000 / 60) // 60 FPS
    return () => clearInterval(interval)
  }, [localPlayerId, gameState.players, onPlayerUpdate, onShoot, onInputUpdate])

  return null // Este componente no renderiza nada
}

// Componente de escena 3D
const Scene: React.FC<{ gameState: GameState; localPlayerId: string }> = ({ 
  gameState, 
  localPlayerId 
}) => {
  return (
    <>
      {/* Iluminación */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[0, 10, 0]} intensity={0.5} color="#4444ff" />

      {/* Física */}
      <Physics gravity={[0, -9.81, 0]}>
        {/* Arena */}
        <Arena />

        {/* Jugadores */}
        {gameState.players.map((player) => (
          <Robot
            key={player.id}
            player={player}
            isLocal={player.id === localPlayerId}
          />
        ))}

        {/* Proyectiles */}
        {gameState.projectiles.map((projectile) => (
          <ProjectileComponent
            key={projectile.id}
            projectile={projectile}
          />
        ))}
      </Physics>

      {/* Controles de cámara */}
      <OrbitControls
        target={[0, 0, 0]}
        maxPolarAngle={Math.PI / 2}
        minDistance={10}
        maxDistance={50}
      />

      {/* Estadísticas de rendimiento */}
      <Stats />
    </>
  )
}

export const GameWorld: React.FC<GameWorldProps> = (props) => {
  return (
    <>
      {/* Lógica del juego fuera del Canvas */}
      <GameLogic {...props} />
      
      {/* Canvas 3D */}
      <Canvas
        shadows
        camera={{ position: [0, 15, 20], fov: 60 }}
        style={{ background: '#1a1a1a' }}
      >
        <Scene gameState={props.gameState} localPlayerId={props.localPlayerId} />
      </Canvas>
    </>
  )
} 