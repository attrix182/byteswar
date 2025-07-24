// Configuración de entorno
export const ENV_CONFIG = {
  // URL del servidor según el entorno
  SERVER_URL: import.meta.env.PROD 
    ? 'http://byteswar.31.97.151.147.sslip.io'
    : 'http://localhost:3001',
  
  // Configuración del juego
  GAME_CONFIG: {
    playerSpeed: 5,
    projectileSpeed: 20,
    projectileDamage: 25,
    arenaSize: 50,
    maxPlayers: 8
  },
  
  // Configuración de desarrollo
  DEV: {
    debug: !import.meta.env.PROD,
    showStats: !import.meta.env.PROD,
    logLevel: import.meta.env.PROD ? 'error' : 'debug'
  }
}

export default ENV_CONFIG 