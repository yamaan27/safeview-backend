const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activityController");

router.post("/log", activityController.logVideo);
router.get("/history/:childDeviceId", activityController.getHistory);

module.exports = router;
