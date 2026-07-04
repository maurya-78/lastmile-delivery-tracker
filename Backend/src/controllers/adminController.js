const User  = require('../models/User')
const Order = require('../models/Order')
const bcrypt = require('bcryptjs')

// ── AGENTS ──────────────────────────────────────────────────

// GET /api/admin/agents
exports.getAgents = async (req, res) => {
  try {
    const agents = await User.find({ role: 'agent' })
      .populate('currentLocation.zone', 'name code')
      .populate('assignedZones', 'name code')
      .sort({ name: 1 })

    res.json({ success: true, total: agents.length, users: agents })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// POST /api/admin/agents  — create a new agent account
exports.createAgent = async (req, res) => {
  try {
    const { name, email, phone, password, assignedZones } = req.body

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      })
    }

    const agent = await User.create({
      name,
      email,
      phone,
      password,
      role: 'agent',
      isAvailable: true,
      assignedZones: assignedZones || [],
    })

    await agent.populate('assignedZones', 'name code')
    res.status(201).json({ success: true, user: agent })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

// PATCH /api/admin/agents/:id  — update agent availability or zone assignments
exports.updateAgent = async (req, res) => {
  try {
    const { isAvailable, assignedZones, currentZone, name, phone } = req.body

    const updateFields = {}
    if (typeof isAvailable !== 'undefined') updateFields.isAvailable = isAvailable
    if (assignedZones)  updateFields.assignedZones = assignedZones
    if (currentZone)    updateFields['currentLocation.zone'] = currentZone
    if (name)           updateFields.name  = name
    if (phone)          updateFields.phone = phone

    const agent = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'agent' },
      updateFields,
      { new: true, runValidators: true }
    ).populate('assignedZones currentLocation.zone', 'name code')

    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent not found.' })
    }

    res.json({ success: true, user: agent })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

// DELETE /api/admin/agents/:id  — soft-delete (deactivate)
exports.deleteAgent = async (req, res) => {
  try {
    const agent = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'agent' },
      { isActive: false },
      { new: true }
    )
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent not found.' })
    }
    res.json({ success: true, message: 'Agent deactivated.' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── CUSTOMERS ────────────────────────────────────────────────

// GET /api/admin/customers
exports.getCustomers = async (req, res) => {
  try {
    const { search, page = 1, limit = 15 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const filter = { role: 'customer' }
    if (search) {
      filter.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ]
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter),
    ])

    res.json({ success: true, total, page: parseInt(page), users })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// PATCH /api/admin/customers/:id  — activate or deactivate
exports.updateCustomer = async (req, res) => {
  try {
    const { isActive } = req.body

    const customer = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'customer' },
      { isActive },
      { new: true }
    ).select('-password')

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' })
    }

    res.json({ success: true, user: customer })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

// POST /api/admin/customers/:id/order
// Admin creates an order on behalf of a customer (handled in orderController)

// ── DASHBOARD STATS ──────────────────────────────────────────

// GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const [
      totalOrders,
      deliveredOrders,
      failedOrders,
      activeOrders,
      totalCustomers,
      totalAgents,
      availableAgents,
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'Delivered' }),
      Order.countDocuments({ status: 'Failed' }),
      Order.countDocuments({
        status: { $nin: ['Delivered', 'Failed', 'Cancelled'] },
      }),
      User.countDocuments({ role: 'customer', isActive: true }),
      User.countDocuments({ role: 'agent',    isActive: true }),
      User.countDocuments({ role: 'agent',    isActive: true, isAvailable: true }),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('customer', 'name')
        .populate('agent', 'name')
        .select('orderNumber status charge createdAt orderType'),
    ])

    // Orders by status breakdown
    const statusBreakdown = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort:  { count: -1 } },
    ])

    // Revenue: sum of totalCharge on delivered orders
    const revenueResult = await Order.aggregate([
      { $match: { status: 'Delivered' } },
      { $group: { _id: null, total: { $sum: '$charge.totalCharge' } } },
    ])
    const totalRevenue = revenueResult[0]?.total || 0

    res.json({
      success: true,
      stats: {
        orders: {
          total:     totalOrders,
          delivered: deliveredOrders,
          failed:    failedOrders,
          active:    activeOrders,
        },
        users: {
          customers:       totalCustomers,
          agents:          totalAgents,
          availableAgents,
        },
        revenue: totalRevenue,
        statusBreakdown,
        recentOrders,
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}