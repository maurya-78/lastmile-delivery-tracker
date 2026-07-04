const jwt  = require('jsonwebtoken')
const User = require('../models/User')

// ── Helper: sign JWT ─────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })

// ── Helper: strip password and send token ───────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token   = signToken(user._id)
  const userObj = user.toObject()
  delete userObj.password

  res.status(statusCode).json({ success: true, token, user: userObj })
}

// ── POST /api/auth/register  (customer self-signup only) ────
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone and password are all required.',
      })
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      })
    }

    // Register always creates a customer — agents & admins are created by admin panel
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      role: role ||'customer',
    })

    sendTokenResponse(user, 201, res)
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── POST /api/auth/login  (all roles — customer, agent, admin) ──
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      })
    }

    // Find user by email regardless of role — agent & admin can log in here too
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate('currentLocation.zone assignedZones', 'name code')

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this email.',
      })
    }

    const passwordMatch = await user.comparePassword(password)
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please try again.',
      })
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Contact support.',
      })
    }

    
    sendTokenResponse(user, 200, res)
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── GET /api/auth/me  (any authenticated user) ──────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('currentLocation.zone', 'name code')
      .populate('assignedZones', 'name code')

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' })
    }

    res.status(200).json({ success: true, user })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── PATCH /api/auth/me  (update own name/phone) ─────────────
exports.updateMe = async (req, res) => {
  try {
    const { name, phone } = req.body
    const updates = {}
    if (name)  updates.name  = name
    if (phone) updates.phone = phone

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).populate('currentLocation.zone assignedZones', 'name code')

    res.json({ success: true, user })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}