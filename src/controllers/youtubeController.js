
// const ContentSettings = require("../models/ContentSettings");
// const axios = require("axios");

// const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// // Common unsafe keywords
// const UNSAFE_KEYWORDS = [
//   "gun",
//   "kill",
//   "blood",
//   "challenge",
//   "suicide",
//   "fight",
//   "weapon",
//   "murder",
//   "horror",
// ];


// exports.searchVideos = async (req, res) => {
//   const {
//     query = "",
//     maxResults = 10,
//     childDeviceId,
//   } = req.query;

//   let isLocked = false; // Default

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
//           // safeSearch: "none",
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
//       categoryId: item.snippet.categoryId || null,
//     }));

//     if (childDeviceId) {
//       const settings = await ContentSettings.findOne({ childDeviceId });

//       if (settings) {
//         const {
//           blockedCategories = [],
//           blockUnsafeVideos: shouldBlock,
//           isLocked: locked,
//         } = settings;

//         isLocked = locked; // assign

//         // Block by category
//         if (blockedCategories.length > 0) {
//           videos = videos.filter(
//             (v) => !blockedCategories.includes(v.categoryId)
//           );
//         }

//         // Block unsafe keywords
//         if (shouldBlock) {
//           videos = videos.filter((v) => {
//             const text = (v.title + " " + v.description).toLowerCase();
//             return !UNSAFE_KEYWORDS.some((kw) => text.includes(kw));
//           });
//         }
//       }
//     }

//     // ✅ Send back isLocked as well
//     res.json({ isLocked, videos });
//   } catch (error) {
//     console.error("YouTube fetch error:", error.message);
//     res.status(500).json({ error: "Failed to fetch videos" });
//   }
// };


const ContentSettings = require("../models/ContentSettings");
const axios = require("axios");

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

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
  let {
    query = "", // no default filter — open search
    maxResults = 10,
    childDeviceId,
  } = req.query;

  let isLocked = false;

  // Optional: Set a random popular query if completely empty
  if (!query.trim()) {
    query = "trending videos";
  }

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
          // Removed: safeSearch: "strict"
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

    if (childDeviceId) {
      const settings = await ContentSettings.findOne({ childDeviceId });

      if (settings) {
        const {
          blockedCategories = [],
          blockUnsafeVideos: shouldBlock,
          isLocked: locked,
        } = settings;

        isLocked = locked;

        // Block videos by category ID
        if (blockedCategories.length > 0) {
          videos = videos.filter(
            (v) => !blockedCategories.includes(v.categoryId)
          );
        }

        // Filter unsafe keyword content
        if (shouldBlock) {
          videos = videos.filter((v) => {
            const text = (v.title + " " + v.description).toLowerCase();
            return !UNSAFE_KEYWORDS.some((kw) => text.includes(kw));
          });
        }
      }
    }

    res.json({ isLocked, videos });
  } catch (error) {
    console.error("YouTube fetch error:", error.message);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
};
