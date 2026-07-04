const User = require('../models/User');


const findNearestAvailableAgent = async (pickupZoneId) => {
  // Priority 1: Available agent currently in the pickup zone
  let agent = await User.findOne({
    role: 'agent',
    isActive: true,
    isAvailable: true,
    'currentLocation.zone': pickupZoneId,
  }).populate('currentLocation.zone assignedZones');

  if (agent) return agent;

  // Priority 2: Available agent assigned to pickup zone (but may be elsewhere)
  agent = await User.findOne({
    role: 'agent',
    isActive: true,
    isAvailable: true,
    assignedZones: pickupZoneId,
  }).populate('currentLocation.zone assignedZones');

  if (agent) return agent;

  // Priority 3: Any available agent (system-wide fallback)
  agent = await User.findOne({
    role: 'agent',
    isActive: true,
    isAvailable: true,
  }).populate('currentLocation.zone assignedZones');

  return agent || null;
};

const markAgentBusy = async (agentId) => {
  await User.findByIdAndUpdate(agentId, { isAvailable: false });
};

const markAgentAvailable = async (agentId) => {
  await User.findByIdAndUpdate(agentId, { isAvailable: true });
};

module.exports = { findNearestAvailableAgent, markAgentBusy, markAgentAvailable };