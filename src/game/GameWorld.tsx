import React, { useRef, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/cannon'
import { OrbitControls, Stats } from '@react-three/drei'
import { Robot } from '../components/Robot'
import { ProjectileComponent } from '../components/Projectile'
import { ShootEffect } from '../components/ShootEffect'
import { DeathExplosion } from '../components/DeathExplosion'
import { Arena } from '../components/Arena'
import { InputManager } from './InputManager'
import { PhysicsManager } from './PhysicsManager'
import { Player, GameState, GameInput } from '../types/game'

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
  const [deathExplosions, setDeathExplosions] = useState<Array<{
    id: string
    position: [number, number, number]
  }>>([])

  useEffect(() => {
    inputManager.current = new InputManager()
    physicsManager.current = new PhysicsManager()

    return () => {
      inputManager.current?.destroy()
    }
  }, [])

  // Detectar muertes y crear explosiones
  useEffect(() => {
    gameState.players.forEach(player => {
      if (player.isDead && player.deathTime) {
        // Verificar si ya existe una explosión para este jugador
        const existingExplosion = deathExplosions.find(exp => exp.id === `death-${player.id}`)
        if (!existingExplosion) {
          console.log(`💥 Creando explosión de muerte para ${player.name}`)
          setDeathExplosions(prev => [...prev, {
            id: `death-${player.id}`,
            position: [...player.position] as [number, number, number]
          }])
        }
      }
    })
  }, [gameState, deathExplosions])

  // Manejar input del jugador
  useEffect(() => {
    const handleInput = () => {
      if (!inputManager.current || !physicsManager.current) return

      const localPlayer = gameState.players.find(p => p.id === localPlayerId)

      if (localPlayer) {
        // Bloquear/desbloquear input basado en el estado de muerte
        inputManager.current.setBlocked(localPlayer.isDead || false)
        
        // Solo procesar input si el jugador no está muerto
        if (!localPlayer.isDead) {
          const input = inputManager.current.getInput()
          
          // Debug: verificar si hay input de movimiento
          if (input.forward || input.backward || input.left || input.right) {
            console.log('🎮 Input de movimiento detectado:', input)
          }
          
          // Actualizar posición local para movimiento inmediato
          const deltaTime = 1/60 // 60 FPS
          const updatedPlayer = physicsManager.current.updatePlayer(localPlayer, input, deltaTime)
          onPlayerUpdate(updatedPlayer)

          // Enviar input al servidor (solo una vez)
          onInputUpdate(input)

          // Manejar disparos
          if (input.shoot && Date.now() - lastShootTime.current > shootCooldown) {
            console.log('🔫 Disparo detectado, enviando al servidor')
            onShoot()
            lastShootTime.current = Date.now()
          }
          
          // Reset del cooldown si no está disparando
          if (!input.shoot) {
            lastShootTime.current = 0
          }
        } else {
          console.log('💀 Jugador muerto, input bloqueado')
        }
      }
    }

    const interval = setInterval(handleInput, 1000 / 60) // 60 FPS
    return () => clearInterval(interval)
  }, [localPlayerId, gameState.players, onPlayerUpdate, onShoot, onInputUpdate])

  return null // Este componente no renderiza nada
}

// Componente de escena 3D
const Scene: React.FC<{ 
  gameState: GameState; 
  localPlayerId: string;
  shootEffects: Array<{
    id: string
    position: [number, number, number]
    rotation: [number, number, number]
  }>;
  deathExplosions: Array<{
    id: string
    position: [number, number, number]
  }>;
  onShootEffectComplete: (id: string) => void;
  onDeathExplosionComplete: (id: string) => void;
}> = ({ 
  gameState, 
  localPlayerId,
  shootEffects,
  deathExplosions,
  onShootEffectComplete,
  onDeathExplosionComplete
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

      {/* Efectos de disparo */}
      {shootEffects.map((effect) => (
        <ShootEffect
          key={effect.id}
          position={effect.position}
          rotation={effect.rotation}
          onComplete={() => onShootEffectComplete(effect.id)}
        />
      ))}

      {/* Explosiones de muerte */}
      {deathExplosions.map((explosion) => (
        <DeathExplosion
          key={explosion.id}
          position={explosion.position}
          onComplete={() => onDeathExplosionComplete(explosion.id)}
        />
      ))}

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
  const [shootEffects, setShootEffects] = useState<Array<{
    id: string
    position: [number, number, number]
    rotation: [number, number, number]
  }>>([])
  const [deathExplosions, setDeathExplosions] = useState<Array<{
    id: string
    position: [number, number, number]
  }>>([])

  const handleShootEffectComplete = (effectId: string) => {
    setShootEffects(prev => prev.filter(effect => effect.id !== effectId))
  }

  const handleDeathExplosionComplete = (explosionId: string) => {
    setDeathExplosions(prev => prev.filter(explosion => explosion.id !== explosionId))
  }

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
        <Scene 
          gameState={props.gameState} 
          localPlayerId={props.localPlayerId}
          shootEffects={shootEffects}
          deathExplosions={deathExplosions}
          onShootEffectComplete={handleShootEffectComplete}
          onDeathExplosionComplete={handleDeathExplosionComplete}
        />
      </Canvas>
    </>
  )
} 