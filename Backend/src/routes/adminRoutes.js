// routes/adminRoutes.js
const express = require('express')
const router  = express.Router()
const {
  getAgents, createAgent, updateAgent, deleteAgent,
  getCustomers, updateCustomer,
  getStats,
} = require('../controllers/adminController')
const { protect, restrictTo } = require('../middleware/auth')

// All admin routes require admin role
router.use(protect, restrictTo('admin'))

// Dashboard stats
router.get('/stats', getStats)

// Agent management
router.get('/agents',       getAgents)
router.post('/agents',      createAgent)
router.patch('/agents/:id', updateAgent)
router.delete('/agents/:id', deleteAgent)

// Customer management
router.get('/customers',        getCustomers)
router.patch('/customers/:id',  updateCustomer)

module.exports = router