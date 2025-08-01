const express = require("express");
const router = express.Router();
const controller = require("../controllers/parentProfileController");

router.post("/", controller.createProfile); // Create
router.get("/:parentDeviceId", controller.getProfile); // Read
router.put("/:parentDeviceId", controller.updateProfile); // Update
router.post("/subscribe/:parentDeviceId", controller.updateSubscription);


module.exports = router;
