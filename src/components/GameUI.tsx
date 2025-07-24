import React, { useState } from 'react'
import { GameState } from '../types/game'

interface GameUIProps {
  gameState: GameState
  localPlayerId: string | null
  onJoinGame: (playerName: string) => void
  isConnected: boolean
}

export const GameUI: React.FC<GameUIProps> = ({
  gameState,
  localPlayerId,
  onJoinGame,
  isConnected
}) => {
  const [playerName, setPlayerName] = useState('')
  const [showJoinForm, setShowJoinForm] = useState(true)

  const localPlayer = localPlayerId ? gameState.players.find(p => p.id === localPlayerId) : null

  const handleJoinGame = () => {
    if (playerName.trim()) {
      onJoinGame(playerName.trim())
      setShowJoinForm(false)
    }
  }

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 1000
    }}>
      {/* Formulario de unión al juego */}
      {showJoinForm && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '2rem',
          borderRadius: '10px',
          color: 'white',
          textAlign: 'center',
          pointerEvents: 'auto'
        }}>
          <h1 style={{ color: '#44ff44', marginBottom: '1rem' }}>BytesWar</h1>
          <p style={{ marginBottom: '1rem' }}>¡Únete a la batalla de robots!</p>
          
          <input
            type="text"
            placeholder="Tu nombre"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            style={{
              padding: '0.5rem',
              marginBottom: '1rem',
              width: '200px',
              borderRadius: '5px',
              border: 'none',
              fontSize: '1rem'
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleJoinGame()}
          />
          
          <br />
          
          <button
            onClick={handleJoinGame}
            disabled={!playerName.trim() || !isConnected}
            style={{
              padding: '0.5rem 1rem',
              background: '#44ff44',
              color: 'black',
              border: 'none',
              borderRadius: '5px',
              fontSize: '1rem',
              cursor: 'pointer',
              opacity: (!playerName.trim() || !isConnected) ? 0.5 : 1
            }}
          >
            {isConnected ? 'Unirse al Juego' : 'Conectando...'}
          </button>
        </div>
      )}

      {/* Información del jugador local */}
      {localPlayer && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '1rem',
          borderRadius: '5px',
          color: 'white',
          pointerEvents: 'auto'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: localPlayer.color }}>
            {localPlayer.name}
          </h3>
          <div style={{ marginBottom: '0.5rem' }}>
            <span>Salud: </span>
            <span style={{ color: localPlayer.health > 50 ? '#44ff44' : localPlayer.health > 25 ? '#ffff44' : '#ff4444' }}>
              {localPlayer.health}/{localPlayer.maxHealth}
            </span>
          </div>
          <div style={{
            width: '100px',
            height: '10px',
            background: '#333',
            borderRadius: '5px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(localPlayer.health / localPlayer.maxHealth) * 100}%`,
              height: '100%',
              background: localPlayer.health > 50 ? '#44ff44' : localPlayer.health > 25 ? '#ffff44' : '#ff4444',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      )}

      {/* Lista de jugadores */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '1rem',
        borderRadius: '5px',
        color: 'white',
        minWidth: '200px',
        pointerEvents: 'auto'
      }}>
        <h3 style={{ margin: '0 0 1rem 0' }}>Jugadores ({gameState.players.length})</h3>
        {gameState.players.map(player => (
          <div key={player.id} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem',
            padding: '0.25rem 0'
          }}>
            <span style={{ color: player.color }}>
              {player.name} {player.id === localPlayerId ? '(Tú)' : ''}
            </span>
            <span style={{
              color: player.health > 50 ? '#44ff44' : player.health > 25 ? '#ffff44' : '#ff4444'
            }}>
              {player.health}
            </span>
          </div>
        ))}
      </div>

      {/* Estado del juego */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '1rem',
        borderRadius: '5px',
        color: 'white',
        textAlign: 'center',
        pointerEvents: 'auto'
      }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <strong>Estado:</strong> {gameState.isGameActive ? 'En Juego' : 'Esperando Jugadores'}
        </div>
        <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
          <div>WASD - Mover | Click - Disparar</div>
          <div>Tiempo: {Math.floor(gameState.gameTime)}s</div>
        </div>
      </div>

      {/* Indicador de conexión */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: isConnected ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 0, 0, 0.2)',
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        color: 'white',
        fontSize: '0.9rem',
        pointerEvents: 'auto'
      }}>
        {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
      </div>
    </div>
  )
} 