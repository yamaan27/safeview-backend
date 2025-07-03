const Pairing = require("../models/Pairing");
const { generateCode } = require("../services/codeGenerator");

exports.generateCode = async (req, res) => {
  const { childDeviceId } = req.body;

  const code = generateCode();
  const newPairing = await Pairing.create({ code, childDeviceId });

  res.status(201).json({ code });
};

exports.verifyCode = async (req, res) => {
  const { code, parentDeviceId } = req.body;

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

  if (pairing.childDeviceId === deviceId) return res.json({ role: "child" });
  if (pairing.parentDeviceId === deviceId) return res.json({ role: "parent" });
};

exports.unlink = async (req, res) => {
  const { deviceId } = req.params;

  await Pairing.deleteOne({
    $or: [{ childDeviceId: deviceId }, { parentDeviceId: deviceId }],
  });

  res.json({ message: "Unlinked successfully" });
};
