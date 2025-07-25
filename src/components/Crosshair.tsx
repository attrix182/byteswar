import React from 'react'

export const Crosshair: React.FC = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '20px',
        height: '20px',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      {/* Línea horizontal */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '0',
          width: '100%',
          height: '2px',
          backgroundColor: '#00ff00',
          transform: 'translateY(-50%)',
        }}
      />
      {/* Línea vertical */}
      <div
        style={{
          position: 'absolute',
          top: '0',
          left: '50%',
          width: '2px',
          height: '100%',
          backgroundColor: '#00ff00',
          transform: 'translateX(-50%)',
        }}
      />
      {/* Punto central */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '4px',
          height: '4px',
          backgroundColor: '#00ff00',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  )
} 