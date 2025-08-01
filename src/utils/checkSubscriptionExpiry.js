// const ParentProfile = require("../models/ParentProfile");
// const io = require("../socket").getIO();

// const checkSubscriptionExpiry = async () => {
//   const now = new Date();

//   const expired = await ParentProfile.updateMany(
//     { isSubscribed: true, subscriptionExpiresAt: { $lte: now } },
//     { isSubscribed: false, subscriptionExpiresAt: null }
//   );

//   if (expired.modifiedCount > 0) {
//     const expiredProfiles = await ParentProfile.find({
//       isSubscribed: false,
//       subscriptionExpiresAt: null,
//     });

//     expiredProfiles.forEach((profile) => {
//       io.emit("subscriptionExpired", {
//         parentDeviceId: profile.parentDeviceId,
//       });
//     });
//   }
// };

// module.exports = checkSubscriptionExpiry;


const ParentProfile = require("../models/ParentProfile");

const checkSubscriptionExpiry = async () => {
  const now = new Date();

  const expired = await ParentProfile.updateMany(
    { isSubscribed: true, subscriptionExpiresAt: { $lte: now } },
    { isSubscribed: false, subscriptionExpiresAt: null }
  );

  if (expired.modifiedCount > 0) {
    const expiredProfiles = await ParentProfile.find({
      isSubscribed: false,
      subscriptionExpiresAt: null,
    });

    expiredProfiles.forEach((profile) => {
      if (global._io && profile.parentDeviceId) {
        global._io.to(profile.parentDeviceId).emit("subscriptionExpired", {
          parentDeviceId: profile.parentDeviceId,
        });
      }
    });
  }
};

module.exports = checkSubscriptionExpiry;
