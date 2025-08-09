const ActivityLog = require("../models/ActivityLog");

exports.logVideo = async (req, res) => {
  const { childDeviceId, videoId, title, thumbnail, duration, channelName } =
    req.body;

  const log = await ActivityLog.create({
    childDeviceId,
    videoId,
    title,
    thumbnail,
    duration,
    channelName,
  });

  // Emit real-time event to parent/observer
  if (global._io) {
    global._io.to(childDeviceId).emit("activityLogged", {
      childDeviceId,
      videoId,
      title,
      thumbnail,
      duration,
      channelName,
      watchedAt: log.watchedAt,
    });
  }

  res.status(201).json({ message: "Video logged", log });
};

exports.getHistory = async (req, res) => {
  const { childDeviceId } = req.params;
  const logs = await ActivityLog.find({ childDeviceId }).sort({
    watchedAt: -1,
  });

  res.json(logs);
};

exports.clearHistory = async (req, res) => {
  const { childDeviceId } = req.params;

  const result = await ActivityLog.deleteMany({ childDeviceId });

  if (global._io) {
    global._io.to(childDeviceId).emit("activityCleared", { childDeviceId });
  }

  res.json({
    message: `Cleared ${result.deletedCount} activity logs for childDeviceId: ${childDeviceId}`,
  });
};