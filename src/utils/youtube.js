const YOUTUBE_API_KEYS = process.env.YOUTUBE_API_KEYS.split(",");

async function fetchWithRotatingKey(apiCallFn) {
  console.log("🔁 Starting YouTube API key rotation...");
  for (let i = 0; i < YOUTUBE_API_KEYS.length; i++) {
    const key = YOUTUBE_API_KEYS[i].trim();
    console.log(`🔑 Trying API Key #${i + 1}...`);

    try {
      const result = await apiCallFn(key);
      console.log(`✅ API Key #${i + 1} worked.`);
      return result;
    } catch (err) {
      console.warn(`⚠️ API Key #${i + 1} failed: ${err.message}`);
      continue;
    }
  }

  console.error("❌ All YouTube API keys failed.");
  throw new Error("❌ All YouTube API keys failed.");
}

module.exports = { fetchWithRotatingKey };
