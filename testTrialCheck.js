require("dotenv").config();
const mongoose = require("mongoose");
const checkAndNotifyTrialExpiry = require("./src/utils/checkTrialExpiry");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("🔗 Connected to MongoDB");
    checkAndNotifyTrialExpiry().then(() => {
      console.log("✅ Trial check done");
      mongoose.disconnect();
    });
  })
  .catch((err) => console.error("❌ Error:", err));
