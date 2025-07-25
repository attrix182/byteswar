import React, { useRef, useCallback } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Player } from '../types/game'
import * as THREE from 'three'

interface OptimizedFirstPersonCameraProps {
  player: Player
  isLocal: boolean
}

export const OptimizedFirstPersonCamera: React.FC<OptimizedFirstPersonCameraProps> = ({ player, isLocal }) => {
  const { camera } = useThree()
  const mouseRef = useRef({ x: 0, y: 0 })
  const sensitivity = 0.005 // Aumentar sensibilidad
  const targetPositionRef = useRef(new THREE.Vector3())
  const targetRotationRef = useRef(new THREE.Euler())

  // Solo aplicar cámara en primera persona para el jugador local
  if (!isLocal) return null

  // Calcular posición objetivo de la cámara
  const updateCameraTarget = useCallback(() => {
    const cameraHeight = 0.8
    const [x, y, z] = player.position
    const [, rotY] = player.rotation

    // Posición objetivo (en la cabeza del robot)
    targetPositionRef.current.set(
      x,
      y + cameraHeight,
      z
    )

    // Rotación objetivo (seguir al jugador)
    targetRotationRef.current.set(0, rotY, 0)
  }, [player.position, player.rotation])

  // Actualizar cámara con interpolación suave
  useFrame(() => {
    // Actualizar objetivo cada frame
    updateCameraTarget()
    
    // Posición directa para evitar lag
    camera.position.copy(targetPositionRef.current)
    
    // Rotación directa para evitar lag
    camera.rotation.y = targetRotationRef.current.y

    // Solo manejar rotación vertical del mouse (arriba/abajo)
    if (mouseRef.current.y !== 0) {
      // Rotación vertical con límites
      const pitch = mouseRef.current.y * sensitivity
      
      camera.rotateX(-pitch)
      camera.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, camera.rotation.x))

      // Resetear solo el valor Y del mouse
      mouseRef.current.y = 0
    }
  })

  // Configurar FOV una sola vez
  React.useEffect(() => {
    if ('fov' in camera) {
      (camera as THREE.PerspectiveCamera).fov = 75
      camera.updateProjectionMatrix()
    }
  }, [camera])

  // Manejar movimiento del mouse
  React.useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = event.movementX || 0
      mouseRef.current.y = event.movementY || 0
    }

    // Bloquear el puntero del mouse
    const canvas = document.querySelector('canvas')
    if (canvas) {
      canvas.requestPointerLock = canvas.requestPointerLock || (canvas as any).mozRequestPointerLock
      canvas.addEventListener('click', () => {
        canvas.requestPointerLock()
      })
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return null
} 