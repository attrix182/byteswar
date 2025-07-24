"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const gameConfig_1 = require("../utils/gameConfig");
const PhysicsManager_1 = require("../game/PhysicsManager");
// Configuración desde variables de entorno
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';
const DEBUG = process.env.DEBUG === 'true';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info'; // Nivel de logging configurable
const ENABLE_CORS = process.env.ENABLE_CORS !== 'false';
const CORS_ORIGINS = process.env.CORS_ORIGINS?.split(',') || ['*'];
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// Configuración de CORS
const corsOptions = {
    origin: ENABLE_CORS ? CORS_ORIGINS : false,
    credentials: process.env.ENABLE_CREDENTIALS === 'true',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
const io = new socket_io_1.Server(httpServer, {
    cors: corsOptions
});
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
// Estado del juego
let gameState = {
    players: [],
    projectiles: [],
    gameTime: 0,
    isGameActive: false
};
const physicsManager = new PhysicsManager_1.PhysicsManager();
const connectedPlayers = new Map();
// Función para logging
function log(level, message, data) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    // Determinar si debemos mostrar el log basado en LOG_LEVEL
    const shouldLog = level === 'error' ||
        level === 'warn' ||
        (LOG_LEVEL === 'debug' && level === 'debug') ||
        (LOG_LEVEL === 'info' && (level === 'info' || level === 'warn' || level === 'error')) ||
        DEBUG;
    if (shouldLog) {
        console.log(logMessage, data || '');
    }
}
// Función para crear un nuevo jugador
function createPlayer(id, name) {
    const colorIndex = connectedPlayers.size % gameConfig_1.PLAYER_COLORS.length;
    const spawnAngle = (Math.PI * 2 * colorIndex) / Math.max(connectedPlayers.size, 1);
    const spawnRadius = 10;
    return {
        id,
        name,
        position: [
            Math.cos(spawnAngle) * spawnRadius,
            0.5,
            Math.sin(spawnAngle) * spawnRadius
        ],
        rotation: [0, spawnAngle + Math.PI, 0],
        health: gameConfig_1.GAME_CONFIG.playerHealth,
        maxHealth: gameConfig_1.GAME_CONFIG.playerHealth,
        color: gameConfig_1.PLAYER_COLORS[colorIndex],
        isLocal: false
    };
}
// Función para actualizar el estado del juego
function updateGameState(deltaTime) {
    // Actualizar posiciones de jugadores basadas en su input
    connectedPlayers.forEach((playerData, playerId) => {
        if (gameState.isGameActive) {
            const updatedPlayer = physicsManager.updatePlayer(playerData.player, playerData.lastInput, deltaTime);
            // Debug: solo log si hay movimiento
            if (playerData.lastInput.forward || playerData.lastInput.backward ||
                playerData.lastInput.left || playerData.lastInput.right) {
                console.log(`Actualizando ${playerData.player.name}:`, {
                    oldPos: playerData.player.position,
                    newPos: updatedPlayer.position,
                    input: playerData.lastInput
                });
            }
            playerData.player = updatedPlayer;
            // Actualizar en el estado del juego
            const gamePlayerIndex = gameState.players.findIndex(p => p.id === playerId);
            if (gamePlayerIndex !== -1) {
                gameState.players[gamePlayerIndex] = updatedPlayer;
            }
        }
    });
    // Actualizar proyectiles
    gameState.projectiles = gameState.projectiles
        .map(projectile => physicsManager.updateProjectile(projectile, deltaTime))
        .filter(projectile => projectile.lifetime > 0);
    // Verificar colisiones
    gameState.projectiles = gameState.projectiles.filter(projectile => {
        const hitPlayer = gameState.players.find(player => player.id !== projectile.ownerId &&
            physicsManager.checkCollision(player, projectile));
        if (hitPlayer) {
            // Aplicar daño
            hitPlayer.health = Math.max(0, hitPlayer.health - projectile.damage);
            // Si el jugador murió, respawnear después de un tiempo
            if (hitPlayer.health <= 0) {
                setTimeout(() => {
                    hitPlayer.health = gameConfig_1.GAME_CONFIG.playerHealth;
                    hitPlayer.position = [
                        (Math.random() - 0.5) * 20,
                        0.5,
                        (Math.random() - 0.5) * 20
                    ];
                }, gameConfig_1.GAME_CONFIG.respawnTime);
            }
            return false; // Eliminar proyectil
        }
        return true;
    });
    gameState.gameTime += deltaTime;
}
// Loop del juego
setInterval(() => {
    if (gameState.isGameActive) {
        updateGameState(1 / 60); // 60 FPS
        io.emit('gameState', gameState);
    }
}, 1000 / 60);
// Manejo de conexiones Socket.IO
io.on('connection', (socket) => {
    console.log(`Jugador conectado: ${socket.id}`);
    // Unirse al juego
    socket.on('joinGame', (playerName) => {
        const player = createPlayer(socket.id, playerName || `Player${socket.id.slice(0, 4)}`);
        connectedPlayers.set(socket.id, {
            socket,
            player,
            lastInput: {
                forward: false,
                backward: false,
                left: false,
                right: false,
                shoot: false
            }
        });
        gameState.players.push(player);
        // Activar el juego si hay al menos 1 jugador (para pruebas)
        if (gameState.players.length >= 1) {
            gameState.isGameActive = true;
        }
        socket.emit('playerJoined', player);
        io.emit('gameState', gameState);
        log('info', `${player.name} se unió al juego`);
    });
    // Actualizar input del jugador
    socket.on('playerInput', (input) => {
        console.log(`Socket ${socket.id} envió input:`, input);
        const playerData = connectedPlayers.get(socket.id);
        if (playerData) {
            playerData.lastInput = input;
            console.log(`Input guardado para ${playerData.player.name}:`, input);
            // MOVIMIENTO INMEDIATO Y SIMPLE
            if (input.forward) {
                playerData.player.position[2] -= 0.1; // Mover hacia adelante (más suave)
                console.log(`MOVIMIENTO: ${playerData.player.name} se movió hacia adelante`);
            }
            if (input.backward) {
                playerData.player.position[2] += 0.1; // Mover hacia atrás (más suave)
                console.log(`MOVIMIENTO: ${playerData.player.name} se movió hacia atrás`);
            }
            if (input.left) {
                playerData.player.position[0] -= 0.1; // Mover hacia la izquierda (más suave)
                console.log(`MOVIMIENTO: ${playerData.player.name} se movió hacia la izquierda`);
            }
            if (input.right) {
                playerData.player.position[0] += 0.1; // Mover hacia la derecha (más suave)
                console.log(`MOVIMIENTO: ${playerData.player.name} se movió hacia la derecha`);
            }
            // Actualizar en el estado del juego inmediatamente
            const gamePlayerIndex = gameState.players.findIndex(p => p.id === socket.id);
            if (gamePlayerIndex !== -1) {
                gameState.players[gamePlayerIndex] = playerData.player;
                console.log(`Estado actualizado para ${playerData.player.name}:`, playerData.player.position);
                // ENVIAR EL ESTADO ACTUALIZADO INMEDIATAMENTE
                io.emit('gameState', gameState);
                console.log(`Estado enviado a todos los clientes`);
            }
        }
        else {
            console.log('ERROR: No se encontró playerData para socket:', socket.id);
            console.log('Jugadores conectados:', Array.from(connectedPlayers.keys()));
        }
    });
    // Disparar proyectil
    socket.on('shoot', () => {
        console.log(`🔫 Disparo recibido de ${socket.id}`);
        const playerData = connectedPlayers.get(socket.id);
        if (playerData && gameState.isGameActive) {
            console.log(`💥 Creando proyectil para ${playerData.player.name}`);
            const projectile = physicsManager.createProjectile(playerData.player, [0, 0, 1]);
            gameState.projectiles.push(projectile);
            console.log(`🚀 Proyectil creado, total: ${gameState.projectiles.length}`);
            // Enviar estado actualizado con el nuevo proyectil
            io.emit('gameState', gameState);
        }
        else {
            console.log('❌ No se pudo crear proyectil:', {
                playerData: !!playerData,
                isGameActive: gameState.isGameActive
            });
        }
    });
    // Desconexión
    socket.on('disconnect', () => {
        log('info', `Jugador desconectado: ${socket.id}`);
        const playerData = connectedPlayers.get(socket.id);
        if (playerData) {
            gameState.players = gameState.players.filter(p => p.id !== socket.id);
            connectedPlayers.delete(socket.id);
            // Desactivar el juego si no hay jugadores
            if (gameState.players.length < 1) {
                gameState.isGameActive = false;
            }
            io.emit('gameState', gameState);
        }
    });
});
// Rutas de la API
app.get('/api/status', (_req, res) => {
    res.json({
        status: 'running',
        players: gameState.players.length,
        isGameActive: gameState.isGameActive,
        environment: NODE_ENV,
        timestamp: new Date().toISOString()
    });
});
app.get('/api/players', (_req, res) => {
    res.json(gameState.players.map(p => ({
        id: p.id,
        name: p.name,
        health: p.health,
        color: p.color
    })));
});
// Health check endpoint
app.get(process.env.HEALTH_CHECK_ENDPOINT || '/health', (_req, res) => {
    res.json({
        status: 'healthy',
        service: 'BytesWar Game Server',
        version: '1.0.0',
        environment: NODE_ENV,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        players: gameState.players.length
    });
});
httpServer.listen(PORT, () => {
    log('info', '🎮 Servidor del juego inicializado');
    log('info', `🚀 BytesWar servidor de ${NODE_ENV} ejecutándose en ${HOST}:${PORT}`);
    log('info', `🌐 Cliente disponible en: ${CLIENT_URL}`);
    log('info', `📊 Health check en: ${SERVER_URL}${process.env.HEALTH_CHECK_ENDPOINT || '/health'}`);
    log('info', `🔧 API disponible en: ${SERVER_URL}/api`);
    log('info', `🔒 CORS habilitado: ${ENABLE_CORS}`);
    log('info', `🐛 Debug mode: ${DEBUG}`);
});
