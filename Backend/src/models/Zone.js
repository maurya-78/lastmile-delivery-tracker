const mongoose = require('mongoose')

const areaSchema = new mongoose.Schema(
  {
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
  },
  { _id: true }
)

const zoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Zone name is required'],
      trim: true,
      unique: true,
    },
    code: {
      type: String,
      required: [true, 'Zone code is required'],
      uppercase: true,
      trim: true,
      unique: true,
    },
    areas: [areaSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

// Index on areas.pincode so zone detection is fast
zoneSchema.index({ 'areas.pincode': 1 })

// Pre-save: trim & normalize all pincodes to string
zoneSchema.pre('save', function (next) {
  this.areas = this.areas.map((a) => ({
    ...a.toObject(),
    pincode: String(a.pincode).trim(),
    city:    a.city.trim(),
    state:   a.state.trim(),
  }))
  next()
})

module.exports = mongoose.model('Zone', zoneSchema)