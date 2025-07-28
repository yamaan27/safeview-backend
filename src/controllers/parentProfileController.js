const ParentProfile = require("../models/ParentProfile");

exports.createProfile = async (req, res) => {
  try {
    const { parentDeviceId, name, phone, email, kidName } = req.body;

    // Prevent duplicate
    const exists = await ParentProfile.findOne({ parentDeviceId });
    if (exists) {
      return res.status(400).json({ message: "Profile already exists" });
    }

    // const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;
    // For testing purpose setting it to 1 Minute
    const THREE_DAYS = 10 * 1000; // 1 minute in milliseconds;

    const profile = await ParentProfile.create({
      parentDeviceId,
      name,
      phone,
      email,
      kidName,
      trialStartedAt: new Date(),
      trialExpiresAt: new Date(Date.now() + THREE_DAYS),
    });

    res.status(201).json({ message: "Profile created", profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { parentDeviceId } = req.params;
    const profile = await ParentProfile.findOne({ parentDeviceId });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { parentDeviceId } = req.params;
    const updates = req.body;

    const updated = await ParentProfile.findOneAndUpdate(
      { parentDeviceId },
      updates,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({ message: "Profile updated", profile: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
