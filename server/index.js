import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GameServer } from './GameServer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Variables de entorno
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';
const DEBUG = process.env.DEBUG === 'true';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const ENABLE_CORS = process.env.ENABLE_CORS !== 'false';
const CORS_ORIGINS = process.env.CORS_ORIGINS?.split(',') || ['*'];
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';

const app = express();
const httpServer = createServer(app);

// Configuración de CORS
const corsOptions = {
  origin: ENABLE_CORS ? CORS_ORIGINS : false,
  credentials: process.env.ENABLE_CREDENTIALS === 'true',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

const io = new Server(httpServer, {
  cors: corsOptions
});

app.use(cors(corsOptions));
app.use(express.json());

// Crear instancia del servidor de juego
const gameServer = new GameServer(io);

// Servir archivos estáticos desde la carpeta dist
app.use(express.static(path.join(__dirname, '../dist')));

// Ruta para servir index.html en cualquier ruta (SPA) - debe ir al final
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Función para logging
function log(level, message, data) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  // Determinar si debemos mostrar el log basado en LOG_LEVEL
  const shouldLog = 
    level === 'error' || 
    level === 'warn' || 
    (LOG_LEVEL === 'debug' && level === 'debug') ||
    (LOG_LEVEL === 'info' && (level === 'info' || level === 'warn' || level === 'error')) ||
    DEBUG;
  
  if (shouldLog) {
    console.log(logMessage, data || '');
  }
}

// Rutas API
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    players: gameServer.getPlayerCount(),
    projectiles: gameServer.getProjectileCount(),
    uptime: process.uptime(),
    environment: NODE_ENV
  });
});

// Health check endpoint para Docker
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    players: gameServer.getPlayerCount(),
    projectiles: gameServer.getProjectileCount(),
    environment: NODE_ENV
  });
});

// Endpoint de información del servidor
app.get('/info', (req, res) => {
  res.json({
    name: 'BytesWar - Robot PVP Game',
    version: '1.0.0',
    players: gameServer.getPlayerCount(),
    projectiles: gameServer.getProjectileCount(),
    maxPlayers: 8,
    environment: NODE_ENV
  });
});

// Manejo de conexiones WebSocket
io.on('connection', (socket) => {
  log('info', `Nuevo jugador conectado: ${socket.id}`);
  
  // Registrar jugador
  gameServer.addPlayer(socket);
  
  // Manejar desconexión
  socket.on('disconnect', () => {
    log('info', `Jugador desconectado: ${socket.id}`);
    gameServer.removePlayer(socket.id);
  });
  
  // Manejar input del jugador
  socket.on('playerInput', (input) => {
    gameServer.handlePlayerInput(socket, input);
  });
});

// Iniciar servidor
httpServer.listen(PORT, HOST, () => {
  log('info', `🎮 Servidor del juego inicializado 🚀`);
  log('info', `BytesWar servidor de ${NODE_ENV} ejecutándose en puerto ${PORT}`);
  log('info', `🌐 Accede al juego en: ${CLIENT_URL}`);
  log('info', `📊 Health check en: ${SERVER_URL}/health`);
});

// Manejo de señales para cierre graceful
process.on('SIGTERM', () => {
  log('info', 'SIGTERM recibido, cerrando servidor...');
  httpServer.close(() => {
    log('info', 'Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  log('info', 'SIGINT recibido, cerrando servidor...');
  httpServer.close(() => {
    log('info', 'Servidor cerrado correctamente');
    process.exit(0);
  });
}); 