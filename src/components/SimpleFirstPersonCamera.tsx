import React, { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Player } from '../types/game'
import * as THREE from 'three'

interface SimpleFirstPersonCameraProps {
  player: Player
  isLocal: boolean
}

export const SimpleFirstPersonCamera: React.FC<SimpleFirstPersonCameraProps> = ({ player, isLocal }) => {
  const { camera } = useThree()
  const mouseRef = useRef({ x: 0, y: 0 })
  const sensitivity = 0.005

  // Solo aplicar cámara en primera persona para el jugador local
  if (!isLocal) return null

  // Configurar FOV una sola vez
  useEffect(() => {
    if ('fov' in camera) {
      (camera as THREE.PerspectiveCamera).fov = 75
      camera.updateProjectionMatrix()
    }
  }, [camera])

  // Manejar movimiento del mouse
  useEffect(() => {
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

  // Actualizar cámara cada frame
  useFrame(() => {
    const [x, y, z] = player.position
    const [, rotY] = player.rotation
    const cameraHeight = 0.8

    // Posición directa de la cámara
    camera.position.set(x, y + cameraHeight, z)
    
    // Rotación base del jugador
    camera.rotation.y = rotY

    // Aplicar rotación vertical del mouse
    if (mouseRef.current.y !== 0) {
      const pitch = mouseRef.current.y * sensitivity
      camera.rotateX(-pitch)
      
      // Limitar rotación vertical
      camera.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, camera.rotation.x))
      
      mouseRef.current.y = 0
    }
  })

  return null
} 