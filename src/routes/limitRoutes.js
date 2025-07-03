const express = require("express");
const router = express.Router();
const limitController = require("../controllers/limitController");

router.post("/set-limit", limitController.updateLimit);
router.post("/track", limitController.trackWatchTime);
router.get("/:childDeviceId", limitController.getLimitStatus);

module.exports = router;
