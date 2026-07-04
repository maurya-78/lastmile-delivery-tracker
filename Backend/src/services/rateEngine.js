const Zone = require('../models/Zone');
const RateCard = require('../models/RateCard');

const detectZoneByPincode = async (pincode) => {
  const zone = await Zone.findOne({
    'areas.pincode': pincode,
    isActive: true,
  });
  return zone || null;
};

const calculateVolumetricWeight = (length, breadth, height) => {
  // Standard volumetric divisor: 5000 cm³/kg
  return parseFloat(((length * breadth * height) / 5000).toFixed(2));
};

const calculateCharge = async ({ pickup, drop, packageInfo, orderType, paymentType }) => {
  // Step 1: Detect zones
  const pickupZone = await detectZoneByPincode(pickup.pincode);
  const dropZone = await detectZoneByPincode(drop.pincode);

  if (!pickupZone) {
    throw new Error(`Pincode ${pickup.pincode} is not serviceable. Please check and try again.`);
  }
  if (!dropZone) {
    throw new Error(`Pincode ${drop.pincode} is not serviceable. Please check and try again.`);
  }

  // Step 2: Volumetric weight
  const volumetricWeight = calculateVolumetricWeight(
    packageInfo.length,
    packageInfo.breadth,
    packageInfo.height
  );

  // Step 3: Billed weight
  const billedWeight = Math.max(packageInfo.actualWeight, volumetricWeight);

  // Step 4: Load rate card for this order type
  const rateCard = await RateCard.findOne({ orderType, isActive: true })
    .populate('interZoneRates.fromZone interZoneRates.toZone');

  if (!rateCard) {
    throw new Error(`No active rate card configured for ${orderType} orders. Contact admin.`);
  }

  const isIntraZone = pickupZone._id.toString() === dropZone._id.toString();

  let baseCharge = 0;
  let perKgRate = 0;
  let minWeight = 0.5;

  if (isIntraZone) {
    // Use intra-zone rates
    baseCharge = rateCard.intraZoneRate.baseCharge;
    perKgRate = rateCard.intraZoneRate.perKgRate;
    minWeight = rateCard.intraZoneRate.minWeight;
  } else {
    // Find matching inter-zone rate
    const interRate = rateCard.interZoneRates.find(
      (r) =>
        r.fromZone._id.toString() === pickupZone._id.toString() &&
        r.toZone._id.toString() === dropZone._id.toString()
    );

    if (!interRate) {
      throw new Error(
        `No rate configured for delivery from ${pickupZone.name} to ${dropZone.name}. Contact admin.`
      );
    }

    baseCharge = interRate.baseCharge;
    perKgRate = interRate.perKgRate;
    minWeight = interRate.minWeight;
  }

  // Step 5: Weight charge (apply minimum billable weight)
  const chargeableWeight = Math.max(billedWeight, minWeight);
  const weightCharge = parseFloat((chargeableWeight * perKgRate).toFixed(2));

  // Step 6: COD surcharge
  const codSurcharge = paymentType === 'COD' ? rateCard.codSurcharge : 0;

  // Step 7: Total
  const totalCharge = parseFloat((baseCharge + weightCharge + codSurcharge).toFixed(2));

  return {
    pickupZone,
    dropZone,
    volumetricWeight,
    billedWeight: chargeableWeight,
    isIntraZone,
    charge: {
      baseCharge,
      weightCharge,
      codSurcharge,
      totalCharge,
      rateCard: rateCard._id,
      isIntraZone,
    },
  };
};

module.exports = { calculateCharge, detectZoneByPincode, calculateVolumetricWeight };