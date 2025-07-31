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

    if (!global.timers) {
      global.timers = {};
    }

  try {
    // ✅ Update content settings
    // const updated = await ContentSettings.findOneAndUpdate(
    //   { childDeviceId },
    //   {
    //     allowSearch,
    //     allowAutoplay,
    //     blockedCategories,
    //     blockUnsafeVideos,
    //     isLocked,
    //     screenTimeLimitMins,
    //     updatedAt: new Date(),
    //   },
    //   { upsert: true, new: true }
    // );
    // Build update payload dynamically
    const updatePayload = {
      allowSearch,
      allowAutoplay,
      blockedCategories,
      blockUnsafeVideos,
      isLocked,
      screenTimeLimitMins,
      updatedAt: new Date(),
    };

    // ✅ Auto-set ageGroup if blockUnsafeVideos is true
    if (blockUnsafeVideos === true) {
      updatePayload.ageGroup = "tween";
    }

    const updated = await ContentSettings.findOneAndUpdate(
      { childDeviceId },
      updatePayload,
      { upsert: true, new: true }
    );

    const dailyLimit = (screenTimeLimitMins || 30) * 60; // seconds

    // ✅ Update or create screen limit doc
    let screenLimit = await ScreenLimit.findOne({ childDeviceId });
    const now = new Date();

    if (!screenLimit) {
      screenLimit = await ScreenLimit.create({
        childDeviceId,
        dailyLimit,
        totalWatchedToday: 0,
        lastReset: now,
      });
    } else {
      const limitChanged = screenLimit.dailyLimit !== dailyLimit;
      if (limitChanged) {
        screenLimit.dailyLimit = dailyLimit;
        screenLimit.totalWatchedToday = 0;
        screenLimit.lastReset = now;
        await screenLimit.save();
      }
    }

    const remaining = screenLimit.dailyLimit - screenLimit.totalWatchedToday;
    const previousTimer = global.timers?.[childDeviceId];
    const previousIsLocked = previousTimer?.isLocked ?? false;
    const wasPreviouslyLocked = previousIsLocked === true;
    const isNowUnlocked = isLocked === false;
    // Always stop existing timer if locking the device
    if (isLocked === true && global.timers?.[childDeviceId]) {
      clearTimeout(global.timers[childDeviceId].timeout);
      clearInterval(global.timers[childDeviceId].interval);

      console.log(`🛑 [${childDeviceId}] Timer stopped due to lock`);

      global.timers[childDeviceId] = {
        timeout: null,
        interval: null,
        limit: dailyLimit,
        isLocked: true,
      };
    }

    const shouldRestartTimer =
      !previousTimer ||
      previousTimer.limit !== dailyLimit ||
      (wasPreviouslyLocked && isNowUnlocked);

    if (shouldRestartTimer) {
      // ⛔ Stop existing timer if any
      if (previousTimer) {
        clearTimeout(previousTimer.timeout);
        clearInterval(previousTimer.interval);
      }

      if (isLocked === true) {
        console.log(
          `🔒 [${childDeviceId}] Locked manually. Timer not started.`
        );

        global.timers[childDeviceId] = {
          timeout: null,
          interval: null,
          limit: dailyLimit,
          isLocked: true,
        };
      } else if (remaining > 0) {
        let secondsRemaining = remaining;

        const interval = setInterval(() => {
          secondsRemaining--;

          global._io?.to(childDeviceId).emit("screenTime", {
            childDeviceId,
            remaining: secondsRemaining,
          });
        }, 1000);

        const timeout = setTimeout(async () => {
          clearInterval(interval);
          console.log(`⏰ Time limit reached for ${childDeviceId}`);

          const updatedLocked = await ContentSettings.findOneAndUpdate(
            { childDeviceId },
            { isLocked: true, updatedAt: new Date() },
            { new: true }
          );

          global._io.to(childDeviceId).emit("limitReached", {
            message: "Screen time limit reached",
            childDeviceId,
          });

          global._io.to(childDeviceId).emit("contentUpdated", {
            childDeviceId,
            settings: updatedLocked,
          });

          console.log(
            `📤 Emitted limitReached + contentUpdated for ${childDeviceId}`
          );
        }, secondsRemaining * 1000);

        global.timers[childDeviceId] = {
          timeout,
          interval,
          limit: dailyLimit,
          isLocked,
        };

        console.log(
          `✅ [${childDeviceId}] Timer started: ${secondsRemaining}s`
        );
      }
    }

    // Emit content update
    global._io.to(childDeviceId).emit("contentUpdated", {
      childDeviceId,
      settings: updated,
    });

    console.log(`📤 Emitting contentUpdated to room: ${childDeviceId}`);

    // Emit updated videos (if unlocked)
    if (!isLocked) {
      await searchAndEmitVideos(childDeviceId);
    }

    res.json({ message: "Settings updated", settings: updated });
  } catch (err) {
    console.error("❌ Error in updateSettings:", err);
    res.status(500).json({ error: "Server error" });
  }
};

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

//   if (!global.timers) {
//     global.timers = {};
//   }

//   try {
//     // ✅ Update content settings
//     const updated = await ContentSettings.findOneAndUpdate(
//       { childDeviceId },
//       {
//         allowSearch,
//         allowAutoplay,
//         blockedCategories,
//         blockUnsafeVideos,
//         isLocked,
//         screenTimeLimitMins,
//         updatedAt: new Date(),
//       },
//       { upsert: true, new: true }
//     );

//     const dailyLimit = (screenTimeLimitMins || 30) * 60; // in seconds

//     // ✅ Update or create screen limit doc
//     let screenLimit = await ScreenLimit.findOne({ childDeviceId });
//     const now = new Date();

//     let limitChanged = false;

//     if (!screenLimit) {
//       screenLimit = await ScreenLimit.create({
//         childDeviceId,
//         dailyLimit,
//         totalWatchedToday: 0,
//         lastReset: now,
//       });
//       limitChanged = true;
//     } else if (screenLimit.dailyLimit !== dailyLimit) {
//       screenLimit.dailyLimit = dailyLimit;
//       screenLimit.totalWatchedToday = 0;
//       screenLimit.lastReset = now;
//       await screenLimit.save();
//       limitChanged = true;
//     }

//     const remaining = screenLimit.dailyLimit - screenLimit.totalWatchedToday;
//     const existingTimer = global.timers[childDeviceId];
//     const previousIsLocked = existingTimer?.isLocked || false;
//     const shouldRestartTimer =
//       limitChanged || isLocked !== previousIsLocked || !existingTimer;

//     // 🛑 Clear previous timer if needed
//     if (shouldRestartTimer && existingTimer) {
//       clearTimeout(existingTimer.timeout);
//       clearInterval(existingTimer.interval);
//     }

//     if (shouldRestartTimer) {
//       if (isLocked === true) {
//         console.log(
//           `🔒 [${childDeviceId}] Locked manually. Timer not started.`
//         );
//       } else if (remaining > 0) {
//         let secondsRemaining = remaining;

//         const interval = setInterval(() => {
//           secondsRemaining--;

//           // Emit remaining time to frontend
//           global._io?.to(childDeviceId).emit("screenTime", {
//             childDeviceId,
//             remaining: secondsRemaining,
//           });
//         }, 1000);

//         const timeout = setTimeout(async () => {
//           clearInterval(interval);
//           console.log(`⏰ Time limit reached for ${childDeviceId}`);

//           // Auto-lock in DB
//           const updatedLocked = await ContentSettings.findOneAndUpdate(
//             { childDeviceId },
//             { isLocked: true, updatedAt: new Date() },
//             { new: true }
//           );

//           // Emit both lock event and updated settings
//           global._io.to(childDeviceId).emit("limitReached", {
//             message: "Screen time limit reached",
//             childDeviceId,
//           });

//           global._io.to(childDeviceId).emit("contentUpdated", {
//             childDeviceId,
//             settings: updatedLocked,
//           });

//           console.log(
//             `📤 Emitted limitReached + contentUpdated for ${childDeviceId}`
//           );
//         }, secondsRemaining * 1000);

//         global.timers[childDeviceId] = {
//           timeout,
//           interval,
//           isLocked,
//         };

//         console.log(
//           `✅ [${childDeviceId}] Timer started: ${secondsRemaining}s`
//         );
//       }
//     }

//     // Emit content update
//     global._io.to(childDeviceId).emit("contentUpdated", {
//       childDeviceId,
//       settings: updated,
//     });

//     console.log(`📤 Emitting contentUpdated to room: ${childDeviceId}`);

//     // Emit updated videos (if unlocked)
//     if (!isLocked) {
//       await searchAndEmitVideos(childDeviceId);
//     }

//     res.json({ message: "Settings updated", settings: updated });
//   } catch (err) {
//     console.error("❌ Error in updateSettings:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

exports.getSettings = async (req, res) => {
  const { childDeviceId } = req.params;
  const settings = await ContentSettings.findOne({ childDeviceId });

  res.json(settings || {});
};
