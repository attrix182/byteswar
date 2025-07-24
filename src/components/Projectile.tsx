import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Projectile as ProjectileType } from '../types/game'
import * as THREE from 'three'

interface ProjectileProps {
  projectile: ProjectileType
}

export const ProjectileComponent: React.FC<ProjectileProps> = ({ projectile }) => {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((_state, delta) => {
    // Actualizar posición del proyectil
    if (meshRef.current) {
      meshRef.current.position.set(
        projectile.position[0],
        projectile.position[1],
        projectile.position[2]
      )
      
      // Rotar el proyectil suavemente
      meshRef.current.rotation.x += delta * 8
      meshRef.current.rotation.y += delta * 8
    }
  })

  return (
    <group>
      {/* Proyectil simple - solo una bola */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.1, 12, 8]} />
        <meshStandardMaterial 
          color="#ff4444" 
          emissive="#440000"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Efecto de luz sutil */}
      <pointLight
        color="#ff4444"
        intensity={0.8}
        distance={2}
        decay={2}
      />
    </group>
  )
} 