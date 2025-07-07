// const axios = require("axios");
// const ContentSettings = require("../models/ContentSettings");

// const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// exports.searchVideos = async (req, res) => {
//   const {
//     query = "learning for kids",
//     maxResults = 10,
//     childDeviceId,
//   } = req.query;

//   try {
//     // Fetch content settings for the device
//     let blockedChannels = [];
//     let blockUnsafeVideos = false;

//     if (childDeviceId) {
//       const settings = await ContentSettings.findOne({ childDeviceId });
//       if (settings) {
//         blockedChannels = settings.blockedChannels || [];
//         blockUnsafeVideos = settings.blockUnsafeVideos || false;
//       }
//     }

//     console.log("🛑 Blocked Channels:", blockedChannels);
//     console.log("🔒 Block Unsafe Videos:", blockUnsafeVideos);

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

//     let videos = response.data.items.map((item) => ({
//       videoId: item.id.videoId,
//       title: item.snippet.title,
//       description: item.snippet.description,
//       thumbnail:
//         item.snippet.thumbnails.high?.url ||
//         item.snippet.thumbnails.medium?.url ||
//         item.snippet.thumbnails.default.url,
//       channel: item.snippet.channelTitle,
//     }));

//     // 🚫 Filter videos by blocked channels
//     if (blockUnsafeVideos && blockedChannels.length > 0) {
//       videos = videos.filter(
//         (video) =>
//           !blockedChannels.some((blocked) =>
//             video.channel.toLowerCase().includes(blocked.toLowerCase())
//           )
//       );
//     }

//     res.json({ videos });
//   } catch (error) {
//     console.error("YouTube fetch error:", error.message);
//     res.status(500).json({ error: "Failed to fetch videos" });
//   }
// };
const ContentSettings = require("../models/ContentSettings");
const axios = require("axios");

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Common unsafe keywords
const UNSAFE_KEYWORDS = [
  "gun",
  "kill",
  "blood",
  "challenge",
  "suicide",
  "fight",
  "weapon",
  "murder",
  "horror",
];

exports.searchVideos = async (req, res) => {
  const {
    query = "learning for kids",
    maxResults = 10,
    childDeviceId,
  } = req.query;

  try {
    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          q: query,
          key: YOUTUBE_API_KEY,
          type: "video",
          maxResults,
          safeSearch: "strict", // still helps slightly
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
      categoryId: item.snippet.categoryId || null,
    }));

    // If childDeviceId is passed, apply content rules
    if (childDeviceId) {
      const settings = await ContentSettings.findOne({ childDeviceId });

      if (settings) {
        const { blockedCategories = [], blockUnsafeVideos } = settings;

        // ✅ Apply blockedCategories filter
        if (blockedCategories.length > 0) {
          videos = videos.filter(
            (v) => !blockedCategories.includes(v.categoryId)
          );
        }

        // ✅ Apply unsafe keyword filtering
        if (blockUnsafeVideos) {
          videos = videos.filter((v) => {
            const text = (v.title + " " + v.description).toLowerCase();
            return !UNSAFE_KEYWORDS.some((kw) => text.includes(kw));
          });
        }
      }
    }

    res.json({ videos });
  } catch (error) {
    console.error("YouTube fetch error:", error.message);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
};
