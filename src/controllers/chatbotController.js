const { getChildFriendlyResponse } = require("../ai/ollamaService");
const axios = require("axios");

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


exports.streamChat = async (req, res) => {
  const { message } = req.query;

  if (!message) {
    return res.status(400).send("Message is required");
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  try {
    await getChildFriendlyResponse(message, (token) => {
      res.write(`data: ${token}\n\n`);
    });

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    res.write(`data: ERROR: ${err.message}\n\n`);
    res.end();
  }
};



exports.chatStreamSocket = (socket) => {
  socket.on("chatbot-message", async ({ deviceId, message }) => {
    console.log("🧠 New chatbot message from", deviceId, ":", message);

    const systemPrompt = `
You are a friendly, smart AI buddy talking to a child. 
Always keep your answers kind, simple, and age-appropriate. 
Never talk about violence, death, scary stuff, or anything unsafe.
    `;
    const prompt = `${systemPrompt}\n\nChild says: ${message}`;

    try {
      const res = await axios.post(
        "http://localhost:11434/api/generate",
        {
          model: "mistral",
          prompt,
          stream: true,
        },
        {
          responseType: "stream",
        }
      );

      let buffer = "";

      res.data.on("data", (chunk) => {
        const text = chunk.toString();

        // Example Ollama JSONL line: {"response":"Hello"}
        text.split("\n").forEach((line) => {
          try {
            if (line.trim()) {
              const json = JSON.parse(line);
              if (json.response) {
                socket.emit("chatbot-token", {
                  deviceId,
                  token: json.response,
                });
              }
            }
          } catch (err) {
            // Ignore JSON parse errors for incomplete lines
          }
        });
      });

      res.data.on("end", () => {
        socket.emit("chatbot-end", { deviceId });
      });
    } catch (err) {
      console.error("❌ Ollama streaming error:", err.message);
      socket.emit("chatbot-error", { deviceId, error: "AI response failed." });
    }
  });
};
