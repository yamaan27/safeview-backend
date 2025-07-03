const ScreenLimit = require("../models/ScreenLimit");

exports.updateLimit = async (req, res) => {
  const { childDeviceId, dailyLimit } = req.body;

  const updated = await ScreenLimit.findOneAndUpdate(
    { childDeviceId },
    { dailyLimit },
    { upsert: true, new: true }
  );

  res.json({ message: "Limit updated", data: updated });
};

exports.trackWatchTime = async (req, res) => {
  const { childDeviceId, duration } = req.body;

  const record =
    (await ScreenLimit.findOne({ childDeviceId })) ||
    new ScreenLimit({ childDeviceId });

  const today = new Date().toDateString();
  const lastResetDay = new Date(record.lastReset).toDateString();

  if (today !== lastResetDay) {
    record.totalWatchedToday = 0;
    record.lastReset = new Date();
  }

  record.totalWatchedToday += duration;
  await record.save();

  const remaining = record.dailyLimit - record.totalWatchedToday;

  res.json({
    message: "Watch time updated",
    totalWatchedToday: record.totalWatchedToday,
    remainingTime: remaining > 0 ? remaining : 0,
    limitReached: remaining <= 0,
  });
};

exports.getLimitStatus = async (req, res) => {
  const { childDeviceId } = req.params;
  const record = await ScreenLimit.findOne({ childDeviceId });

  if (!record)
    return res.json({ message: "No limit set", remainingTime: null });

  const remaining = record.dailyLimit - record.totalWatchedToday;

  res.json({
    dailyLimit: record.dailyLimit,
    totalWatchedToday: record.totalWatchedToday,
    remainingTime: remaining > 0 ? remaining : 0,
    limitReached: remaining <= 0,
  });
};
