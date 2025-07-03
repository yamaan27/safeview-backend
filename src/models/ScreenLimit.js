const mongoose = require("mongoose");

const screenLimitSchema = new mongoose.Schema({
  childDeviceId: { type: String, required: true, unique: true },
  dailyLimit: { type: Number, default: 1800 }, // in seconds (default 30 min)
  lastReset: { type: Date, default: Date.now },
  totalWatchedToday: { type: Number, default: 0 },
});

module.exports = mongoose.model("ScreenLimit", screenLimitSchema);
