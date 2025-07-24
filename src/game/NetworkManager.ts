import { io, Socket } from 'socket.io-client'
import { GameState, Player, GameInput } from '../types/game'
import { ENV_CONFIG } from '../config/environment'

export class NetworkManager {
  private socket: Socket | null = null
  private serverUrl: string
  private onGameStateUpdate: ((gameState: GameState) => void) | null = null
  private onPlayerJoined: ((player: Player) => void) | null = null

  constructor(serverUrl?: string) {
    // Usar la URL de la configuración de entorno por defecto, o la proporcionada
    this.serverUrl = serverUrl || ENV_CONFIG.SERVER_URL
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(this.serverUrl, {
        transports: ['polling', 'websocket'],
        upgrade: true,
        rememberUpgrade: true,
        timeout: 20000,
        forceNew: true
      })

      this.socket.on('connect', () => {
        console.log('Conectado al servidor de BytesWar')
        resolve()
      })

      this.socket.on('connect_error', (error) => {
        console.error('Error al conectar:', error)
        reject(error)
      })

      this.socket.on('gameState', (gameState: GameState) => {
        if (this.onGameStateUpdate) {
          this.onGameStateUpdate(gameState)
        }
      })

      this.socket.on('playerJoined', (player: Player) => {
        console.log('📡 NetworkManager recibió playerJoined:', player)
        if (this.onPlayerJoined) {
          this.onPlayerJoined(player)
        } else {
          console.log('❌ No hay callback registrado para playerJoined')
        }
      })
    })
  }

  public joinGame(playerName: string): void {
    if (this.socket) {
      this.socket.emit('joinGame', playerName)
    }
  }

  public sendInput(input: GameInput): void {
    if (this.socket) {
      console.log('Enviando input al servidor:', input)
      this.socket.emit('playerInput', input)
    } else {
      console.log('ERROR: Socket no está conectado')
    }
  }

  public shoot(): void {
    if (this.socket) {
      this.socket.emit('shoot')
    }
  }

  public respawn(): void {
    if (this.socket) {
      this.socket.emit('respawn')
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  public onGameState(callback: (gameState: GameState) => void): void {
    this.onGameStateUpdate = callback
  }

  public onPlayerJoin(callback: (player: Player) => void): void {
    this.onPlayerJoined = callback
  }

  public getSocketId(): string | null {
    return this.socket?.id || null
  }
} 