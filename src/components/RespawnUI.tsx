import React, { useState, useEffect } from 'react'

interface RespawnUIProps {
  isVisible: boolean
  onRespawn: () => void
  timeRemaining: number
}

export const RespawnUI: React.FC<RespawnUIProps> = ({ 
  isVisible, 
  timeRemaining 
}) => {
  const [showRespawnButton, setShowRespawnButton] = useState(false)

  // Debug: log cuando cambia la visibilidad
  console.log('🖥️ RespawnUI - isVisible:', isVisible, 'timeRemaining:', timeRemaining)

  useEffect(() => {
    if (isVisible) {
      // Mostrar el botón de respawn después de 2 segundos
      const timer = setTimeout(() => {
        setShowRespawnButton(true)
      }, 2000)

      return () => clearTimeout(timer)
    } else {
      setShowRespawnButton(false)
    }
  }, [isVisible])

  if (!isVisible) {
    console.log('🖥️ RespawnUI - No visible')
    return null
  }

  console.log('🖥️ RespawnUI - Renderizando pantalla de muerte')

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(255, 0, 0, 0.9)', // Cambiar a rojo para debug
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Mensaje de muerte */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <h1 style={{
          fontSize: '3rem',
          color: '#ff4444',
          margin: '0 0 1rem 0',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
        }}>
          💥 ¡TE HAN ELIMINADO! 💥
        </h1>
        
        <p style={{
          fontSize: '1.5rem',
          color: '#cccccc',
          margin: '0 0 2rem 0',
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
        }}>
          Tu robot ha sido destruido en batalla
        </p>
      </div>

      {/* Botón de respawn */}
      {showRespawnButton && (
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
        </div>
      )}

      {/* Contador de tiempo */}
      <div style={{
        textAlign: 'center'
      }}>
        <p style={{
          fontSize: '1.2rem',
          color: '#888888',
          margin: '0',
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
        }}>
          Reaparición automática en:
        </p>
        
        <div style={{
          fontSize: '2rem',
          color: '#ffff44',
          fontWeight: 'bold',
          margin: '0.5rem 0',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
        }}>
          {Math.max(0, Math.ceil(timeRemaining / 1000))}s
        </div>
      </div>

      {/* Efectos visuales de fondo */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(255, 100, 100, 0.3) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'pulse 2s ease-in-out infinite'
      }} />
      
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.6; }
        }
      `}</style>
    </div>
  )
} 