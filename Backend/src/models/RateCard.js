const mongoose = require('mongoose');

const rateCardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    orderType: {
      type: String,
      enum: ['B2B', 'B2C'],
      required: true,
    },
    // Intra-zone rates (same zone pickup & drop)
    intraZoneRate: {
      baseCharge: { type: Number, required: true }, // fixed base charge
      perKgRate: { type: Number, required: true },  // charge per kg
      minWeight: { type: Number, default: 0.5 },    // minimum billable weight in kg
    },
    // Inter-zone rates (different zones)
    interZoneRates: [
      {
        fromZone: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone', required: true },
        toZone: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone', required: true },
        baseCharge: { type: Number, required: true },
        perKgRate: { type: Number, required: true },
        minWeight: { type: Number, default: 0.5 },
      },
    ],
    codSurcharge: {
      type: Number,
      required: true,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RateCard', rateCardSchema);