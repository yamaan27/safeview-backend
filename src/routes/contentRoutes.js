const express = require("express");
const router = express.Router();
const contentController = require("../controllers/contentController");
const checkPaired = require("../middlewares/checkPaired");

router.post("/update", checkPaired, contentController.updateSettings);
router.get("/:childDeviceId", checkPaired, contentController.getSettings);

module.exports = router;
