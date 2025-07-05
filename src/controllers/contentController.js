const ContentSettings = require("../models/ContentSettings");

// exports.updateSettings = async (req, res) => {
//   const {
//     childDeviceId,
//     allowSearch,
//     allowAutoplay,
//     blockedChannels,
//     blockedVideos,
//     screenTimeLimitMins,
//     isLocked,
//   } = req.body;

//   const updated = await ContentSettings.findOneAndUpdate(
//     { childDeviceId },
//     {
//       allowSearch,
//       allowAutoplay,
//       blockedChannels,
//       blockedVideos,
//       screenTimeLimitMins,
//       isLocked,
//       updatedAt: new Date(),
//     },
//     { upsert: true, new: true }
//   );

//   res.json({ message: "Settings saved", settings: updated });
// };

exports.updateSettings = async (req, res) => {
  const {
    childDeviceId,
    allowSearch,
    allowAutoplay,
    blockedChannels,
    blockUnsafeVideos,
    screenTimeLimitMins,
    isLocked,
  } = req.body;

  const updated = await ContentSettings.findOneAndUpdate(
    { childDeviceId },
    {
      allowSearch,
      allowAutoplay,
      blockedChannels,
      blockUnsafeVideos,
      screenTimeLimitMins,
      isLocked,
      updatedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  res.json({ message: "Settings saved", settings: updated });
};


exports.getSettings = async (req, res) => {
  const { childDeviceId } = req.params;
  const settings = await ContentSettings.findOne({ childDeviceId });

  res.json(settings || {});
};

