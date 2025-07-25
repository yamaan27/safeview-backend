// jobs/fetchTrending.js
const axios = require("axios");
const cron = require("node-cron");
const TrendingVideo = require("../models/TrendingVideo");

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

const fetchTrendingVideos = async () => {
  try {
    const res = await axios.get(
      "https://www.googleapis.com/youtube/v3/videos",
      {
        params: {
          part: "snippet",
          chart: "mostPopular",
          maxResults: 20,
          regionCode: "IN", // change based on target
          key: YOUTUBE_API_KEY,
        },
      }
    );

    const videos = res.data.items.map((item) => ({
      videoId: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail:
        item.snippet.thumbnails.high?.url ||
        item.snippet.thumbnails.medium?.url ||
        item.snippet.thumbnails.default.url,
      channel: item.snippet.channelTitle,
      fetchedAt: new Date(),
    }));

    await TrendingVideo.deleteMany(); // Clear old
    await TrendingVideo.insertMany(videos);

    console.log("✅ Trending videos updated");
  } catch (err) {
    console.error("❌ Cron job failed:", err.message);
  }
};


// Run every 30 mins
cron.schedule("*/30 * * * *", fetchTrendingVideos);
