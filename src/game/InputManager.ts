import { GameInput } from '../types/game'

export class InputManager {
  private input: GameInput = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    shoot: false
  }

  // Propiedades para rotación del mouse
  private mouseX: number = 0
  private mouseY: number = 0
  private isPointerLocked: boolean = false

  private keys: { [key: string]: boolean } = {}
  private isBlocked: boolean = false

  // Propiedades para almacenar las referencias de los event listeners
  private handleKeyDown: ((event: KeyboardEvent) => void) | null = null
  private handleKeyUp: ((event: KeyboardEvent) => void) | null = null
  private handleMouseDown: ((event: MouseEvent) => void) | null = null
  private handleMouseUp: ((event: MouseEvent) => void) | null = null

  constructor() {
    this.setupEventListeners()
  }

  private setupEventListeners() {
    // Los event listeners se configuran más abajo

    // Manejar movimiento del mouse para rotación
    const handleMouseMove = (event: MouseEvent) => {
      if (this.isPointerLocked) {
        this.mouseX += event.movementX || 0
        this.mouseY += event.movementY || 0
      }
    }

    // Manejar bloqueo del puntero
    const handlePointerLockChange = () => {
      this.isPointerLocked = document.pointerLockElement !== null
    }

    const handleMouseDown = (event: MouseEvent) => {
      if (this.isBlocked) return // Bloquear input si está muerto
      if (event.button === 0) { // Botón izquierdo
        console.log('🖱️ Click izquierdo detectado - DISPARO!')
        this.input.shoot = true
      }
    }

    const handleMouseUp = (event: MouseEvent) => {
      if (this.isBlocked) return // Bloquear input si está muerto
      if (event.button === 0) {
        console.log('🖱️ Click izquierdo liberado')
        this.input.shoot = false
      }
    }

    // Agregar disparo con barra espaciadora
    const handleKeyDownWithShoot = (event: KeyboardEvent) => {
      if (this.isBlocked) return // Bloquear input si está muerto
      this.keys[event.code] = true
      
      // Disparo con barra espaciadora
      if (event.code === 'Space') {
        this.input.shoot = true
        console.log('🔫 Disparo con barra espaciadora!')
      }
      
      this.updateInput()
    }

    const handleKeyUpWithShoot = (event: KeyboardEvent) => {
      if (this.isBlocked) return // Bloquear input si está muerto
      this.keys[event.code] = false
      
      // Liberar disparo con barra espaciadora
      if (event.code === 'Space') {
        this.input.shoot = false
        console.log('🔫 Disparo liberado')
      }
      
      this.updateInput()
    }

    document.addEventListener('keydown', handleKeyDownWithShoot)
    document.addEventListener('keyup', handleKeyUpWithShoot)
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('pointerlockchange', handlePointerLockChange)

    // Guardar las referencias para poder remover los event listeners
    this.handleKeyDown = handleKeyDownWithShoot
    this.handleKeyUp = handleKeyUpWithShoot
    this.handleMouseDown = handleMouseDown
    this.handleMouseUp = handleMouseUp
  }

  private updateInput() {
    const oldInput = { ...this.input }
    
    this.input.forward = this.keys['KeyW'] || this.keys['ArrowUp']
    this.input.backward = this.keys['KeyS'] || this.keys['ArrowDown']
    this.input.left = this.keys['KeyA'] || this.keys['ArrowLeft']
    this.input.right = this.keys['KeyD'] || this.keys['ArrowRight']
    
    // Debug: solo log si hay algún input activo
    if (this.input.forward || this.input.backward || this.input.left || this.input.right) {
      console.log('🎮 Input detectado:', this.input)
    }
    
    // Debug: log cuando cambia el input de disparo
    if (oldInput.shoot !== this.input.shoot) {
      console.log('🔫 Estado de disparo cambió:', oldInput.shoot, '→', this.input.shoot)
    }
    
    // Debug: log cuando cambia el input
    if (JSON.stringify(oldInput) !== JSON.stringify(this.input)) {
      console.log('🔄 Input cambió:', oldInput, '→', this.input)
    }
  }

  public getInput(): GameInput {
    // Si está bloqueado, devolver input vacío
    if (this.isBlocked) {
      return {
        forward: false,
        backward: false,
        left: false,
        right: false,
        shoot: false
      }
    }
    return { ...this.input }
  }

  public getMouseX(): number {
    return this.mouseX
  }

  public resetMouseX(): void {
    this.mouseX = 0
  }

  public setBlocked(blocked: boolean): void {
    this.isBlocked = blocked
    if (blocked) {
      // Resetear input cuando se bloquea
      this.input = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        shoot: false
      }
      this.keys = {}
    }
  }

  public destroy() {
    if (this.handleKeyDown) {
      document.removeEventListener('keydown', this.handleKeyDown)
    }
    if (this.handleKeyUp) {
      document.removeEventListener('keyup', this.handleKeyUp)
    }
    if (this.handleMouseDown) {
      document.removeEventListener('mousedown', this.handleMouseDown)
    }
    if (this.handleMouseUp) {
      document.removeEventListener('mouseup', this.handleMouseUp)
    }
  }
} 