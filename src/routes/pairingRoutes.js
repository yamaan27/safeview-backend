const express = require("express");
const router = express.Router();
const pairingController = require("../controllers/pairingController");
const Pairing = require("../models/Pairing");


router.post("/generate-code", pairingController.generateCode);
router.post("/verify-code", pairingController.verifyCode);
router.get("/status/:deviceId", pairingController.getStatus);
router.get("/status2/:deviceId", pairingController.getStatus2);
router.delete("/unlink/:deviceId", pairingController.unlink);
router.get("/me/:deviceId", pairingController.getDeviceInfo);

router.get("/list-indexes", async (req, res) => {
  try {
    const indexes = await Pairing.collection.indexes();
    res.json(indexes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/drop-ttl-index", async (req, res) => {
  try {
    await Pairing.collection.dropIndex("createdAt_1");
    res.json({ message: "TTL index dropped successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/debug-pairing/:deviceId", async (req, res) => {
  const { deviceId } = req.params;
  const record = await Pairing.findOne({
    $or: [{ childDeviceId: deviceId }, { parentDeviceId: deviceId }],
  });
  res.json(record);
});




// Simple health check route
router.get("/test", (req, res) => {
    res.json({ success: true, message: "SafeKid API is working 🎉" });
  });
  

module.exports = router;
