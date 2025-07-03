const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
  childDeviceId: { type: String, required: true },
  videoId: String,
  title: String,
  channelName: String,
  thumbnail: String,
  watchedAt: { type: Date, default: Date.now },
  duration: Number, // seconds
});

module.exports = mongoose.model("ActivityLog", activityLogSchema);
