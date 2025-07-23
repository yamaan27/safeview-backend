const UpgradeInterest = require("../models/UpgradeInterest");

// POST: Submit interest
exports.submitInterest = async (req, res) => {
  try {
    const { parentDeviceId, name, phone, email, kidName, message } = req.body;

    if (!parentDeviceId || !name || !phone || !email || !kidName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await UpgradeInterest.findOne({ parentDeviceId });
    if (existing) {
      return res.status(409).json({ message: "Already expressed interest" });
    }

    const interest = await UpgradeInterest.create({
      parentDeviceId,
      name,
      phone,
      email,
      kidName,
      message,
    });

    res.status(201).json({ message: "Interest recorded", interest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET: Get all interested users
exports.getAllInterests = async (req, res) => {
  try {
    const interests = await UpgradeInterest.find().sort({ createdAt: -1 });
    res.json(interests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
