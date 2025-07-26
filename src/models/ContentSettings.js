const mongoose = require("mongoose");

const contentSettingsSchema = new mongoose.Schema({
  childDeviceId: { type: String, required: true, unique: true },

  allowSearch: { type: Boolean, default: true },
  allowAutoplay: { type: Boolean, default: true },
  blockedCategories: [String],
  blockUnsafeVideos: { type: Boolean, default: false },
  screenTimeLimitMins: { type: Number, default: 60 },
  isLocked: { type: Boolean, default: false },
  ageGroup: {
    type: String,
    enum: ["kid", "tween", "teen", "general"], // kid: <7, tween: 8–12, teen: 13–17
    default: "teen",
  },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ContentSettings", contentSettingsSchema);
