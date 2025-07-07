const mongoose = require("mongoose");


// const contentSettingsSchema = new mongoose.Schema({
//   childDeviceId: { type: String, required: true, unique: true },

//   allowSearch: { type: Boolean, default: true },
//   allowAutoplay: { type: Boolean, default: true },
//   blockedChannels: [String],

//   // ⛔ Now a toggle instead of array
//   blockUnsafeVideos: { type: Boolean, default: false },

//   screenTimeLimitMins: { type: Number, default: 60 },
//   isLocked: { type: Boolean, default: false },

//   updatedAt: { type: Date, default: Date.now },
// });

const contentSettingsSchema = new mongoose.Schema({
  childDeviceId: { type: String, required: true, unique: true },

  allowSearch: { type: Boolean, default: true },
  allowAutoplay: { type: Boolean, default: true },

  blockedCategories: [String], // ✅ NEW: Block whole categories like "Music", "Gaming"

  blockUnsafeVideos: { type: Boolean, default: false },
  screenTimeLimitMins: { type: Number, default: 60 },
  isLocked: { type: Boolean, default: false },

  updatedAt: { type: Date, default: Date.now },
});



module.exports = mongoose.model("ContentSettings", contentSettingsSchema);
