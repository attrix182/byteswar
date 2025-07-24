import { Player, GameInput } from '../types/game'
import { PhysicsManager } from './PhysicsManager'

export class LocalPrediction {
  private physicsManager: PhysicsManager
  private predictedPlayer: Player | null = null
  private lastUpdateTime: number = 0

  constructor() {
    this.physicsManager = new PhysicsManager()
  }

  public updateLocalPlayer(player: Player, input: GameInput): Player {
    const currentTime = Date.now()
    const deltaTime = (currentTime - this.lastUpdateTime) / 1000
    this.lastUpdateTime = currentTime

    // Si es la primera actualización, inicializar
    if (!this.predictedPlayer) {
      this.predictedPlayer = { ...player }
          return this.predictedPlayer
    }

    // Actualizar predicción local
    this.predictedPlayer = this.physicsManager.updatePlayer(
      this.predictedPlayer,
      input,
      deltaTime
    )

    return this.predictedPlayer
  }

  public getPredictedPlayer(): Player | null {
    return this.predictedPlayer
  }

  public reset(player: Player): void {
    this.predictedPlayer = { ...player }
    this.lastUpdateTime = Date.now()
  }

  public clear(): void {
    this.predictedPlayer = null
    this.lastUpdateTime = 0
  }
} 