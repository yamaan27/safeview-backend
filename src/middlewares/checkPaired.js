
// const Pairing = require("../models/Pairing");

// module.exports = async (req, res, next) => {
//   const childDeviceId =
//     req.body?.childDeviceId ||
//     req.params?.childDeviceId ||
//     req.query?.childDeviceId;

//   if (!childDeviceId) {
//     return res.status(400).json({ message: "Missing childDeviceId" });
//   }

//   const pairing = await Pairing.findOne({ childDeviceId });

//   if (!pairing) {
//     return res.status(403).json({ message: "Device not paired" });
//   }

//   next();
// };


const Pairing = require("../models/Pairing");

module.exports = async (req, res, next) => {
  const childDeviceId =
    req.body?.childDeviceId ||
    req.params?.childDeviceId ||
    req.query?.childDeviceId;

  if (!childDeviceId) {
    return res.status(400).json({ message: "Missing childDeviceId" });
  }

  const pairing = await Pairing.findOne({ childDeviceId });

  if (!pairing || !pairing.isLinked) {
    return res
      .status(403)
      .json({ message: "Device not paired or not verified" });
  }

  next();
};
