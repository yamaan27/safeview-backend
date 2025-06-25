const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

router.get("/summary", reportController.getSummaryReport);
router.get("/agent/:agentId", reportController.getAgentReport);
router.get("/monthly", reportController.getMonthlyReport);
router.get("/agent-summary", reportController.getAgentTaskSummary);


module.exports = router;
