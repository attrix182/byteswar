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
app.use(cors())

// Servir archivos estáticos del build
app.use(express.static(path.join(__dirname, '../dist')))

// API routes
app.get('/api/status', (_req, res) => {
  res.json({
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
})

// Servir la aplicación React para todas las rutas
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`🚀 BytesWar servidor de producción ejecutándose en puerto ${PORT}`)
  console.log(`🌐 Accede al juego en: http://localhost:${PORT}`)
}) 