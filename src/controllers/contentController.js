// exports.updateSettings = async (req, res) => {
//   const {
//     childDeviceId,
//     allowSearch,
//     allowAutoplay,
//     blockedCategories,
//     blockUnsafeVideos,
//     screenTimeLimitMins,
//     isLocked,
//   } = req.body;

//   // Save content settings
//   const updated = await ContentSettings.findOneAndUpdate(
//     { childDeviceId },
//     {
//       allowSearch,
//       allowAutoplay,
//       blockedCategories,
//       blockUnsafeVideos,
//       screenTimeLimitMins,
//       isLocked,
//       updatedAt: new Date(),
//     },
//     { upsert: true, new: true }
//   );

//   const dailyLimit = screenTimeLimitMins * 60; // in seconds

//   // Save screen time limit
//   await ScreenLimit.findOneAndUpdate(
//     { childDeviceId },
//     {
//       dailyLimit,
//       totalWatchedToday: 0,
//       lastReset: new Date(),
//     },
//     { upsert: true }
//   );

//   // Clear old timers
//   if (global.timers?.[childDeviceId]?.timeout) {
//     clearTimeout(global.timers[childDeviceId].timeout);
//     clearInterval(global.timers[childDeviceId].interval);
//   } else {
//     global.timers = {};
//   }

//   let secondsRemaining = dailyLimit;

//   // Countdown logger
//   const interval = setInterval(() => {
//     secondsRemaining--;
//     // console.log(
//     //   `⏳ [${childDeviceId}] Time left: ${Math.floor(secondsRemaining / 60)}m ${
//     //     secondsRemaining % 60
//     //   }s`
//     // );
//   }, 1000);

//   // Timer for limit
//   const timeout = setTimeout(async () => {
//     clearInterval(interval); // stop countdown
//     console.log(`⏰ Time limit reached for ${childDeviceId}`);
//     console.log(`📤 Emitting limitReached to room: ${childDeviceId}`);

//     // ✅ Update isLocked to true in DB
//     await ContentSettings.findOneAndUpdate(
//       { childDeviceId },
//       { isLocked: true, updatedAt: new Date() }
//     );

//     // Emit real-time event to frontend
//     if (global._io) {
//       global._io.to(childDeviceId).emit("limitReached", {
//         message: "Screen time limit reached",
//         childDeviceId,
//       });
//     }
//   }, dailyLimit * 1000);

//   // Save both timers
//   global.timers[childDeviceId] = { timeout, interval };

//   res.json({ message: "Settings saved & timer started", settings: updated });

//   // // Emit real-time update
//   // if (global._io) {
//   //   global._io.to(childDeviceId).emit("contentUpdated", {
//   //     childDeviceId,
//   //     settings: updated,
//   //   });
//   //   console.log(`📤 Emitting contentUpdated to room: ${childDeviceId}`);
//   // }
// };
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

const ScreenLimit = require("../models/ScreenLimit");
const { searchAndEmitVideos } = require("./youtubeController");

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

  // Save content settings
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

  const dailyLimit = screenTimeLimitMins * 60; // in seconds

  // Save screen time limit
  await ScreenLimit.findOneAndUpdate(
    { childDeviceId },
    {
      dailyLimit,
      totalWatchedToday: 0,
      lastReset: new Date(),
    },
    { upsert: true }
  );

  // Clear old timers
  if (global.timers?.[childDeviceId]?.timeout) {
    clearTimeout(global.timers[childDeviceId].timeout);
    clearInterval(global.timers[childDeviceId].interval);
  } else {
    global.timers = {};
  }

  let secondsRemaining = dailyLimit;

  // Countdown logger
  const interval = setInterval(() => {
    secondsRemaining--;
    // console.log(
    //   `⏳ [${childDeviceId}] Time left: ${Math.floor(secondsRemaining / 60)}m ${
    //     secondsRemaining % 60
    //   }s`
    // );
  }, 1000);

  // Timer for limit
  const timeout = setTimeout(async () => {
    clearInterval(interval); // stop countdown
    console.log(`⏰ Time limit reached for ${childDeviceId}`);
    console.log(`📤 Emitting limitReached to room: ${childDeviceId}`);

    // ✅ Update isLocked to true in DB
    await ContentSettings.findOneAndUpdate(
      { childDeviceId },
      { isLocked: true, updatedAt: new Date() }
    );

    // Emit real-time event to frontend
    if (global._io) {
      global._io.to(childDeviceId).emit("limitReached", {
        message: "Screen time limit reached",
        childDeviceId,
      });
    }
  }, dailyLimit * 1000);

  // Save both timers
  global.timers[childDeviceId] = { timeout, interval };

  res.json({ message: "Settings saved & timer started", settings: updated });

  // Emit real-time update
  if (global._io) {
    global._io.to(childDeviceId).emit("contentUpdated", {
      childDeviceId,
      settings: updated,
    });
    console.log(`📤 Emitting contentUpdated to room: ${childDeviceId}`);
  }

  // Emit updated videos via socket 🎯
  await searchAndEmitVideos(childDeviceId);
};

exports.getSettings = async (req, res) => {
  const { childDeviceId } = req.params;
  const settings = await ContentSettings.findOne({ childDeviceId });

  res.json(settings || {});
};
