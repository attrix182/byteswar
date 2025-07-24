import { GameInput } from '../types/game'

export class InputManager {
  private input: GameInput = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    shoot: false
  }

  private keys: { [key: string]: boolean } = {}

  // Propiedades para almacenar las referencias de los event listeners
  private handleKeyDown: ((event: KeyboardEvent) => void) | null = null
  private handleKeyUp: ((event: KeyboardEvent) => void) | null = null
  private handleMouseDown: ((event: MouseEvent) => void) | null = null
  private handleMouseUp: ((event: MouseEvent) => void) | null = null

  constructor() {
    this.setupEventListeners()
  }

  private setupEventListeners() {
    const handleKeyDown = (event: KeyboardEvent) => {
      this.keys[event.code] = true
      this.updateInput()
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      this.keys[event.code] = false
      this.updateInput()
    }

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) { // Botón izquierdo
        console.log('🖱️ Click izquierdo detectado - DISPARO!')
        this.input.shoot = true
      }
    }

    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 0) {
        console.log('🖱️ Click izquierdo liberado')
        this.input.shoot = false
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)

    // Guardar las referencias para poder remover los event listeners
    this.handleKeyDown = handleKeyDown
    this.handleKeyUp = handleKeyUp
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
    return { ...this.input }
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