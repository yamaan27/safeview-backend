const mongoose = require("mongoose");

const contentSettingsSchema = new mongoose.Schema({
  childDeviceId: { type: String, required: true, unique: true },

  // ✅ Existing
  allowSearch: { type: Boolean, default: true },
  allowAutoplay: { type: Boolean, default: true },
  blockedChannels: [String],

  // ✅ New: unsafe video URLs or IDs (manual blocklist)
  blockedVideos: [String],

  // ✅ New: screen time limit in minutes per day
  screenTimeLimitMins: { type: Number, default: 60 }, // e.g. 1 hour/day

  // ✅ New: parent can temporarily lock/unlock child app
  isLocked: { type: Boolean, default: false },

  updatedAt: { type: Date, default: Date.now },
});


module.exports = mongoose.model("ContentSettings", contentSettingsSchema);
