const express = require("express");
const router = express.Router();
const chatbotController = require("../controllers/chatbotController");

router.post("/message", chatbotController.chat);
router.get("/stream", chatbotController.streamChat); 

module.exports = router;
