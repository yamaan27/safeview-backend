const mongoose = require("mongoose");

const pairingSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  childDeviceId: { type: String, required: true },
  // parentDeviceId: { type: String, default: null },
  parentDeviceId: {
    type: String,
    default: null,
    validate: {
      validator: function (v) {
        return v === null || v.trim() !== "";
      },
      message: "parentDeviceId cannot be an empty string",
    },
  },

  isLinked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  parentPin: { type: String, default: null },
});

module.exports = mongoose.model("Pairing", pairingSchema);
