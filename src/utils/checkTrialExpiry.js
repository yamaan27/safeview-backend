const ParentProfile = require("../models/ParentProfile");

async function checkAndNotifyTrialExpiry() {
  const now = new Date();

  const expiredProfiles = await ParentProfile.find({
    trialExpiresAt: { $lte: now },
    isTrialExpired: false,
  });

  for (const profile of expiredProfiles) {
    profile.isTrialExpired = true;
    await profile.save();

    if (global._io) {
      global._io.to(profile.parentDeviceId).emit("trialExpired", {
        message: "🔒 Trial expired. Please upgrade to continue using the app.",
        showUpgrade: true,
      });

      console.log(
        `🚨 Trial expired & socket notified for ${profile.parentDeviceId}`
      );
    }
  }
}

module.exports = checkAndNotifyTrialExpiry;
