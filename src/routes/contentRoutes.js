// const express = require("express");
// const router = express.Router();
// const contentController = require("../controllers/contentController");

// router.post("/update", contentController.updateSettings);
// router.get("/:childDeviceId", contentController.getSettings);

// module.exports = router;


const express = require("express");
const router = express.Router();
const contentController = require("../controllers/contentController");
const checkPaired = require("../middlewares/checkPaired");

router.post("/update", checkPaired, contentController.updateSettings);
router.get("/:childDeviceId", checkPaired, contentController.getSettings);

module.exports = router;
