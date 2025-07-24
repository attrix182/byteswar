import { Player } from '../types/game'

interface InterpolatedPlayer extends Player {
  interpolatedPosition: [number, number, number]
  interpolatedRotation: [number, number, number]
  lastUpdateTime: number
  targetPosition: [number, number, number]
  targetRotation: [number, number, number]
  startPosition: [number, number, number]
  startRotation: [number, number, number]
  interpolationTime: number
}

export class InterpolationManager {
  private players: Map<string, InterpolatedPlayer> = new Map()
  private interpolationDelay: number = 100 // ms de delay para interpolación

  public updatePlayer(player: Player, currentTime: number): InterpolatedPlayer {
    const existingPlayer = this.players.get(player.id)
    
    if (!existingPlayer) {
      // Nuevo jugador
      const interpolatedPlayer: InterpolatedPlayer = {
        ...player,
        interpolatedPosition: [...player.position],
        interpolatedRotation: [...player.rotation],
        lastUpdateTime: currentTime,
        targetPosition: [...player.position],
        targetRotation: [...player.rotation],
        startPosition: [...player.position],
        startRotation: [...player.rotation],
        interpolationTime: 0
      }
      this.players.set(player.id, interpolatedPlayer)
      return interpolatedPlayer
    }

    // Actualizar jugador existente
    const hasPositionChanged = !this.arraysEqual(existingPlayer.position, player.position)
    const hasRotationChanged = !this.arraysEqual(existingPlayer.rotation, player.rotation)

    if (hasPositionChanged || hasRotationChanged) {
      // Iniciar nueva interpolación
      existingPlayer.startPosition = [...existingPlayer.interpolatedPosition]
      existingPlayer.startRotation = [...existingPlayer.interpolatedRotation]
      existingPlayer.targetPosition = [...player.position]
      existingPlayer.targetRotation = [...player.rotation]
      existingPlayer.interpolationTime = 0
      existingPlayer.lastUpdateTime = currentTime
    }

    // Actualizar datos del jugador
    Object.assign(existingPlayer, player)
    
    return existingPlayer
  }

  public interpolate(deltaTime: number): void {
    const currentTime = Date.now()
    
    this.players.forEach(player => {
      const timeSinceUpdate = currentTime - player.lastUpdateTime
      
      if (timeSinceUpdate >= this.interpolationDelay) {
        // Interpolar hacia el objetivo
        player.interpolationTime += deltaTime
        const interpolationFactor = Math.min(player.interpolationTime / 0.1, 1) // 100ms de interpolación
        
        // Interpolación suave (ease-out)
        const smoothFactor = 1 - Math.pow(1 - interpolationFactor, 3)
        
        // Interpolar posición
        player.interpolatedPosition = [
          this.lerp(player.startPosition[0], player.targetPosition[0], smoothFactor),
          this.lerp(player.startPosition[1], player.targetPosition[1], smoothFactor),
          this.lerp(player.startPosition[2], player.targetPosition[2], smoothFactor)
        ]
        
        // Interpolar rotación
        player.interpolatedRotation = [
          this.lerp(player.startRotation[0], player.targetRotation[0], smoothFactor),
          this.lerp(player.startRotation[1], player.targetRotation[1], smoothFactor),
          this.lerp(player.startRotation[2], player.targetRotation[2], smoothFactor)
        ]
      }
    })
  }

  public getInterpolatedPlayer(playerId: string): InterpolatedPlayer | undefined {
    return this.players.get(playerId)
  }

  public removePlayer(playerId: string): void {
    this.players.delete(playerId)
  }

  public clear(): void {
    this.players.clear()
  }

  private lerp(start: number, end: number, factor: number): number {
    return start + (end - start) * factor
  }

  private arraysEqual(a: number[], b: number[]): boolean {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (Math.abs(a[i] - b[i]) > 0.001) return false
    }
    return true
  }
} 