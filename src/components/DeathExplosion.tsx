import React, { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface DeathExplosionProps {
  position: [number, number, number]
  onComplete: () => void
}

export const DeathExplosion: React.FC<DeathExplosionProps> = ({ 
  position, 
  onComplete 
}) => {
  const [isActive, setIsActive] = useState(true)
  const explosionRef = useRef<THREE.Group>(null)
  const particlesRef = useRef<THREE.Group>(null)
  const timeRef = useRef(0)
  const particles = useRef<Array<{
    position: [number, number, number]
    velocity: [number, number, number]
    mesh: THREE.Mesh
  }>>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsActive(false)
      onComplete()
    }, 2000) // Duración de la explosión: 2 segundos

    return () => clearTimeout(timer)
  }, [onComplete])

  useFrame((_state, delta) => {
    if (!explosionRef.current || !isActive) return

    timeRef.current += delta
    const progress = timeRef.current / 2.0 // 2 segundos

    // Escalar la explosión
    const scale = 1 + progress * 3
    explosionRef.current.scale.setScalar(scale)

    // Reducir la opacidad
    const opacity = 1 - progress
    explosionRef.current.children.forEach((child: any) => {
      if (child.material) {
        child.material.opacity = opacity
      }
    })

    // Animar partículas
    particles.current.forEach((particle) => {
      const [vx, vy, vz] = particle.velocity
      const [px, py, pz] = particle.position
      
      // Aplicar velocidad y gravedad
      particle.position[0] = px + vx * delta
      particle.position[1] = py + vy * delta
      particle.position[2] = pz + vz * delta
      
      // Aplicar gravedad
      particle.velocity[1] -= 5 * delta // Gravedad
      
      // Actualizar posición del mesh
      particle.mesh.position.set(
        particle.position[0],
        particle.position[1],
        particle.position[2]
      )
      
      // Reducir opacidad de partículas
      if (particle.mesh.material) {
        (particle.mesh.material as THREE.Material).opacity = opacity
      }
    })
  })

  // Crear partículas al montar
  useEffect(() => {
    if (!particlesRef.current) return

    // Crear partículas de escombros
    for (let i = 0; i < 15; i++) {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.1 + Math.random() * 0.2, 4, 4),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color().setHSL(Math.random(), 0.8, 0.5),
          transparent: true,
          opacity: 0.8
        })
      )

      const velocity: [number, number, number] = [
        (Math.random() - 0.5) * 10,
        Math.random() * 8 + 2,
        (Math.random() - 0.5) * 10
      ]

      particles.current.push({
        position: [...position] as [number, number, number],
        velocity,
        mesh
      })

      particlesRef.current.add(mesh)
    }
  }, [position])

  if (!isActive) return null

  return (
    <group>
      {/* Explosión principal */}
      <group ref={explosionRef} position={position}>
        {/* Onda de choque */}
        <mesh>
          <sphereGeometry args={[1, 16, 12]} />
          <meshStandardMaterial 
            color="#ff6600" 
            emissive="#ff2200"
            emissiveIntensity={2}
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Núcleo de explosión */}
        <mesh>
          <sphereGeometry args={[0.5, 12, 8]} />
          <meshStandardMaterial 
            color="#ffff00" 
            emissive="#ffaa00"
            emissiveIntensity={3}
            transparent
            opacity={0.9}
          />
        </mesh>

        {/* Anillos de explosión */}
        <mesh>
          <ringGeometry args={[0.8, 1.5, 8]} />
          <meshStandardMaterial 
            color="#ff4444" 
            emissive="#440000"
            emissiveIntensity={1.5}
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>

        <mesh>
          <ringGeometry args={[1.2, 2.0, 8]} />
          <meshStandardMaterial 
            color="#ff8888" 
            emissive="#220000"
            emissiveIntensity={1}
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Partículas de escombros */}
      <group ref={particlesRef} />

      {/* Efectos de luz */}
      <pointLight
        color="#ff6600"
        intensity={5}
        distance={8}
        decay={1}
        position={position}
      />

      <pointLight
        color="#ffff00"
        intensity={3}
        distance={4}
        decay={2}
        position={position}
      />
    </group>
  )
} 