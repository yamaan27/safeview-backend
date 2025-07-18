const { getChildFriendlyResponse } = require("../ai/ollamaService");

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    console.log("📩 Chatbot received message:", message);

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const reply = await getChildFriendlyResponse(message);
    console.log("📤 Chatbot reply:", reply);

    res.json({ reply });
  } catch (error) {
    console.error("❌ Chatbot error:", error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
};
