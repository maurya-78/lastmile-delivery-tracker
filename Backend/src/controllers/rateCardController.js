const RateCard = require('../models/RateCard')

// GET /api/rate-cards
exports.getRateCards = async (req, res) => {
  try {
    const rateCards = await RateCard.find()
      .populate('interZoneRates.fromZone interZoneRates.toZone', 'name code')
      .sort({ orderType: 1, createdAt: -1 })

    res.json({ success: true, rateCards })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/rate-cards/:id
exports.getRateCard = async (req, res) => {
  try {
    const rateCard = await RateCard.findById(req.params.id)
      .populate('interZoneRates.fromZone interZoneRates.toZone', 'name code')

    if (!rateCard) {
      return res.status(404).json({ success: false, message: 'Rate card not found.' })
    }

    res.json({ success: true, rateCard })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// POST /api/rate-cards
exports.createRateCard = async (req, res) => {
  try {
    const { name, orderType, intraZoneRate, interZoneRates, codSurcharge } = req.body

    // Only one active rate card per order type allowed
    const existing = await RateCard.findOne({ orderType, isActive: true })
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `An active ${orderType} rate card already exists. Deactivate it first or edit it directly.`,
      })
    }

    const rateCard = await RateCard.create({
      name,
      orderType,
      intraZoneRate,
      interZoneRates: interZoneRates || [],
      codSurcharge: codSurcharge || 0,
    })

    await rateCard.populate('interZoneRates.fromZone interZoneRates.toZone', 'name code')
    res.status(201).json({ success: true, rateCard })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

// PUT /api/rate-cards/:id
exports.updateRateCard = async (req, res) => {
  try {
    const { name, intraZoneRate, interZoneRates, codSurcharge, isActive } = req.body

    const rateCard = await RateCard.findByIdAndUpdate(
      req.params.id,
      { name, intraZoneRate, interZoneRates, codSurcharge, isActive },
      { new: true, runValidators: true }
    ).populate('interZoneRates.fromZone interZoneRates.toZone', 'name code')

    if (!rateCard) {
      return res.status(404).json({ success: false, message: 'Rate card not found.' })
    }

    res.json({ success: true, rateCard })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

// PATCH /api/rate-cards/:id/toggle
exports.toggleRateCard = async (req, res) => {
  try {
    const rateCard = await RateCard.findById(req.params.id)
    if (!rateCard) {
      return res.status(404).json({ success: false, message: 'Rate card not found.' })
    }

    rateCard.isActive = !rateCard.isActive
    await rateCard.save()

    res.json({
      success: true,
      message: `Rate card ${rateCard.isActive ? 'activated' : 'deactivated'}.`,
      rateCard,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// DELETE /api/rate-cards/:id
exports.deleteRateCard = async (req, res) => {
  try {
    const rateCard = await RateCard.findByIdAndDelete(req.params.id)
    if (!rateCard) {
      return res.status(404).json({ success: false, message: 'Rate card not found.' })
    }
    res.json({ success: true, message: 'Rate card deleted.' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// POST /api/rate-cards/:id/inter-zone
// Add a single inter-zone route to an existing rate card
exports.addInterZoneRate = async (req, res) => {
  try {
    const { fromZone, toZone, baseCharge, perKgRate, minWeight } = req.body
    const rateCard = await RateCard.findById(req.params.id)

    if (!rateCard) {
      return res.status(404).json({ success: false, message: 'Rate card not found.' })
    }

    // Check duplicate route
    const duplicate = rateCard.interZoneRates.find(
      (r) =>
        r.fromZone.toString() === fromZone &&
        r.toZone.toString()   === toZone
    )
    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: 'A rate for this zone pair already exists. Edit it instead.',
      })
    }

    rateCard.interZoneRates.push({ fromZone, toZone, baseCharge, perKgRate, minWeight: minWeight || 0.5 })
    await rateCard.save()
    await rateCard.populate('interZoneRates.fromZone interZoneRates.toZone', 'name code')

    res.json({ success: true, rateCard })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

// DELETE /api/rate-cards/:id/inter-zone/:routeId
exports.removeInterZoneRate = async (req, res) => {
  try {
    const rateCard = await RateCard.findById(req.params.id)
    if (!rateCard) {
      return res.status(404).json({ success: false, message: 'Rate card not found.' })
    }

    rateCard.interZoneRates = rateCard.interZoneRates.filter(
      (r) => r._id.toString() !== req.params.routeId
    )
    await rateCard.save()

    res.json({ success: true, message: 'Inter-zone route removed.', rateCard })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}