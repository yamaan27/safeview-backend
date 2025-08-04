const ParentProfile = require("../models/ParentProfile");
const Pairing = require("../models/Pairing"); // Add this line
const io = global._io;



exports.updateSubscription = async (req, res) => {
  try {
    const { parentDeviceId } = req.params;
    const { isSubscribed, days } = req.body;

    if (isSubscribed === true && (days === undefined || isNaN(days))) {
      return res.status(400).json({
        message: "Days is required when subscribing",
      });
    }

    const now = new Date();
    const expiresAt = isSubscribed
      ? new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
      : null;

    const updates = {
      isSubscribed,
      subscriptionExpiresAt: expiresAt,
      subscriptionStarted: isSubscribed ? true : false,
      subscriptionOver: isSubscribed ? false : true,
    };


    // If subscribing, push into history
   const updateOps = isSubscribed
     ? {
         $set: updates,
         $push: {
           subscriptionHistory: {
             subscribedAt: now,
             expiresAt: expiresAt,
             durationDays: days,
           },
         },
       }
     : {
         $set: updates,
       };


    const updated = await ParentProfile.findOneAndUpdate(
      { parentDeviceId },
      updateOps,
      { new: true }
    );


    if (!updated) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // 🔔 Emit socket event to this parent
    if (global._io) {
      const event = isSubscribed ? "subscriptionStatus" : "subscriptionExpired";
      global._io.to(parentDeviceId).emit(event, {
        parentDeviceId,
        isSubscribed,
        subscriptionExpiresAt: updates.subscriptionExpiresAt,
      });
    }

    res.json({ message: "Subscription status updated", profile: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// exports.getProfile = async (req, res) => {
//   try {
//     const { parentDeviceId } = req.params;

//     // Get parent profile
//     const profile = await ParentProfile.findOne({ parentDeviceId });
//     if (!profile) {
//       return res.status(404).json({ message: "Profile not found" });
//     }

//     // Find pairing to get the linked childDeviceId
//     const pairing = await Pairing.findOne({ parentDeviceId, isLinked: true });

//     // Attach childDeviceId if exists
//     const profileWithChild = {
//       ...profile.toObject(),
//       childDeviceId: pairing ? pairing.childDeviceId : null,
//     };

//     res.json(profileWithChild);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


exports.getProfile = async (req, res) => {
  try {
    const { parentDeviceId } = req.params;

    let profile = await ParentProfile.findOne({ parentDeviceId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // 🕓 Auto-expire subscription if past expiry
    if (
      profile.isSubscribed &&
      profile.subscriptionExpiresAt &&
      new Date(profile.subscriptionExpiresAt) < new Date()
    ) {
      profile.isSubscribed = false;
      profile.subscriptionOver = true;
      await profile.save();

      global._io?.to(parentDeviceId).emit("subscriptionExpired", {
        parentDeviceId,
      });
    }


    // 🔍 Get childDeviceId from pairing
    const pairing = await Pairing.findOne({ parentDeviceId, isLinked: true });

    const profileWithChild = {
      ...profile.toObject(),
      childDeviceId: pairing ? pairing.childDeviceId : null,
    };

    res.json(profileWithChild);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.createProfile = async (req, res) => {
  try {
    const { parentDeviceId, name, phone, email, kidName } = req.body;

    // Prevent duplicate
    const exists = await ParentProfile.findOne({ parentDeviceId });
    if (exists) {
      return res.status(400).json({ message: "Profile already exists" });
    }

    const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;
    // For testing purpose setting it to 1 Minute
    // const THREE_DAYS = 10 * 1000; // 1 minute in milliseconds;

    const profile = await ParentProfile.create({
      parentDeviceId,
      name,
      phone,
      email,
      kidName,
      trialStartedAt: new Date(),
      trialExpiresAt: new Date(Date.now() + THREE_DAYS),
    });

    res.status(201).json({ message: "Profile created", profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// exports.getProfile = async (req, res) => {
//   try {
//     const { parentDeviceId } = req.params;
//     const profile = await ParentProfile.findOne({ parentDeviceId });

//     if (!profile) {
//       return res.status(404).json({ message: "Profile not found" });
//     }

//     res.json(profile);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.getProfile = async (req, res) => {
//   try {
//     const { parentDeviceId } = req.params;

//     const profile = await ParentProfile.findOne({ parentDeviceId });

//     if (!profile) {
//       return res.status(404).json({ message: "Profile not found" });
//     }

//     // 🔍 Look for a linked child device
//     const pairing = await Pairing.findOne({
//       parentDeviceId,
//       isLinked: true,
//     });

//     const response = {
//       ...profile.toObject(),
//       childDeviceId: pairing?.childDeviceId || null,
//     };

//     res.json(response);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

exports.updateProfile = async (req, res) => {
  try {
    const { parentDeviceId } = req.params;
    const updates = req.body;

    const updated = await ParentProfile.findOneAndUpdate(
      { parentDeviceId },
      updates,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({ message: "Profile updated", profile: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
