const express = require("express");
const router = express.Router();
const controller = require("../controllers/upgradeInterestController");

router.post("/interest", controller.submitInterest);
router.get("/interest", controller.getAllInterests);

module.exports = router;
