// redisClient.js
const axios = require("axios");

const UPSTASH_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!UPSTASH_REST_URL || !UPSTASH_REST_TOKEN) {
  throw new Error("Upstash Redis URL or Token is not set");
}

const redisClient = {
  async get(key) {
    try {
      const response = await axios.get(`${UPSTASH_REST_URL}/get/${key}`, {
        headers: {
          Authorization: `Bearer ${UPSTASH_REST_TOKEN}`,
        },
      });
      return response.data.result;
    } catch (err) {
      console.error("❌ Redis GET error:", err.message);
      return null;
    }
  },

  async setEx(key, ttlSeconds, value) {
    try {
      const response = await axios.post(
        `${UPSTASH_REST_URL}/setex/${key}/${ttlSeconds}`,
        JSON.stringify(value),
        {
          headers: {
            Authorization: `Bearer ${UPSTASH_REST_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (err) {
      console.error("❌ Redis SETEX error:", err.message);
      return null;
    }
  },
};

module.exports = redisClient;
