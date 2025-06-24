const mongoose = require("mongoose");

const locationLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  timestamp: Date,
  lat: Number,
  lng: Number,
});

module.exports = mongoose.model("LocationLog", locationLogSchema);
