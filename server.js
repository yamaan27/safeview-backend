require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./src/app");
const http = require("http");
const { Server } = require("socket.io");
const { chatStreamSocket } = require("./src/controllers/chatbotController");
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // or restrict by frontend URL
    methods: ["GET", "POST"],
  },
});

// ✅ Set global socket reference
global._io = io;

io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  socket.on("join", (deviceId) => {
    socket.join(deviceId);
    console.log("📥 JOIN:", deviceId);
    console.log(`👶 Socket ${socket.id} joined room: ${deviceId}`);
  });

  // 🧠 Register chatbot socket listener
  chatStreamSocket(socket);

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    server.listen(3000, () => {
      console.log("🚀 Server running on port 3000");

      // ⏰ Start cron task after server is running
      const cron = require("node-cron");
      const checkAndNotifyTrialExpiry = require("./src/utils/checkTrialExpiry");

      cron.schedule("*/5 * * * *", () => {
        // For testing purpose, checking every 5 seconds

        // cron.schedule("*/5 * * * * *", () => {
        console.log("🕵️ Checking for expired trials...");
        checkAndNotifyTrialExpiry();
      });

      // ✅ Cron: Fetch trending videos every 30 mins
      // require("./src/utils/fetchTrending");

      // ✅ 🔽 ADD THIS CODE BELOW:

      // Check subscription expiry every 10 seconds
      // const checkSubscriptionExpiry = require("./src/utils/checkSubscriptionExpiry");
      // setInterval(() => {
      //   console.log("🔁 Checking for expired subscriptions...");
      //   checkSubscriptionExpiry();
      // }, 10 * 1000); // every 10 seconds (for testing)


      // Check subscription expiry every 5 minutes
      const checkSubscriptionExpiry = require("./src/utils/checkSubscriptionExpiry");

      setInterval(() => {
        // console.log("🔁 Checking for expired subscriptions...");
        checkSubscriptionExpiry();
      }, 5 * 60 * 1000); // every 5 minutes (5 min × 60 sec × 1000 ms)
    });
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
