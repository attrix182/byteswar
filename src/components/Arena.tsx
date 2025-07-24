import React from 'react'
import { usePlane } from '@react-three/cannon'
import { GAME_CONFIG } from '../utils/gameConfig'

export const Arena: React.FC = () => {
  const [floorRef] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
    material: { friction: 0.8 }
  }))

  const arenaSize = GAME_CONFIG.arenaSize

  return (
    <group>
      {/* Suelo de la arena */}
      <mesh ref={floorRef as any} receiveShadow>
        <planeGeometry args={[arenaSize, arenaSize]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* Bordes de la arena */}
      <mesh position={[0, 2, arenaSize / 2]}>
        <boxGeometry args={[arenaSize, 4, 1]} />
        <meshStandardMaterial color="#444" />
      </mesh>

      <mesh position={[0, 2, -arenaSize / 2]}>
        <boxGeometry args={[arenaSize, 4, 1]} />
        <meshStandardMaterial color="#444" />
      </mesh>

      <mesh position={[arenaSize / 2, 2, 0]}>
        <boxGeometry args={[1, 4, arenaSize]} />
        <meshStandardMaterial color="#444" />
      </mesh>

      <mesh position={[-arenaSize / 2, 2, 0]}>
        <boxGeometry args={[1, 4, arenaSize]} />
        <meshStandardMaterial color="#444" />
      </mesh>

      {/* Líneas de la arena - suelo horizontal */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[arenaSize, arenaSize]} />
        <meshBasicMaterial color="#666" transparent opacity={0.3} />
      </mesh>

      {/* Línea central - suelo horizontal */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.2, arenaSize]} />
        <meshBasicMaterial color="#fff" />
      </mesh>

      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[arenaSize, 0.2]} />
        <meshBasicMaterial color="#fff" />
      </mesh>

      {/* Círculo central - suelo horizontal */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3, 3.2, 32]} />
        <meshBasicMaterial color="#fff" />
      </mesh>
    </group>
  )
} 