const express = require("express");
const cors = require("cors");
const pairingRoutes = require("./routes/pairingRoutes");
const contentRoutes = require("./routes/contentRoutes");
const activityRoutes = require("./routes/activityRoutes");
const limitRoutes = require("./routes/limitRoutes");
const youtubeRoutes = require("./routes/youtubeRoutes");
const parentProfileRoutes = require("./routes/parentProfileRoutes");
const upgradeRoutes = require("./routes/upgradeRoutes");


const app = express();
app.use(cors());
app.use(express.json());

app.use("/pairing", pairingRoutes);
app.use("/content", contentRoutes);
app.use("/activity", activityRoutes);
app.use("/limit", limitRoutes);
app.use("/youtube", youtubeRoutes);
app.use("/chatbot", require("./routes/chatbotRoutes"));
app.use("/api/parent-profile", parentProfileRoutes);
app.use("/api/upgrade", upgradeRoutes);


module.exports = app;
