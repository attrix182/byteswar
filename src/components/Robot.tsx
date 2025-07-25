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
    args: [1.5, 0.75, 2.25], // Ancho, alto, largo - Aumentado 50%
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
      <mesh position={[0, 0.375, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.75, 8]} />
        <meshStandardMaterial color={player.color} />
      </mesh>

      {/* Cabeza del robot */}
      <mesh position={[0, 1.125, 0]}>
        <sphereGeometry args={[0.45, 8, 6]} />
        <meshStandardMaterial color={player.color} />
      </mesh>

      {/* Cañón */}
      <mesh position={[0, 0.75, 1.2]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.075, 0.075, 0.6, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* Ruedas */}
      <group ref={(el) => el && (wheelRefs.current[0] = el)} position={[-0.6, -0.15, -0.45]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.225, 0.225, 0.075, 8]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      </group>

      <group ref={(el) => el && (wheelRefs.current[1] = el)} position={[0.6, -0.15, -0.45]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.225, 0.225, 0.075, 8]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      </group>

      <group ref={(el) => el && (wheelRefs.current[2] = el)} position={[-0.6, -0.15, 0.45]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.225, 0.225, 0.075, 8]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      </group>

      <group ref={(el) => el && (wheelRefs.current[3] = el)} position={[0.6, -0.15, 0.45]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.225, 0.225, 0.075, 8]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      </group>

      {/* Indicador de salud */}
      <mesh position={[0, 1.8, 0]}>
        <boxGeometry args={[1.2, 0.15, 0.15]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      
      <mesh position={[0, 1.8, 0]} scale={[player.health / player.maxHealth, 1, 1]}>
        <boxGeometry args={[1.2, 0.15, 0.15]} />
        <meshStandardMaterial color={player.health > 50 ? "#44ff44" : player.health > 25 ? "#ffff44" : "#ff4444"} />
      </mesh>
    </group>
  )
} 