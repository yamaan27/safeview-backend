const express = require("express");
const router = express.Router();
const contentController = require("../controllers/contentController");

router.post("/update", contentController.updateSettings);
router.get("/:childDeviceId", contentController.getSettings);

module.exports = router;
