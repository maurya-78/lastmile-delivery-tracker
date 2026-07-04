// routes/rateCardRoutes.js
const express = require('express')
const router  = express.Router()
const {
  getRateCards, getRateCard, createRateCard, updateRateCard,
  toggleRateCard, deleteRateCard, addInterZoneRate, removeInterZoneRate,
} = require('../controllers/rateCardController')
const { protect, restrictTo } = require('../middleware/auth')

// All rate card routes are admin-only
router.use(protect, restrictTo('admin'))

router.get('/',    getRateCards)
router.get('/:id', getRateCard)
router.post('/',   createRateCard)
router.put('/:id', updateRateCard)
router.patch('/:id/toggle', toggleRateCard)
router.delete('/:id', deleteRateCard)

// Inter-zone rate rows
router.post('/:id/inter-zone',            addInterZoneRate)
router.delete('/:id/inter-zone/:routeId', removeInterZoneRate)

module.exports = router