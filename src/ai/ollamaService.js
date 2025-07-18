const axios = require("axios");

exports.getChildFriendlyResponse = async (message) => {
  const systemPrompt = `
You are a friendly, smart AI buddy talking to a child. 
Always keep your answers kind, simple, and age-appropriate. 
Never talk about violence, death, scary stuff, or anything unsafe.
  `;

  const prompt = `${systemPrompt}\n\nChild says: ${message}`;
  console.log("👉 Sending prompt to Ollama:\n", prompt);

  try {
    const res = await axios.post("http://localhost:11434/api/generate", {
      model: "mistral",
      prompt,
      stream: false,
      // stream: true,
      temperature: 0.7,
      max_tokens: 60,
    });

    console.log("✅ Ollama raw response:", res.data);
    return res.data.response.trim();
  } catch (err) {
    console.error("❌ Ollama error:", err.message);
    throw new Error("Ollama model error");
  }
};
