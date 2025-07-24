import React, { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Physics } from '@react-three/cannon'
import { OrbitControls, Stats } from '@react-three/drei'
import { Robot } from '../components/Robot'
import { ProjectileComponent } from '../components/Projectile'
import { ShootEffect } from '../components/ShootEffect'
import { DeathExplosion } from '../components/DeathExplosion'
import { Arena } from '../components/Arena'
import { InputManager } from './InputManager'
import { PhysicsManager } from './PhysicsManager'
import { InterpolationManager } from './InterpolationManager'
import { LocalPrediction } from './LocalPrediction'
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
  const interpolationManager = useRef<InterpolationManager>()
  const localPrediction = useRef<LocalPrediction>()
  const lastShootTime = useRef(0)
  const shootCooldown = 500 // 500ms entre disparos
  const [deathExplosions, setDeathExplosions] = useState<Array<{
    id: string
    position: [number, number, number]
  }>>([])

  useEffect(() => {
    inputManager.current = new InputManager()
    physicsManager.current = new PhysicsManager()
    interpolationManager.current = new InterpolationManager()
    localPrediction.current = new LocalPrediction()

    return () => {
      inputManager.current?.destroy()
    }
  }, [])

  // Actualizar estado interpolado cuando cambie el gameState
  useEffect(() => {
    if (!interpolationManager.current || !localPrediction.current) return

    // La interpolación se maneja directamente en el renderizado

    // La interpolación se maneja directamente en el renderizado

    // Detectar muertes y crear explosiones
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
  }, [gameState, localPlayerId, deathExplosions])

  // Mover la lógica de input fuera de useFrame
  useEffect(() => {
    const handleInput = () => {
      if (!inputManager.current || !physicsManager.current || !localPrediction.current) return

      const localPlayer = gameState.players.find(p => p.id === localPlayerId)

      if (localPlayer) {
        // Bloquear/desbloquear input basado en el estado de muerte
        inputManager.current.setBlocked(localPlayer.isDead || false)
        
        // Solo procesar input si el jugador no está muerto
        if (!localPlayer.isDead) {
          const input = inputManager.current.getInput()
          
          // Enviar input al servidor
          onInputUpdate(input)
          
          // Actualizar predicción local
          const predictedPlayer = localPrediction.current.updateLocalPlayer(localPlayer, input)
          onPlayerUpdate(predictedPlayer)

          // Manejar disparos - enviar directamente al servidor
          if (input.shoot && Date.now() - lastShootTime.current > shootCooldown) {
            console.log('🔫 Disparo detectado, enviando al servidor')
            onShoot()
            lastShootTime.current = Date.now()
            
            // Agregar efecto de disparo local
            // Los efectos se manejan en el componente principal
          }
          
          // Reset del cooldown si no está disparando
          if (!input.shoot) {
            lastShootTime.current = 0
          }
        } else {
          // Si está muerto, no enviar input al servidor
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
  // Interpolación en tiempo real
  useFrame(() => {
    // La interpolación se maneja en el GameLogic
  })
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