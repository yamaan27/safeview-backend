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

// exports.trackWatchTime = async (req, res) => {
//   const { childDeviceId, duration } = req.body;

//   const io = req.app.get("io"); // ✅ Get socket.io instance

//   const record =
//     (await ScreenLimit.findOne({ childDeviceId })) ||
//     new ScreenLimit({ childDeviceId });

//   const today = new Date().toDateString();
//   const lastResetDay = new Date(record.lastReset).toDateString();

//   if (today !== lastResetDay) {
//     record.totalWatchedToday = 0;
//     record.lastReset = new Date();
//   }

//   record.totalWatchedToday += duration;
//   await record.save();

//   const remaining = record.dailyLimit - record.totalWatchedToday;

//   const limitReached = remaining <= 0;

//   // ✅ Emit real-time event when limit reached
//   if (limitReached) {
//     io.to(childDeviceId).emit("limitReached", {
//       message: "Screen time limit reached",
//       childDeviceId,
//     });
//   }

//   res.json({
//     message: "Watch time updated",
//     totalWatchedToday: record.totalWatchedToday,
//     remainingTime: remaining > 0 ? remaining : 0,
//     limitReached,
//   });
// };

exports.trackWatchTime = async (req, res) => {
  const { childDeviceId, duration } = req.body; // duration is in minutes

  const io = req.app.get("io");

  const record =
    (await ScreenLimit.findOne({ childDeviceId })) ||
    new ScreenLimit({ childDeviceId });

  const today = new Date().toDateString();
  const lastResetDay = new Date(record.lastReset).toDateString();

  if (today !== lastResetDay) {
    record.totalWatchedToday = 0;
    record.lastReset = new Date();
  }

  const durationInSeconds = duration * 60; // convert minutes to seconds

  record.totalWatchedToday += durationInSeconds;
  await record.save();

  const remaining = record.dailyLimit - record.totalWatchedToday;
  const limitReached = remaining <= 0;

  if (limitReached) {
    io.to(childDeviceId).emit("limitReached", {
      message: "Screen time limit reached",
      childDeviceId,
    });
  }

  res.json({
    message: "Watch time updated",
    totalWatchedMins: Math.round(record.totalWatchedToday / 60),
    remainingTimeMins: Math.max(0, Math.round(remaining / 60)),
    limitReached,
  });
};

exports.getLimitStatus = async (req, res) => {
  const { childDeviceId } = req.params;
  const record = await ScreenLimit.findOne({ childDeviceId });

  if (!record)
    return res.json({ message: "No limit set", remainingTime: null });

  const remaining = record.dailyLimit - record.totalWatchedToday;

  res.json({
    dailyLimitMins: Math.round(record.dailyLimit / 60),
    totalWatchedMins: Math.round(record.totalWatchedToday / 60),
    remainingTimeMins: Math.max(0, Math.round(remaining / 60)),
    limitReached: remaining <= 0,
  });
};
