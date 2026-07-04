require('dotenv').config()
const express = require('express')
const cors    = require('cors')
const connectDB = require('./config/db')

// ── Route imports ────────────────────────────────────────────
const authRoutes     = require('./routes/authRoutes')
const zoneRoutes     = require('./routes/zoneRoutes')
const rateCardRoutes = require('./routes/rateCardRoutes')
const orderRoutes    = require('./routes/orderRoutes')
const adminRoutes    = require('./routes/adminRoutes')

// ── Connect MongoDB ──────────────────────────────────────────
connectDB()

const app = express()

// ── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Request logger (dev only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.originalUrl}`)
    next()
  })
}

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'LastMile API is running', time: new Date() })
})

// ── API Routes ───────────────────────────────────────────────
app.use('/api/auth',       authRoutes)
app.use('/api/zones',      zoneRoutes)
app.use('/api/rate-cards', rateCardRoutes)
app.use('/api/orders',     orderRoutes)
app.use('/api/admin',      adminRoutes)

// ── 404 handler ──────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' })
})

// ── Global error handler ─────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err)
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error.',
  })
})

// ── Start server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`LastMile API running on http://localhost:${PORT}`)
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`)
})