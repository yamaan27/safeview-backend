const axios = require("axios");

exports.getChildFriendlyResponse = async (message, onToken) => {
  const systemPrompt = `
You are a friendly, smart AI buddy talking to a child. 
Always keep your answers kind, simple, and age-appropriate. 
Never talk about violence, death, scary stuff, or anything unsafe.
`;

  const prompt = `${systemPrompt}\n\nChild says: ${message}`;
  console.log("👉 Sending prompt to Ollama:\n", prompt);

  try {
    const response = await axios({
      method: "post",
      url: "http://localhost:11434/api/generate",
      data: {
        model: "mistral", // or "llama3"
        prompt,
        stream: true,
        temperature: 0.7,
        max_tokens: 100,
      },
      responseType: "stream",
    });

    return new Promise((resolve, reject) => {
      let full = "";

      response.data.on("data", (chunk) => {
        const lines = chunk
          .toString()
          .split("\n")
          .filter((line) => line.trim() !== "");

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            const token = parsed.response || "";
            full += token;
            if (onToken) onToken(token);
          } catch (err) {
            console.error("❌ Parse error:", err.message);
          }
        }
      });

      response.data.on("end", () => resolve(full.trim()));
      response.data.on("error", (err) => {
        console.error("❌ Stream error:", err.message);
        reject(err);
      });
    });
  } catch (err) {
    console.error("❌ Ollama stream error:", err.message);
    throw new Error("Ollama streaming error");
  }
};
