const ContentSettings = require("../models/ContentSettings");

exports.updateSettings = async (req, res) => {
  const { childDeviceId, allowSearch, allowAutoplay, blockedChannels } =
    req.body;

  const updated = await ContentSettings.findOneAndUpdate(
    { childDeviceId },
    { allowSearch, allowAutoplay, blockedChannels, updatedAt: new Date() },
    { upsert: true, new: true }
  );

  res.json({ message: "Settings saved", settings: updated });
};

exports.getSettings = async (req, res) => {
  const { childDeviceId } = req.params;
  const settings = await ContentSettings.findOne({ childDeviceId });

  res.json(settings || {});
};
