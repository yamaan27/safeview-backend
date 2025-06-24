const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String }, // <-- ✅ Add this line
    password: { type: String },
    role: {
      type: String,
      enum: ["admin", "agent", "manager", "viewer"],
      default: "agent",
    },

    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    activeTaskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
