const Zone = require('../models/Zone')

// GET /api/zones
exports.getZones = async (req, res) => {
  try {
    const zones = await Zone.find({ isActive: true }).sort({ name: 1 })
    res.json({ success: true, zones })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/zones/:id
exports.getZone = async (req, res) => {
  try {
    const zone = await Zone.findById(req.params.id)
    if (!zone) return res.status(404).json({ success: false, message: 'Zone not found.' })
    res.json({ success: true, zone })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// POST /api/zones  (admin only)
exports.createZone = async (req, res) => {
  try {
    const { name, code, areas } = req.body

    // Normalize any pre-supplied areas
    const normalizedAreas = (areas || []).map((a) => ({
      pincode: String(a.pincode).trim(),
      city:    a.city.trim(),
      state:   a.state.trim(),
    }))

    const zone = await Zone.create({ name, code, areas: normalizedAreas })
    res.status(201).json({ success: true, zone })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

// PUT /api/zones/:id  (admin only)
exports.updateZone = async (req, res) => {
  try {
    const zone = await Zone.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!zone) return res.status(404).json({ success: false, message: 'Zone not found.' })
    res.json({ success: true, zone })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

// POST /api/zones/:id/areas  — add a single pincode to a zone
exports.addArea = async (req, res) => {
  try {
    const zone = await Zone.findById(req.params.id)
    if (!zone) return res.status(404).json({ success: false, message: 'Zone not found.' })

    // Always normalize pincode to trimmed string
    const pincode = String(req.body.pincode).trim()
    const city    = req.body.city.trim()
    const state   = req.body.state.trim()

    if (!pincode || !city || !state) {
      return res.status(400).json({ success: false, message: 'pincode, city and state are required.' })
    }

    // Check pincode not already in another zone
    const existingZone = await Zone.findOne({ 'areas.pincode': pincode })
    if (existingZone && existingZone._id.toString() !== zone._id.toString()) {
      return res.status(400).json({
        success: false,
        message: `Pincode ${pincode} is already assigned to zone "${existingZone.name}".`,
      })
    }

    // Check not already in this zone
    const alreadyHere = zone.areas.some((a) => a.pincode === pincode)
    if (alreadyHere) {
      return res.status(400).json({
        success: false,
        message: `Pincode ${pincode} is already in this zone.`,
      })
    }

    zone.areas.push({ pincode, city, state })
    await zone.save()
    res.json({ success: true, zone })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

// DELETE /api/zones/:id/areas/:pincode  — remove a pincode from a zone
exports.removeArea = async (req, res) => {
  try {
    const zone = await Zone.findById(req.params.id)
    if (!zone) return res.status(404).json({ success: false, message: 'Zone not found.' })

    const pincode = String(req.params.pincode).trim()
    const before  = zone.areas.length
    zone.areas    = zone.areas.filter((a) => a.pincode !== pincode)

    if (zone.areas.length === before) {
      return res.status(404).json({ success: false, message: `Pincode ${pincode} not found in this zone.` })
    }

    await zone.save()
    res.json({ success: true, zone })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

// GET /api/zones/lookup/:pincode  — public: check if pincode is serviceable
exports.lookupPincode = async (req, res) => {
  try {
    const pincode = String(req.params.pincode).trim()

    const zone = await Zone.findOne({
      'areas.pincode': pincode,
      isActive: true,
    })

    if (!zone) {
      return res.status(404).json({
        success: false,
        message: `Pincode ${pincode} is not serviceable yet.`,
      })
    }

    const area = zone.areas.find((a) => a.pincode === pincode)
    res.json({
      success: true,
      serviceable: true,
      zone: { id: zone._id, name: zone.name, code: zone.code },
      area,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}