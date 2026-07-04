require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const User     = require('../models/User')
const Zone     = require('../models/Zone')
const RateCard = require('../models/RateCard')

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lastmile'

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI)
    console.log(' MongoDB connected')

    // ── Wipe existing seed data ──────────────────────────────
    await User.deleteMany({})
    await Zone.deleteMany({})
    await RateCard.deleteMany({})
    console.log(' Cleared existing data')

    // ── ZONES with real pincodes ─────────────────────────────
    const zones = await Zone.insertMany([
      {
        name: 'North Mumbai',
        code: 'NMUM',
        isActive: true,
        areas: [
          { pincode: '400001', city: 'Mumbai',       state: 'Maharashtra' },
          { pincode: '400002', city: 'Mumbai',       state: 'Maharashtra' },
          { pincode: '400003', city: 'Mumbai',       state: 'Maharashtra' },
          { pincode: '400004', city: 'Mumbai',       state: 'Maharashtra' },
          { pincode: '400050', city: 'Bandra',       state: 'Maharashtra' },
          { pincode: '400051', city: 'Bandra East',  state: 'Maharashtra' },
          { pincode: '400052', city: 'Khar',         state: 'Maharashtra' },
          { pincode: '400054', city: 'Santacruz',    state: 'Maharashtra' },
        ],
      },
      {
        name: 'South Mumbai',
        code: 'SMUM',
        isActive: true,
        areas: [
          { pincode: '400005', city: 'Mumbai',       state: 'Maharashtra' },
          { pincode: '400006', city: 'Mumbai',       state: 'Maharashtra' },
          { pincode: '400007', city: 'Mumbai',       state: 'Maharashtra' },
          { pincode: '400020', city: 'Fort',         state: 'Maharashtra' },
          { pincode: '400021', city: 'Colaba',       state: 'Maharashtra' },
          { pincode: '400025', city: 'Worli',        state: 'Maharashtra' },
          { pincode: '400028', city: 'Dadar',        state: 'Maharashtra' },
        ],
      },
      {
        name: 'Pune Central',
        code: 'PUNE',
        isActive: true,
        areas: [
          { pincode: '411001', city: 'Pune',         state: 'Maharashtra' },
          { pincode: '411002', city: 'Pune',         state: 'Maharashtra' },
          { pincode: '411003', city: 'Pune',         state: 'Maharashtra' },
          { pincode: '411004', city: 'Shivajinagar', state: 'Maharashtra' },
          { pincode: '411005', city: 'Deccan',       state: 'Maharashtra' },
          { pincode: '411006', city: 'Kothrud',      state: 'Maharashtra' },
          { pincode: '411007', city: 'Sinhagad',     state: 'Maharashtra' },
          { pincode: '411011', city: 'Hadapsar',     state: 'Maharashtra' },
          { pincode: '411014', city: 'Aundh',        state: 'Maharashtra' },
        ],
      },
      {
        name: 'Delhi NCR',
        code: 'DLNC',
        isActive: true,
        areas: [
          { pincode: '110001', city: 'New Delhi',    state: 'Delhi' },
          { pincode: '110002', city: 'New Delhi',    state: 'Delhi' },
          { pincode: '110003', city: 'New Delhi',    state: 'Delhi' },
          { pincode: '110005', city: 'New Delhi',    state: 'Delhi' },
          { pincode: '110006', city: 'New Delhi',    state: 'Delhi' },
          { pincode: '110007', city: 'New Delhi',    state: 'Delhi' },
          { pincode: '110008', city: 'New Delhi',    state: 'Delhi' },
          { pincode: '110009', city: 'New Delhi',    state: 'Delhi' },
          { pincode: '110010', city: 'New Delhi',    state: 'Delhi' },
          { pincode: '201301', city: 'Noida',        state: 'Uttar Pradesh' },
          { pincode: '201302', city: 'Noida',        state: 'Uttar Pradesh' },
          { pincode: '122001', city: 'Gurugram',     state: 'Haryana' },
          { pincode: '122002', city: 'Gurugram',     state: 'Haryana' },
        ],
      },
    ])

    const [nmum, smum, pune, dlnc] = zones
    console.log(`Created ${zones.length} zones with pincodes`)

    // ── RATE CARDS ───────────────────────────────────────────
    await RateCard.insertMany([
      {
        name: 'Standard B2C',
        orderType: 'B2C',
        isActive: true,
        intraZoneRate: {
          baseCharge: 40,
          perKgRate:  15,
          minWeight:  0.5,
        },
        codSurcharge: 15,
        interZoneRates: [
          { fromZone: nmum._id, toZone: smum._id, baseCharge: 60,  perKgRate: 20, minWeight: 0.5 },
          { fromZone: smum._id, toZone: nmum._id, baseCharge: 60,  perKgRate: 20, minWeight: 0.5 },

          { fromZone: nmum._id, toZone: pune._id, baseCharge: 80,  perKgRate: 30, minWeight: 0.5 },
          { fromZone: smum._id, toZone: pune._id, baseCharge: 80,  perKgRate: 30, minWeight: 0.5 },
          
          { fromZone: pune._id, toZone: nmum._id, baseCharge: 80,  perKgRate: 30, minWeight: 0.5 },
          { fromZone: pune._id, toZone: smum._id, baseCharge: 80,  perKgRate: 30, minWeight: 0.5 },
          
          { fromZone: dlnc._id, toZone: nmum._id, baseCharge: 120, perKgRate: 40, minWeight: 1 },
          { fromZone: dlnc._id, toZone: smum._id, baseCharge: 120, perKgRate: 40, minWeight: 1 },
          { fromZone: dlnc._id, toZone: pune._id, baseCharge: 130, perKgRate: 42, minWeight: 1 },
          { fromZone: nmum._id, toZone: dlnc._id, baseCharge: 120, perKgRate: 40, minWeight: 1 },
          { fromZone: smum._id, toZone: dlnc._id, baseCharge: 120, perKgRate: 40, minWeight: 1 },
          { fromZone: pune._id, toZone: dlnc._id, baseCharge: 130, perKgRate: 42, minWeight: 1 },
        ],
      },
      {
        name: 'Bulk B2B',
        orderType: 'B2B',
        isActive: true,
        intraZoneRate: {
          baseCharge: 60,
          perKgRate:  12,
          minWeight:  1,
        },
        codSurcharge: 25,
        interZoneRates: [
          { fromZone: nmum._id, toZone: smum._id, baseCharge: 80,  perKgRate: 18, minWeight: 1 },
          { fromZone: smum._id, toZone: nmum._id, baseCharge: 80,  perKgRate: 18, minWeight: 1 },
          { fromZone: nmum._id, toZone: pune._id, baseCharge: 100, perKgRate: 25, minWeight: 1 },
          { fromZone: smum._id, toZone: pune._id, baseCharge: 100, perKgRate: 25, minWeight: 1 },
          { fromZone: pune._id, toZone: nmum._id, baseCharge: 100, perKgRate: 25, minWeight: 1 },
          { fromZone: pune._id, toZone: smum._id, baseCharge: 100, perKgRate: 25, minWeight: 1 },
          { fromZone: dlnc._id, toZone: nmum._id, baseCharge: 150, perKgRate: 35, minWeight: 2 },
          { fromZone: dlnc._id, toZone: smum._id, baseCharge: 150, perKgRate: 35, minWeight: 2 },
          { fromZone: dlnc._id, toZone: pune._id, baseCharge: 160, perKgRate: 38, minWeight: 2 },
          { fromZone: nmum._id, toZone: dlnc._id, baseCharge: 150, perKgRate: 35, minWeight: 2 },
          { fromZone: smum._id, toZone: dlnc._id, baseCharge: 150, perKgRate: 35, minWeight: 2 },
          { fromZone: pune._id, toZone: dlnc._id, baseCharge: 160, perKgRate: 38, minWeight: 2 },
        ],
      },
    ])
    console.log(' Created B2C and B2B rate cards')

    // ── USERS ────────────────────────────────────────────────


    // Admin
    const admin = await User.create({
      name:     'Admin User',
      email:    'admin@lastmile.com',
      phone:    '+91 98000 00001',
      password: 'admin123',
      role:     'admin',
      isActive: true,
    })

    // Agents — assigned to zones
    const agent1 = await User.create({
      name:          'Ravi Kumar',
      email:         'agent@lastmile.com',
      phone:         '+91 98000 00002',
      password:      'agent123',
      role:          'agent',
      isActive:      true,
      isAvailable:   true,
      assignedZones: [nmum._id, smum._id],
      currentLocation: { zone: nmum._id },
    })

    const agent2 = await User.create({
      name:          'Suresh Verma',
      email:         'agent2@lastmile.com',
      phone:         '+91 98000 00003',
      password:      'agent123',
      role:          'agent',
      isActive:      true,
      isAvailable:   true,
      assignedZones: [pune._id],
      currentLocation: { zone: pune._id },
    })

    // Customer
    const customer = await User.create({
      name:     'Priya Sharma',
      email:    'customer@lastmile.com',
      phone:    '+91 98000 00004',
      password: 'cust123',
      role:     'customer',
      isActive: true,
    })

    console.log(' Created users:')
    console.log(`   Admin    → admin@lastmile.com    / admin123`)
    console.log(`   Agent 1  → agent@lastmile.com    / agent123`)
    console.log(`   Agent 2  → agent2@lastmile.com   / agent123`)
    console.log(`   Customer → customer@lastmile.com / cust123`)

    // ── Summary ──────────────────────────────────────────────
    console.log('\n Seed complete! You can now:')
    console.log('   1. Start backend:  npm run dev')
    console.log('   2. Start frontend: cd ../frontend && npm run dev')
    console.log('\n Test pincodes (pickup/drop):')
    console.log('   North Mumbai: 400001, 400002, 400050, 400054')
    console.log('   South Mumbai: 400005, 400020, 400021, 400028')
    console.log('   Pune Central: 411001, 411004, 411011')
    console.log('   Delhi NCR:    110001, 110005, 201301, 122001')

    process.exit(0)
  } catch (err) {
    console.error('Seed failed:', err.message)
    process.exit(1)
  }
}

seed()