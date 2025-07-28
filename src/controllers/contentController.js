const ContentSettings = require("../models/ContentSettings");

const ScreenLimit = require("../models/ScreenLimit");
const { searchAndEmitVideos } = require("./youtubeController");

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
//     const updatedLocked = await ContentSettings.findOneAndUpdate(
//       { childDeviceId },
//       { isLocked: true, updatedAt: new Date() },
//       { new: true }
//     );

//     // Emit real-time event to frontend
//     if (global._io) {
//       global._io.to(childDeviceId).emit("limitReached", {
//         message: "Screen time limit reached",
//         childDeviceId,
//       });

//       // ✅ Also emit updated content settings to sync lock status
//       global._io.to(childDeviceId).emit("contentUpdated", {
//         childDeviceId,
//         settings: updatedLocked,
//       });

//       console.log(
//         `📤 Emitting contentUpdated after lock to room: ${childDeviceId}`
//       );
//     }
//   }, dailyLimit * 1000);

//   // Save both timers
//   global.timers[childDeviceId] = { timeout, interval };

//   res.json({ message: "Settings saved & timer started", settings: updated });

//   // Emit real-time update
//   if (global._io) {
//     global._io.to(childDeviceId).emit("contentUpdated", {
//       childDeviceId,
//       settings: updated,
//     });
//     console.log(`📤 Emitting contentUpdated to room: ${childDeviceId}`);
//   }

//   // Emit updated videos via socket 🎯
//   await searchAndEmitVideos(childDeviceId);
// };


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
    const updated = await ContentSettings.findOneAndUpdate(
      { childDeviceId },
      {
        allowSearch,
        allowAutoplay,
        blockedCategories,
        blockUnsafeVideos,
        isLocked,
        screenTimeLimitMins,
        updatedAt: new Date(),
      },
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

    // ⛔ Stop existing timer if any
    if (global.timers?.[childDeviceId]) {
      clearTimeout(global.timers[childDeviceId].timeout);
      clearInterval(global.timers[childDeviceId].interval);
    }

    // 🟡 Case 1: Lock override — don't start timer
    if (isLocked === true) {
      console.log(`🔒 [${childDeviceId}] Locked manually. Timer not started.`);
    }
    // 🟢 Case 2: Resume or start new timer if unlocked and time left
    else if (remaining > 0) {
      let secondsRemaining = remaining;

     const interval = setInterval(() => {
       secondsRemaining--;

       // Emit remaining time to frontend
       if (global._io) {
         global._io.to(childDeviceId).emit("screenTime", {
           childDeviceId,
           remaining: secondsRemaining,
         });
       }
     }, 1000);


      const timeout = setTimeout(async () => {
        clearInterval(interval);
        console.log(`⏰ Time limit reached for ${childDeviceId}`);

        // Auto-lock in DB
        const updatedLocked = await ContentSettings.findOneAndUpdate(
          { childDeviceId },
          { isLocked: true, updatedAt: new Date() },
          { new: true }
        );

        // Emit both lock event and updated settings
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

      global.timers[childDeviceId] = { timeout, interval };
      console.log(`✅ [${childDeviceId}] Timer started: ${secondsRemaining}s`);
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
exports.getSettings = async (req, res) => {
  const { childDeviceId } = req.params;
  const settings = await ContentSettings.findOne({ childDeviceId });

  res.json(settings || {});
};
