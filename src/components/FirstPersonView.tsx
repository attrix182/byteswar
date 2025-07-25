import React, { useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Player } from '../types/game'
import * as THREE from 'three'

interface FirstPersonViewProps {
  player: Player
  isLocal: boolean
}

export const FirstPersonView: React.FC<FirstPersonViewProps> = ({ player, isLocal }) => {
  const { camera } = useThree()

  // Solo para el jugador local
  if (!isLocal) return null

  // Configurar cámara
  useEffect(() => {
    if ('fov' in camera) {
      (camera as THREE.PerspectiveCamera).fov = 90
      camera.updateProjectionMatrix()
    }
  }, [camera])

  // Manejar click para bloquear mouse
  useEffect(() => {
    const canvas = document.querySelector('canvas')
    if (canvas) {
      canvas.addEventListener('click', () => {
        canvas.requestPointerLock?.()
      })
    }
  }, [])

  // Actualizar cámara (fija)
  useFrame(() => {
    const [x, y, z] = player.position
    const [, rotY] = player.rotation

    // Posición de la cámara (ojos del jugador)
    camera.position.set(x, y + 1.2, z)

    // Cámara fija - solo sigue al jugador, no al mouse
    camera.rotation.set(0, rotY + Math.PI, 0)
  })

  return null
} 