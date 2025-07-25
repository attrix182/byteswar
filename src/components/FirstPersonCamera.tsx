import React, { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Player } from '../types/game'
import * as THREE from 'three'

interface FirstPersonCameraProps {
  player: Player
  isLocal: boolean
}

export const FirstPersonCamera: React.FC<FirstPersonCameraProps> = ({ player, isLocal }) => {
  const { camera } = useThree()
  const mouseRef = useRef({ x: 0, y: 0 })
  const sensitivity = 0.002
  const lastUpdateRef = useRef(0)

  // Solo aplicar cámara en primera persona para el jugador local
  if (!isLocal) return null

  // Configurar cámara en primera persona con useFrame para mejor sincronización
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    // Evitar actualizaciones demasiado frecuentes
    if (time - lastUpdateRef.current < 1/60) return
    lastUpdateRef.current = time

    // Posición de la cámara (ojos del robot)
    const cameraHeight = 0.8 // Altura de los "ojos"
    const [x, y, z] = player.position
    const [, rotY] = player.rotation

    // Posicionar cámara en la cabeza del robot
    camera.position.set(
      x + Math.sin(rotY) * 0.1, // Ligeramente adelante
      y + cameraHeight, // Altura de los ojos
      z + Math.cos(rotY) * 0.1
    )

    // Orientar cámara en la dirección del jugador
    camera.lookAt(
      x + Math.sin(rotY) * 10,
      y + cameraHeight,
      z + Math.cos(rotY) * 10
    )
  })

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

  // Actualizar rotación de la cámara con el mouse (optimizado)
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    // Sincronizar con el frame rate del juego
    if (time - lastUpdateRef.current < 1/60) return
    
    if (mouseRef.current.x !== 0 || mouseRef.current.y !== 0) {
      // Rotación horizontal (izquierda/derecha)
      const yaw = mouseRef.current.x * sensitivity
      camera.rotateY(-yaw)

      // Rotación vertical (arriba/abajo) con límites
      const pitch = mouseRef.current.y * sensitivity
      
      // Aplicar rotación vertical con límites
      camera.rotateX(-pitch)
      camera.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, camera.rotation.x))

      // Resetear valores del mouse
      mouseRef.current.x = 0
      mouseRef.current.y = 0
    }
  })

  return null
} 