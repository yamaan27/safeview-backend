const mongoose = require("mongoose");

const upgradeInterestSchema = new mongoose.Schema(
  {
    parentDeviceId: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    kidName: { type: String, required: true },
    isInterested: { type: Boolean, default: true },
    message: { type: String }, // optional message from user
  },
  { timestamps: true }
);

module.exports = mongoose.model("UpgradeInterest", upgradeInterestSchema);
