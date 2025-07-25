import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useBox } from '@react-three/cannon'
import { Player } from '../types/game'
import * as THREE from 'three'

interface RobotProps {
  player: Player
  isLocal: boolean
}

export const Robot: React.FC<RobotProps> = ({ player, isLocal }) => {
  const [ref, api] = useBox(() => ({
    mass: 1,
    position: player.position,
    rotation: player.rotation,
    args: [1, 0.5, 1.5], // Ancho, alto, largo
    material: { friction: 0.7 }
  }))

  const wheelRefs = useRef<THREE.Group[]>([])

  // Actualizar posición directamente sin interpolación compleja
  useEffect(() => {
    if (api) {
      api.position.set(player.position[0], player.position[1], player.position[2])
      api.rotation.set(player.rotation[0], player.rotation[1], player.rotation[2])
    }
  }, [player.position, player.rotation, api])

  useFrame((_state, delta) => {
    // Rotar las ruedas continuamente
    wheelRefs.current.forEach(wheel => {
      if (wheel) {
        wheel.rotation.x += delta * 5
      }
    })
  })

  // Ocultar el modelo del jugador local en primera persona
  if (isLocal) {
    return null
  }

  return (
    <group ref={ref as any}>
      {/* Cuerpo principal del robot */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.5, 8]} />
        <meshStandardMaterial color={player.color} />
      </mesh>

      {/* Cabeza del robot */}
      <mesh position={[0, 0.75, 0]}>
        <sphereGeometry args={[0.3, 8, 6]} />
        <meshStandardMaterial color={player.color} />
      </mesh>

      {/* Cañón */}
      <mesh position={[0, 0.5, 0.8]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* Ruedas */}
      <group ref={(el) => el && (wheelRefs.current[0] = el)} position={[-0.4, -0.1, -0.3]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 0.05, 8]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      </group>

      <group ref={(el) => el && (wheelRefs.current[1] = el)} position={[0.4, -0.1, -0.3]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 0.05, 8]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      </group>

      <group ref={(el) => el && (wheelRefs.current[2] = el)} position={[-0.4, -0.1, 0.3]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 0.05, 8]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      </group>

      <group ref={(el) => el && (wheelRefs.current[3] = el)} position={[0.4, -0.1, 0.3]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 0.05, 8]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      </group>

      {/* Indicador de salud */}
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[0.8, 0.1, 0.1]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      
      <mesh position={[0, 1.2, 0]} scale={[player.health / player.maxHealth, 1, 1]}>
        <boxGeometry args={[0.8, 0.1, 0.1]} />
        <meshStandardMaterial color={player.health > 50 ? "#44ff44" : player.health > 25 ? "#ffff44" : "#ff4444"} />
      </mesh>
    </group>
  )
} 