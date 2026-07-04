// routes/zoneRoutes.js
const express = require('express')
const router  = express.Router()
const {
  getZones, getZone, createZone, updateZone,
  addArea, removeArea, lookupPincode,
} = require('../controllers/zoneController')
const { protect, restrictTo } = require('../middleware/auth')

// Public — pincode serviceability check (used in PlaceOrder form)
router.get('/lookup/:pincode', lookupPincode)

// Public — list zones (needed by frontend dropdowns)
router.get('/', getZones)
router.get('/:id', getZone)

// Admin only
router.post('/', protect, restrictTo('admin'), createZone)
router.put('/:id', protect, restrictTo('admin'), updateZone)
router.post('/:id/areas', protect, restrictTo('admin'), addArea)
router.delete('/:id/areas/:pincode', protect, restrictTo('admin'), removeArea)

module.exports = router