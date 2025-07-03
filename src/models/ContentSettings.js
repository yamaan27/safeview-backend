const mongoose = require("mongoose");

const contentSettingsSchema = new mongoose.Schema({
  childDeviceId: { type: String, required: true, unique: true },
  allowSearch: { type: Boolean, default: true },
  allowAutoplay: { type: Boolean, default: true },
  blockedChannels: [String],
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ContentSettings", contentSettingsSchema);
