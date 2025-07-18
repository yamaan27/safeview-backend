const express = require("express");
const router = express.Router();
const chatbotController = require("../controllers/chatbotController");

router.post("/message", chatbotController.chat);

module.exports = router;
