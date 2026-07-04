// routes/orderRoutes.js
const express = require('express')
const router  = express.Router()
const {
  estimateCharge,
  createOrder,
  getOrders,
  getOrder,
  trackOrder,
  assignAgent,
  updateStatus,
  rescheduleOrder,
} = require('../controllers/orderController')
const { protect, restrictTo } = require('../middleware/auth')

// ── Public ───────────────────────────────────────────────────
// Track by order number — shareable link, no auth needed
router.get('/track/:orderNumber', trackOrder)

// ── Protected: customer + admin ──────────────────────────────
// Estimate charge before placing (used in PlaceOrder step 2→3)
router.post('/estimate', protect, restrictTo('customer', 'admin'), estimateCharge)

// Place order
router.post('/', protect, restrictTo('customer', 'admin'), createOrder)

// List orders (scoped by role inside controller)
router.get('/', protect, getOrders)

// Single order detail
router.get('/:id', protect, getOrder)

// ── Admin only ───────────────────────────────────────────────
// Assign agent (manual or auto)
router.post('/:id/assign', protect, restrictTo('admin'), assignAgent)

// ── Agent + Admin ────────────────────────────────────────────
// Update delivery status (Picked Up / In Transit / Delivered / Failed …)
router.patch('/:id/status', protect, restrictTo('agent', 'admin'), updateStatus)

// ── Customer + Admin ─────────────────────────────────────────
// Reschedule after failed delivery
router.post('/:id/reschedule', protect, restrictTo('customer', 'admin'), rescheduleOrder)

module.exports = router