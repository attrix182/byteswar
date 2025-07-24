import React, { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ShootEffectProps {
  position: [number, number, number]
  rotation: [number, number, number]
  onComplete: () => void
}

export const ShootEffect: React.FC<ShootEffectProps> = ({ 
  position, 
  rotation, 
  onComplete 
}) => {
  const [isActive, setIsActive] = useState(true)
  const effectRef = useRef<THREE.Group>(null)
  const timeRef = useRef(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsActive(false)
      onComplete()
    }, 200) // Duración del efecto: 200ms

    return () => clearTimeout(timer)
  }, [onComplete])

  useFrame((_state, delta) => {
    if (!effectRef.current || !isActive) return

    timeRef.current += delta
    const progress = timeRef.current / 0.2 // 200ms = 0.2s

    // Escalar el efecto
    const scale = 1 + progress * 2
    effectRef.current.scale.setScalar(scale)

    // Reducir la opacidad
    const opacity = 1 - progress
    effectRef.current.children.forEach((child: any) => {
      if (child.material) {
        child.material.opacity = opacity
      }
    })
  })

  if (!isActive) return null

  return (
    <group 
      ref={effectRef}
      position={position}
      rotation={rotation}
    >
      {/* Flash de disparo */}
      <mesh>
        <sphereGeometry args={[0.3, 8, 6]} />
        <meshStandardMaterial 
          color="#ffff00" 
          emissive="#ffaa00"
          emissiveIntensity={2}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Onda de choque */}
      <mesh>
        <ringGeometry args={[0.2, 0.5, 8]} />
        <meshStandardMaterial 
          color="#ff6666" 
          emissive="#440000"
          emissiveIntensity={1}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Partículas de humo */}
      <mesh position={[0, 0, -0.2]}>
        <sphereGeometry args={[0.1, 6, 4]} />
        <meshStandardMaterial 
          color="#666666" 
          transparent
          opacity={0.4}
        />
      </mesh>
    </group>
  )
} 