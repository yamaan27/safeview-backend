const mongoose = require("mongoose");

const parentProfileSchema = new mongoose.Schema(
  {
    parentDeviceId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    kidName: { type: String, required: true },
    trialStartedAt: { type: Date, default: Date.now }, // when trial started
    trialExpiresAt: { type: Date }, // when trial ends
    isTrialExpired: { type: Boolean, default: false }, // lock flag
    isSubscribed: { type: Boolean, default: false },
    subscriptionExpiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ParentProfile", parentProfileSchema);
