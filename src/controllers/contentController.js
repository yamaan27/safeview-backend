// exports.updateSettings = async (req, res) => {
//   const {
//     childDeviceId,
//     allowSearch,
//     allowAutoplay,
//     blockedCategories, // ✅ New
//     blockUnsafeVideos,
//     screenTimeLimitMins,
//     isLocked,
//   } = req.body;

//   const updated = await ContentSettings.findOneAndUpdate(
//     { childDeviceId },
//     {
//       allowSearch,
//       allowAutoplay,
//       blockedCategories, // ✅ Save to DB
//       blockUnsafeVideos,
//       screenTimeLimitMins,
//       isLocked,
//       updatedAt: new Date(),
//     },
//     { upsert: true, new: true }
//   );

//   res.json({ message: "Settings saved", settings: updated });
// };

const ContentSettings = require("../models/ContentSettings");
const ScreenLimit = require("../models/ScreenLimit"); // ✅ Import this

exports.updateSettings = async (req, res) => {
  const {
    childDeviceId,
    allowSearch,
    allowAutoplay,
    blockedCategories,
    blockUnsafeVideos,
    screenTimeLimitMins,
    isLocked,
  } = req.body;

  // ✅ 1. Save content settings as before
  const updated = await ContentSettings.findOneAndUpdate(
    { childDeviceId },
    {
      allowSearch,
      allowAutoplay,
      blockedCategories,
      blockUnsafeVideos,
      screenTimeLimitMins,
      isLocked,
      updatedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  // ✅ 2. Convert minutes to seconds and upsert ScreenLimit
  const dailyLimitInSeconds = screenTimeLimitMins * 60;

  await ScreenLimit.findOneAndUpdate(
    { childDeviceId },
    { dailyLimit: dailyLimitInSeconds },
    { upsert: true, new: true }
  );

  res.json({
    message: "Settings and limit synced",
    settings: updated,
    screenLimitSecs: dailyLimitInSeconds,
  });
};

exports.getSettings = async (req, res) => {
  const { childDeviceId } = req.params;
  const settings = await ContentSettings.findOne({ childDeviceId });

  res.json(settings || {});
};
