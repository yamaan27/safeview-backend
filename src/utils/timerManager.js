// src/utils/timerManager.js
const ContentSettings = require("../models/ContentSettings");
const ScreenLimit = require("../models/ScreenLimit");

const timers = (global.timers = global.timers || {}); // ensure object

function clearDeviceTimer(childDeviceId) {
  if (timers[childDeviceId]) {
    clearTimeout(timers[childDeviceId].timeout);
    clearInterval(timers[childDeviceId].interval);
    delete timers[childDeviceId];
  }
}

async function startOrResetTimer(childDeviceId, dailyLimit) {
  clearDeviceTimer(childDeviceId);

  const remaining = dailyLimit;

  let secondsRemaining = remaining;

  const interval = setInterval(() => {
    secondsRemaining--;
    global._io
      .to(childDeviceId)
      .emit("timerUpdate", { remaining: secondsRemaining });

    if (secondsRemaining <= 0) {
      clearInterval(interval);
    }
  }, 1000);

  const timeout = setTimeout(async () => {
    clearInterval(interval);
    await ContentSettings.findOneAndUpdate(
      { childDeviceId },
      { isLocked: true, updatedAt: new Date() }
    );

    global._io.to(childDeviceId).emit("limitReached", {
      childDeviceId,
      message: "Screen time limit reached",
    });

    global._io.to(childDeviceId).emit("contentUpdated", {
      childDeviceId,
      settings: await ContentSettings.findOne({ childDeviceId }),
    });
  }, remaining * 1000);

  timers[childDeviceId] = { timeout, interval };
}

module.exports = { startOrResetTimer, clearDeviceTimer };
