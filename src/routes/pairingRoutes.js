const express = require("express");
const router = express.Router();
const pairingController = require("../controllers/pairingController");

router.post("/generate-code", pairingController.generateCode);
router.post("/verify-code", pairingController.verifyCode);
router.get("/status/:deviceId", pairingController.getStatus);
router.get("/status2/:deviceId", pairingController.getStatus2);
router.delete("/unlink/:deviceId", pairingController.unlink);

// Simple health check route
router.get("/test", (req, res) => {
    res.json({ success: true, message: "SafeKid API is working 🎉" });
  });
  

module.exports = router;
