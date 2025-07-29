const Pairing = require("../models/Pairing");
const ContentSettings = require("../models/ContentSettings");
const ScreenLimit = require("../models/ScreenLimit");
const { generateCode } = require("../services/codeGenerator");

// exports.generateCode = async (req, res) => {
//   const { childDeviceId } = req.body;

//   const code = generateCode();
//   const newPairing = await Pairing.create({ code, childDeviceId });

//   res.status(201).json({ code });
// };

exports.generateCode = async (req, res) => {
  const { childDeviceId } = req.body;

  // ❌ Prevent multiple pairings for same child
  await Pairing.deleteMany({ childDeviceId });

  const code = generateCode();
  const newPairing = await Pairing.create({ code, childDeviceId });

  res.status(201).json({ code });
};


// exports.verifyCode = async (req, res) => {
//   const { code, parentDeviceId } = req.body;

//   const pairing = await Pairing.findOne({ code });

//   if (!pairing) {
//     return res.status(404).json({ message: "Invalid code" });
//   }

//   if (pairing.childDeviceId === parentDeviceId) {
//     return res.status(400).json({ message: "Same device cannot pair" });
//   }

//   pairing.parentDeviceId = parentDeviceId;
//   pairing.isLinked = true;
//   await pairing.save();

//   res.json({ message: "Paired successfully" });
// };

// exports.getStatus = async (req, res) => {
//   const { deviceId } = req.params;

//   const pairing = await Pairing.findOne({
//     $or: [{ childDeviceId: deviceId }, { parentDeviceId: deviceId }],
//   });

//   if (!pairing) return res.json({ role: "unlinked" });

//   if (pairing.childDeviceId === deviceId) {
//     return res.json({
//       role: "child",
//       isVerified: pairing.isLinked === true,
//     });
//   }

//   if (pairing.parentDeviceId === deviceId) {
//     return res.json({ role: "parent" });
//   }
// };


exports.verifyCode = async (req, res) => {
  const { code, parentDeviceId } = req.body;

  // 🚫 Reject if parentDeviceId is missing or empty
  if (!parentDeviceId || parentDeviceId.trim() === "") {
    return res.status(400).json({ message: "parentDeviceId is required" });
  }

  const pairing = await Pairing.findOne({ code });

  if (!pairing) {
    return res.status(404).json({ message: "Invalid code" });
  }

  if (pairing.childDeviceId === parentDeviceId) {
    return res.status(400).json({ message: "Same device cannot pair" });
  }

  pairing.parentDeviceId = parentDeviceId;
  pairing.isLinked = true;
  await pairing.save();

  res.json({ message: "Paired successfully" });
};


exports.getStatus = async (req, res) => {
  const { deviceId } = req.params;

  const pairing = await Pairing.findOne({
    $or: [{ childDeviceId: deviceId }, { parentDeviceId: deviceId }],
  });

  if (!pairing) return res.json({ role: "unlinked" });

  // if (pairing.parentDeviceId === deviceId) {
  //   return res.json({ role: "parent" });
  // }

  if (pairing.parentDeviceId === deviceId) {
    return res.json({
      role: "parent",
      isPinSet: pairing.parentPin !== null,
    });
  }

  if (pairing.childDeviceId === deviceId && pairing.isLinked) {
    return res.json({
      role: "child",
      isVerified: true,
    });
  }

  return res.json({ role: "unlinked" }); // fallback if not linked yet
};

exports.getStatus2 = async (req, res) => {
  const { deviceId } = req.params;

  const checkInterval = 1000; // 1 second
  const timeout = 30000; // 30 seconds
  let elapsed = 0;

  const checkStatus = async () => {
    const pairing = await Pairing.findOne({
      $or: [{ childDeviceId: deviceId }, { parentDeviceId: deviceId }],
    });

    if (pairing) {
      if (pairing.childDeviceId === deviceId && pairing.isLinked) {
        return res.json({ role: "child" });
      }
      if (pairing.parentDeviceId === deviceId) {
        return res.json({ role: "parent" });
      }
    }

    // Timeout reached
    if (elapsed >= timeout) {
      return res.json({ role: "unlinked" });
    }

    elapsed += checkInterval;
    setTimeout(checkStatus, checkInterval);
  };

  checkStatus();
};


// exports.unlink = async (req, res) => {
//   const { deviceId } = req.params;

//   const pairing = await Pairing.findOne({
//     $or: [{ childDeviceId: deviceId }, { parentDeviceId: deviceId }],
//   });

//   if (!pairing) {
//     console.log("❌ No pairing found for device:", deviceId);
//     return res.status(404).json({ message: "No pairing found" });
//   }

//   const childId = pairing.childDeviceId;
//   const parentId = pairing.parentDeviceId;

//   // await Pairing.deleteOne({ _id: pairing._id });

//   const deleted = await Pairing.findByIdAndDelete(pairing._id);
//   console.log("🗑️ Deleted pairing document:", deleted);

//   // ✅ Emit to both devices via socket
//   if (global._io) {
//     console.log("📡 Emitting 'unlinked' to:");
//     if (childId) {
//       console.log("👶 Child:", childId);
//       global._io
//         .to(childId)
//         .emit("unlinked", { deviceId: childId, role: "child" });
//     }
//     if (parentId) {
//       console.log("👨‍👩‍👧 Parent:", parentId);
//       global._io
//         .to(parentId)
//         .emit("unlinked", { deviceId: parentId, role: "parent" });
//     }
//   } else {
//     console.log("⚠️ global._io not initialized");
//   }

//   console.log("✅ Unlink complete for device:", deviceId);
//   res.json({ message: "Unlinked successfully" });
// };

// exports.getDeviceInfo = async (req, res) => {
//   const { deviceId } = req.params;

//   const pairing = await Pairing.findOne({
//     $or: [{ childDeviceId: deviceId }, { parentDeviceId: deviceId }],
//   });

//   if (!pairing) {
//     return res.json({ deviceId, role: "unlinked" });
//   }

//   if (pairing.childDeviceId === deviceId) {
//     return res.json({
//       deviceId,
//       role: "child",
//       pairedWith: pairing.parentDeviceId || null,
//     });
//   }

//   if (pairing.parentDeviceId === deviceId) {
//     return res.json({
//       deviceId,
//       role: "parent",
//       pairedWith: pairing.childDeviceId,
//     });
//   }
// };

// SET or UPDATE parent PIN




exports.unlink = async (req, res) => {
  const { deviceId } = req.params;

  const pairing = await Pairing.findOne({
    $or: [{ childDeviceId: deviceId }, { parentDeviceId: deviceId }],
  });

  if (!pairing) {
    console.log("❌ No pairing found for device:", deviceId);
    return res.status(404).json({ message: "No pairing found" });
  }

  const childId = pairing.childDeviceId;
  const parentId = pairing.parentDeviceId;

  const deleted = await Pairing.findByIdAndDelete(pairing._id);
  console.log("🗑️ Deleted pairing document:", deleted);

  // 🧹 Delete associated content settings
  const contentDeleted = await ContentSettings.deleteOne({
    childDeviceId: childId,
  });
  const screenLimitDeleted = await ScreenLimit.deleteOne({
    childDeviceId: childId,
  });
  console.log("🗑️ Deleted ContentSettings:", contentDeleted.deletedCount);
  console.log("🗑️ Deleted ScreenLimit:", screenLimitDeleted.deletedCount);

  // 🧹 Clear screen time timers
  if (global.timers?.[childId]) {
    clearTimeout(global.timers[childId].timeout);
    clearInterval(global.timers[childId].interval);
    delete global.timers[childId];
    console.log(`🧹 Cleared timers for: ${childId}`);
  }

  // ✅ Emit to both devices via socket
  if (global._io) {
    console.log("📡 Emitting 'unlinked' to:");
    if (childId) {
      console.log("👶 Child:", childId);
      global._io
        .to(childId)
        .emit("unlinked", { deviceId: childId, role: "child" });
    }
    if (parentId) {
      console.log("👨‍👩‍👧 Parent:", parentId);
      global._io
        .to(parentId)
        .emit("unlinked", { deviceId: parentId, role: "parent" });
    }
  } else {
    console.log("⚠️ global._io not initialized");
  }

  console.log("✅ Unlink complete for device:", deviceId);
  res.json({ message: "Unlinked successfully" });
};

exports.getDeviceInfo = async (req, res) => {
  const { deviceId } = req.params;

  const pairing = await Pairing.findOne({
    $or: [{ childDeviceId: deviceId }, { parentDeviceId: deviceId }],
  });

  if (!pairing || !pairing.isLinked) {
    // If not found or not yet linked, return unlinked status
    return res.json({ deviceId, role: "unlinked" });
  }

  if (pairing.childDeviceId === deviceId) {
    return res.json({
      deviceId,
      role: "child",
      pairedWith: pairing.parentDeviceId || null,
    });
  }

  if (pairing.parentDeviceId === deviceId) {
    return res.json({
      deviceId,
      role: "parent",
      pairedWith: pairing.childDeviceId,
    });
  }

  // Fallback (shouldn't happen)
  return res.json({ deviceId, role: "unlinked" });
};

exports.setParentPin = async (req, res) => {
  const { parentDeviceId, pin } = req.body;

  const pairing = await Pairing.findOne({ parentDeviceId });

  if (!pairing) {
    return res
      .status(404)
      .json({ message: "Pairing not found for this parent" });
  }

  pairing.parentPin = pin; // Optionally hash for extra security
  await pairing.save();

  res.json({ message: "Parent PIN set successfully" });
};

// VERIFY parent PIN
exports.verifyParentPin = async (req, res) => {
  const { parentDeviceId, pin } = req.body;

  const pairing = await Pairing.findOne({ parentDeviceId });

  if (!pairing || pairing.parentPin !== pin) {
    return res.status(401).json({ message: "Invalid PIN" });
  }

  res.json({ message: "PIN verified" });
};
