const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      unique: true,
    },

    title: { type: String, required: true },
    description: { type: String },

    location: {
      lat: { type: Number },
      lng: { type: Number },
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "cancelled"],
      default: "pending",
    },

    startTime: { type: Date },
    endTime: { type: Date },
    dueDate: Date,

    proof: {
      imageUrl: { type: String },
      notes: { type: String },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("Task", taskSchema);
