import { GAME_CONFIG } from '../utils/gameConfig'

// Configuración de entorno
export const ENV_CONFIG = {
  // URL del servidor según el entorno
  SERVER_URL: import.meta.env.PROD
    ? 'http://byteswar.31.97.151.147.sslip.io'
    : window.location.origin, // Usar el proxy de Vite en desarrollo
  
  // Configuración del juego (usar la configuración unificada)
  GAME_CONFIG,
  
  // Configuración de desarrollo
  DEV: {
    debug: import.meta.env.DEV,
    showStats: import.meta.env.DEV,
    logLevel: import.meta.env.PROD ? 'error' : 'debug'
  }
}

export default ENV_CONFIG 