// models/TrendingVideo.js
const mongoose = require("mongoose");

const TrendingVideoSchema = new mongoose.Schema({
  title: String,
  videoId: String,
  thumbnail: String,
  description: String,
  channel: String,
  fetchedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TrendingVideo", TrendingVideoSchema);
