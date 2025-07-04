// const mongoose = require("mongoose");

// const pairingSchema = new mongoose.Schema({
//   code: { type: String, required: true, unique: true },
//   childDeviceId: { type: String, required: true },
//   parentDeviceId: { type: String, default: null },
//   isLinked: { type: Boolean, default: false },
//   createdAt: { type: Date, default: Date.now, expires: 60 }, // auto-delete in 10 mins
// });

// module.exports = mongoose.model("Pairing", pairingSchema);


const mongoose = require("mongoose");

const pairingSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  childDeviceId: { type: String, required: true },
  parentDeviceId: { type: String, default: null },
  isLinked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// ❌ Removed TTL index — pairings will not auto-delete now
// ✅ They will persist until manually unlinked via API

module.exports = mongoose.model("Pairing", pairingSchema);
