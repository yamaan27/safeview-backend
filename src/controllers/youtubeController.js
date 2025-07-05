// const axios = require("axios");

// const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// exports.searchVideos = async (req, res) => {
//   const { query = "learning for kids", maxResults = 10 } = req.query;

//   try {
//     const response = await axios.get(
//       "https://www.googleapis.com/youtube/v3/search",
//       {
//         params: {
//           part: "snippet",
//           q: query,
//           key: YOUTUBE_API_KEY,
//           type: "video",
//           maxResults,
//           safeSearch: "strict",
//         },
//       }
//     );

//     const videos = response.data.items.map((item) => ({
//       videoId: item.id.videoId,
//       title: item.snippet.title,
//       // thumbnail: item.snippet.thumbnails.default.url,
//       thumbnail:
//         item.snippet.thumbnails.high?.url ||
//         item.snippet.thumbnails.medium?.url ||
//         item.snippet.thumbnails.default.url,

//       channel: item.snippet.channelTitle,
//     }));

//     res.json({ videos });
//   } catch (error) {
//     console.error("YouTube fetch error:", error.message);
//     res.status(500).json({ error: "Failed to fetch videos" });
//   }
// };

const axios = require("axios");
const ContentSettings = require("../models/ContentSettings");

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

exports.searchVideos = async (req, res) => {
  const {
    query = "learning for kids",
    maxResults = 10,
    childDeviceId,
  } = req.query;

  try {
    // Fetch content settings for the device
    let blockedChannels = [];
    let blockUnsafeVideos = false;

    if (childDeviceId) {
      const settings = await ContentSettings.findOne({ childDeviceId });
      if (settings) {
        blockedChannels = settings.blockedChannels || [];
        blockUnsafeVideos = settings.blockUnsafeVideos || false;
      }
    }

    console.log("🛑 Blocked Channels:", blockedChannels);
    console.log("🔒 Block Unsafe Videos:", blockUnsafeVideos);

    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          q: query,
          key: YOUTUBE_API_KEY,
          type: "video",
          maxResults,
          safeSearch: "strict",
        },
      }
    );

    let videos = response.data.items.map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail:
        item.snippet.thumbnails.high?.url ||
        item.snippet.thumbnails.medium?.url ||
        item.snippet.thumbnails.default.url,
      channel: item.snippet.channelTitle,
    }));

    // 🚫 Filter videos by blocked channels
    if (blockUnsafeVideos && blockedChannels.length > 0) {
      videos = videos.filter(
        (video) =>
          !blockedChannels.some((blocked) =>
            video.channel.toLowerCase().includes(blocked.toLowerCase())
          )
      );
    }

    res.json({ videos });
  } catch (error) {
    console.error("YouTube fetch error:", error.message);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
};
