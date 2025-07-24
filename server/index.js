import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Importar el servidor del juego
import './gameServer.js'

const app = express()
const httpServer = createServer(app)

// Configurar CORS
app.use(cors({
  origin: ["http://byteswar.31.97.151.147.sslip.io", "https://byteswar.31.97.151.147.sslip.io", "http://localhost:3000", "http://localhost:3001"],
  credentials: true
}))

// Servir archivos estáticos del build
app.use(express.static(path.join(__dirname, '../dist')))

// API routes
app.get('/api/status', (_req, res) => {
  res.json({
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// Health check para Docker
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'healthy' })
})

// Servir la aplicación React para todas las rutas
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error en el servidor:', err)
  res.status(500).json({ error: 'Error interno del servidor' })
})

const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`🚀 BytesWar servidor de producción ejecutándose en puerto ${PORT}`)
  console.log(`🌐 Accede al juego en: http://localhost:${PORT}`)
  console.log(`📊 Health check en: http://localhost:${PORT}/health`)
})

// Manejo de señales para cierre graceful
process.on('SIGTERM', () => {
  console.log('🛑 Recibida señal SIGTERM, cerrando servidor...')
  httpServer.close(() => {
    console.log('✅ Servidor cerrado correctamente')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('🛑 Recibida señal SIGINT, cerrando servidor...')
  httpServer.close(() => {
    console.log('✅ Servidor cerrado correctamente')
    process.exit(0)
  })
}) 