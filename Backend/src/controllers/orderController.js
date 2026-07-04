const Order = require('../models/Order');
const User = require('../models/User');
const { calculateCharge } = require('../services/rateEngine');
const { findNearestAvailableAgent, markAgentBusy, markAgentAvailable } = require('../services/assignmentService');
const { sendStatusEmail } = require('../services/emailService');

// Helper: add a tracking event (immutable log)
const addTrackingEvent = (order, status, actor, note = '') => {
  order.trackingHistory.push({
    status,
    note,
    actor,
    timestamp: new Date(),
  });
  order.status = status;
};

// GET /api/orders/estimate - calculate charges before placing order
exports.estimateCharge = async (req, res) => {
  try {
    const { pickup, drop, packageInfo, orderType, paymentType } = req.body;
    const result = await calculateCharge({ pickup, drop, packageInfo, orderType, paymentType });

    res.json({
      success: true,
      estimate: {
        pickupZone: { id: result.pickupZone._id, name: result.pickupZone.name },
        dropZone: { id: result.dropZone._id, name: result.dropZone.name },
        isIntraZone: result.isIntraZone,
        volumetricWeight: result.volumetricWeight,
        billedWeight: result.billedWeight,
        charge: result.charge,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// POST /api/orders - place order (customer or admin on behalf)
exports.createOrder = async (req, res) => {
  try {
    const {
      pickup, drop, packageInfo, orderType, paymentType,
      scheduledDate, customerId, // admin can pass customerId
    } = req.body;

    const targetCustomerId =
      req.user.role === 'admin' && customerId ? customerId : req.user._id;

    const customer = await User.findById(targetCustomerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    // Calculate charges
    const rateResult = await calculateCharge({ pickup, drop, packageInfo, orderType, paymentType });

    const volumetricWeight = rateResult.volumetricWeight;
    const billedWeight = rateResult.billedWeight;

    const order = new Order({
      customer: targetCustomerId,
      pickup: { ...pickup, zone: rateResult.pickupZone._id },
      drop: { ...drop, zone: rateResult.dropZone._id },
      package: {
        ...packageInfo,
        volumetricWeight,
        billedWeight,
      },
      orderType,
      paymentType,
      charge: rateResult.charge,
      scheduledDate: scheduledDate || new Date(),
      trackingHistory: [],
    });

    const actor = { userId: req.user._id, name: req.user.name, role: req.user.role };
    addTrackingEvent(order, 'Order Placed', actor, 'Order created successfully.');

    await order.save();
    await order.populate('customer pickup.zone drop.zone');

    // Send email notification
    await sendStatusEmail(customer.email, customer.name, order, 'Order Placed');

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/orders - list orders (scoped by role)
exports.getOrders = async (req, res) => {
  try {
    const { status, zone, agentId, page = 1, limit = 20 } = req.query;

    let filter = {};
    if (req.user.role === 'customer') filter.customer = req.user._id;
    if (req.user.role === 'agent') filter.agent = req.user._id;

    if (status) filter.status = status;
    if (zone) filter.$or = [{ 'pickup.zone': zone }, { 'drop.zone': zone }];
    if (agentId && req.user.role === 'admin') filter.agent = agentId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('customer', 'name email phone')
        .populate('agent', 'name email phone')
        .populate('pickup.zone drop.zone', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({ success: true, total, page: parseInt(page), orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/:id - single order with full timeline
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('agent', 'name email phone')
      .populate('pickup.zone drop.zone', 'name code')
      .populate('charge.rateCard', 'name orderType');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    // Access control: customer can only see their own order
    if (req.user.role === 'customer' && order.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    if (req.user.role === 'agent' && order.agent?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/track/:orderNumber - public tracking (no auth)
exports.trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .populate('pickup.zone drop.zone', 'name')
      .populate('agent', 'name phone')
      .select('-customer -charge.rateCard');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found. Check the order number.' });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/orders/:id/assign - manual or auto agent assignment (admin)
exports.assignAgent = async (req, res) => {
  try {
    const { agentId, auto } = req.body;
    const order = await Order.findById(req.params.id).populate('customer');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    let agent;
    if (auto) {
      agent = await findNearestAvailableAgent(order.pickup.zone);
      if (!agent) {
        return res.status(400).json({ success: false, message: 'No available agents right now. Try again later.' });
      }
    } else {
      agent = await User.findById(agentId);
      if (!agent || agent.role !== 'agent') {
        return res.status(400).json({ success: false, message: 'Invalid agent selected.' });
      }
    }

    // Free up previously assigned agent
    if (order.agent) {
      await markAgentAvailable(order.agent);
    }

    order.agent = agent._id;
    await markAgentBusy(agent._id);

    const actor = { userId: req.user._id, name: req.user.name, role: req.user.role };
    addTrackingEvent(order, 'Agent Assigned', actor, `Agent ${agent.name} assigned.`);

    await order.save();
    await order.populate('agent', 'name email phone');

    await sendStatusEmail(order.customer.email, order.customer.name, order, 'Agent Assigned', agent.name);

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/orders/:id/status - update status (agent or admin)
exports.updateStatus = async (req, res) => {
  try {
    const { status, note, failureReason } = req.body;
    const order = await Order.findById(req.params.id).populate('customer', 'name email');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    // Agent can only update their own orders
    if (req.user.role === 'agent' && order.agent?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only update orders assigned to you.' });
    }

    const actor = { userId: req.user._id, name: req.user.name, role: req.user.role };
    addTrackingEvent(order, status, actor, note || '');

    if (status === 'Delivered') {
      order.deliveredAt = new Date();
      if (order.agent) await markAgentAvailable(order.agent);
    }

    if (status === 'Failed') {
      order.failureReason = failureReason || 'Delivery attempt failed';
      if (order.agent) await markAgentAvailable(order.agent);
    }

    await order.save();

    await sendStatusEmail(
      order.customer.email,
      order.customer.name,
      order,
      status
    );

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/orders/:id/reschedule - customer reschedules after failed delivery
exports.rescheduleOrder = async (req, res) => {
  try {
    const { rescheduledDate } = req.body;
    const order = await Order.findById(req.params.id).populate('customer', 'name email');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    if (order.status !== 'Failed') {
      return res.status(400).json({ success: false, message: 'Only failed orders can be rescheduled.' });
    }

    if (req.user.role === 'customer' && order.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    order.rescheduledDate = new Date(rescheduledDate);
    order.agent = null; // Clear agent — will be reassigned

    const actor = { userId: req.user._id, name: req.user.name, role: req.user.role };
    addTrackingEvent(order, 'Rescheduled', actor, `Rescheduled for ${new Date(rescheduledDate).toLocaleDateString()}.`);

    // Auto-assign new agent
    const agent = await findNearestAvailableAgent(order.pickup.zone);
    if (agent) {
      order.agent = agent._id;
      await markAgentBusy(agent._id);
      addTrackingEvent(order, 'Agent Assigned', { userId: null, name: 'System', role: 'system' }, `New agent ${agent.name} assigned for rescheduled delivery.`);
    }

    await order.save();
    await sendStatusEmail(order.customer.email, order.customer.name, order, 'Rescheduled');

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};