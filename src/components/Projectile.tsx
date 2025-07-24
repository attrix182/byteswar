import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSphere } from '@react-three/cannon'
import { Projectile as ProjectileType } from '../types/game'
import * as THREE from 'three'

interface ProjectileProps {
  projectile: ProjectileType
}

export const ProjectileComponent: React.FC<ProjectileProps> = ({ projectile }) => {
  const [_ref, api] = useSphere(() => ({
    mass: 0.1,
    position: projectile.position,
    args: [0.1],
    material: { restitution: 0.8 }
  }))

  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((_state, delta) => {
    // Aplicar velocidad al proyectil
    api.velocity.set(projectile.velocity[0], projectile.velocity[1], projectile.velocity[2])
    
    // Rotar el proyectil
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 10
      meshRef.current.rotation.y += delta * 10
    }
  })

  return (
    <mesh ref={meshRef as any}>
      <sphereGeometry args={[0.1, 8, 6]} />
      <meshStandardMaterial color="#ff4444" emissive="#440000" />
      
      {/* Efecto de luz */}
      <pointLight
        color="#ff4444"
        intensity={0.5}
        distance={2}
        decay={2}
      />
    </mesh>
  )
} 