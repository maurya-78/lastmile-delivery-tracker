const mongoose = require('mongoose');

const trackingEventSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: [
        'Order Placed',
        'Confirmed',
        'Agent Assigned',
        'Picked Up',
        'In Transit',
        'Out for Delivery',
        'Delivered',
        'Failed',
        'Rescheduled',
        'Cancelled',
      ],
    },
    note: { type: String, default: '' },
    actor: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String },
      role: { type: String, enum: ['customer', 'agent', 'admin', 'system'] },
    },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    pickup: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      zone: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone' },
    },
    drop: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      zone: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone' },
    },
    package: {
      length: { type: Number, required: true }, // cm
      breadth: { type: Number, required: true },
      height: { type: Number, required: true },
      actualWeight: { type: Number, required: true }, // kg
      volumetricWeight: { type: Number }, // auto-calculated
      billedWeight: { type: Number },     // higher of actual vs volumetric
    },
    orderType: {
      type: String,
      enum: ['B2B', 'B2C'],
      required: true,
    },
    paymentType: {
      type: String,
      enum: ['Prepaid', 'COD'],
      required: true,
    },
    charge: {
      baseCharge: { type: Number, default: 0 },
      weightCharge: { type: Number, default: 0 },
      codSurcharge: { type: Number, default: 0 },
      totalCharge: { type: Number, required: true },
      rateCard: { type: mongoose.Schema.Types.ObjectId, ref: 'RateCard' },
      isIntraZone: { type: Boolean },
    },
    status: {
      type: String,
      enum: [
        'Order Placed',
        'Confirmed',
        'Agent Assigned',
        'Picked Up',
        'In Transit',
        'Out for Delivery',
        'Delivered',
        'Failed',
        'Rescheduled',
        'Cancelled',
      ],
      default: 'Order Placed',
    },
    // Immutable tracking timeline
    trackingHistory: [trackingEventSchema],

    scheduledDate: { type: Date },
    rescheduledDate: { type: Date },
    deliveredAt: { type: Date },
    failureReason: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-generate order number before save
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    const pad = String(count + 1).padStart(6, '0');
    this.orderNumber = `LMD${Date.now().toString().slice(-6)}${pad}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);