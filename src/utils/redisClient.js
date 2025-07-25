const redis = require("redis");

const client = redis.createClient();

client
  .connect()
  .then(() => {
    console.log("✅ Redis connected");
  })
  .catch((err) => {
    console.error("❌ Redis connection failed:", err.message);
  });

client.on("error", (err) => {
  console.error("❌ Redis error:", err); // keep full error during development
});

// Optional: Export a fallback interface if Redis is down
module.exports = client;
