
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


// const ContentSettings = require("../models/ContentSettings");
// const axios = require("axios");

// const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

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

// // exports.searchVideos = async (req, res) => {
// //   let {
// //     query = "", // no default filter — open search
// //     maxResults = 10,
// //     childDeviceId,
// //   } = req.query;

// //   let isLocked = false;

// //   // Optional: Set a random popular query if completely empty
// //   if (!query.trim()) {
// //     query = "trending videos";
// //   }

// //   try {
// //     const response = await axios.get(
// //       "https://www.googleapis.com/youtube/v3/search",
// //       {
// //         params: {
// //           part: "snippet",
// //           q: query,
// //           key: YOUTUBE_API_KEY,
// //           type: "video",
// //           maxResults,
// //           // Removed: safeSearch: "strict"
// //         },
// //       }
// //     );

// //     let videos = response.data.items.map((item) => ({
// //       videoId: item.id.videoId,
// //       title: item.snippet.title,
// //       description: item.snippet.description,
// //       thumbnail:
// //         item.snippet.thumbnails.high?.url ||
// //         item.snippet.thumbnails.medium?.url ||
// //         item.snippet.thumbnails.default.url,
// //       channel: item.snippet.channelTitle,
// //       categoryId: item.snippet.categoryId || null,
// //     }));

// //     if (childDeviceId) {
// //       const settings = await ContentSettings.findOne({ childDeviceId });

// //       if (settings) {
// //         const {
// //           blockedCategories = [],
// //           blockUnsafeVideos: shouldBlock,
// //           isLocked: locked,
// //         } = settings;

// //         isLocked = locked;

// //         // Block videos by category ID
// //         if (blockedCategories.length > 0) {
// //           videos = videos.filter(
// //             (v) => !blockedCategories.includes(v.categoryId)
// //           );
// //         }

// //         // Filter unsafe keyword content
// //         if (shouldBlock) {
// //           videos = videos.filter((v) => {
// //             const text = (v.title + " " + v.description).toLowerCase();
// //             return !UNSAFE_KEYWORDS.some((kw) => text.includes(kw));
// //           });
// //         }
// //       }
// //     }

// //     res.json({ isLocked, videos });
// //   } catch (error) {
// //     console.error("YouTube fetch error:", error.message);
// //     res.status(500).json({ error: "Failed to fetch videos" });
// //   }
// // };



// exports.searchVideos = async (req, res) => {
//   let {
//     query = "", // no default filter — open search
//     maxResults = 10,
//     childDeviceId,
//   } = req.query;

//   let isLocked = false;

//   if (!query.trim()) {
//     query = "trending videos";
//   }

//   try {
//     console.log(`🧒 Device ID: ${childDeviceId || "none"}`);
//     console.log(`📦 Params: { query: '${query}', maxResults: ${maxResults} }`);

//     const response = await axios.get(
//       "https://www.googleapis.com/youtube/v3/search",
//       {
//         params: {
//           part: "snippet",
//           q: query,
//           key: YOUTUBE_API_KEY,
//           type: "video",
//           maxResults,
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

//         isLocked = locked;

//         console.log("🔒 isLocked:", isLocked);
//         console.log("🚫 Blocked Categories:", blockedCategories);
//         console.log("☢️ Block Unsafe Videos:", shouldBlock);

//         // Block by category
//         if (blockedCategories.length > 0) {
//           const beforeCount = videos.length;
//           videos = videos.filter(
//             (v) => !blockedCategories.includes(v.categoryId)
//           );
//           console.log(
//             `✅ Filtered ${beforeCount - videos.length} videos by category`
//           );
//         }

//         // Block unsafe keywords
//         if (shouldBlock) {
//           const beforeCount = videos.length;
//           videos = videos.filter((v) => {
//             const text = (v.title + " " + v.description).toLowerCase();
//             return !UNSAFE_KEYWORDS.some((kw) => text.includes(kw));
//           });
//           console.log(
//             `✅ Filtered ${
//               beforeCount - videos.length
//             } videos by unsafe keywords`
//           );
//         }
//       } else {
//         console.log("⚠️ No content settings found for device");
//       }
//     }

//     res.json({ isLocked, videos });
//   } catch (error) {
//     console.error("❌ YouTube fetch error:", error.message);
//     res.status(500).json({ error: "Failed to fetch videos" });
//   }
// };



const ContentSettings = require("../models/ContentSettings");
const axios = require("axios");

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

const UNSAFE_KEYWORDS = [
  // Violence & Gore
  "gun",
  "pistol",
  "kill",
  "blood",
  "murder",
  "weapon",
  "knife",
  "grenade",
  "bomb",
  "fight",
  "behead",
  "assault",
  "death",
  "dead",
  "shooting",
  "sniper",

  // Suicide, self-harm & mental health
  "suicide",
  "self harm",
  "cutting",
  "depression",
  "anxiety",
  "die",
  "hang",
  "overdose",

  // Horror & disturbing
  "horror",
  "ghost",
  "paranormal",
  "zombie",
  "satan",
  "demon",
  "curse",
  "witch",
  "ritual",
  "creepypasta",
  "jumpscare",
  "killer clown",
  "bloodbath",

  // Drugs, alcohol, abuse
  "drug",
  "alcohol",
  "weed",
  "cocaine",
  "heroin",
  "meth",
  "vape",
  "smoking",
  "e-cigarette",

  // Sexual, adult & inappropriate
  "sex",
  "nude",
  "naked",
  "porn",
  "erotic",
  "fetish",
  "boobs",
  "strip",
  "twerk",
  "xxx",
  "kiss",
  "romance",
  "romantic",
  "hot",
  "suhagraat",
  "ullu",
  "web series",
  "bhabhi",

  // Harmful trends
  "challenge",
  "blackout challenge",
  "tide pod",
  "choking game",
  "momo",
  "blue whale",

  // Bullying, hate speech
  "hate",
  "racist",
  "sexist",
  "bully",
  "abuse",
  "violence",
  "threat",

  // Gambling & scams
  "casino",
  "betting",
  "lottery",
  "scam",
  "hack",
  "cheat",

  // Crime
  "robbery",
  "jail",
  "prison",
  "arrest",
  "terrorist",
  "explosion",
  "kidnap",
  "abduction",
];



exports.searchVideos = async (req, res) => {
  let { query = "", maxResults = 10, childDeviceId } = req.query;

  let isLocked = false;

  if (!query.trim()) {
    query = "trending videos";
  }

  try {
    console.log(`🧒 Device ID: ${childDeviceId || "none"}`);
    console.log(`📦 Params: { query: '${query}', maxResults: ${maxResults} }`);

    // First: Search videos
    const searchResponse = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          q: query,
          key: YOUTUBE_API_KEY,
          type: "video",
          maxResults,
        },
      }
    );

    const searchItems = searchResponse.data.items;

    const videoIds = searchItems.map((item) => item.id.videoId).join(",");

    // Second: Get video details (with categoryId)
    const videoResponse = await axios.get(
      "https://www.googleapis.com/youtube/v3/videos",
      {
        params: {
          part: "snippet",
          id: videoIds,
          key: YOUTUBE_API_KEY,
        },
      }
    );

    let videos = videoResponse.data.items.map((item) => ({
      videoId: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail:
        item.snippet.thumbnails.high?.url ||
        item.snippet.thumbnails.medium?.url ||
        item.snippet.thumbnails.default.url,
      channel: item.snippet.channelTitle,
      categoryId: item.snippet.categoryId,
    }));

    // Apply content filtering
    if (childDeviceId) {
      const settings = await ContentSettings.findOne({ childDeviceId });

      if (settings) {
        const {
          blockedCategories = [],
          blockUnsafeVideos: shouldBlock,
          isLocked: locked,
        } = settings;

        isLocked = locked;
        console.log("🔒 isLocked:", isLocked);
        console.log("🚫 Blocked Categories:", blockedCategories);
        console.log("☢️ Block Unsafe Videos:", shouldBlock);

        // Block by categoryId
        if (blockedCategories.length > 0) {
          const beforeCount = videos.length;
          videos = videos.filter(
            (v) => !blockedCategories.includes(v.categoryId)
          );
          console.log(
            `✅ Filtered ${beforeCount - videos.length} videos by category`
          );
        }

        // Block unsafe keyword content
        // if (shouldBlock) {
        //   const beforeCount = videos.length;

        //   const SAFE_CATEGORY_IDS = [
        //     "1", // Film & Animation (needs manual filtering)
        //     "2", // Autos & Vehicles
        //     "10", // Music
        //     "15", // Pets & Animals
        //     "17", // Sports
        //     "20", // Gaming
        //     "22", // People & Blogs
        //     "23", // Comedy
        //     "24", // Entertainment
        //     "26", // Howto & Style
        //     "27", // Education ✅
        //     "28", // Science & Technology ✅
        //     "29", // Nonprofits & Activism
        //   ];

        //   videos = videos.filter((v) => {
        //     const text = (v.title + " " + v.description).toLowerCase();

        //     const isSafeCategory = SAFE_CATEGORY_IDS.includes(v.categoryId);
        //     const hasUnsafeKeywords = UNSAFE_KEYWORDS.some((kw) =>
        //       text.includes(kw)
        //     );

        //     return isSafeCategory && !hasUnsafeKeywords;
        //   });

        //   console.log(
        //     `✅ Filtered ${
        //       beforeCount - videos.length
        //     } videos for child-safe content (< 15 yrs)`
        //   );
        // }
        // Block unsafe keyword content
        if (shouldBlock) {
          const beforeCount = videos.length;

          const SAFE_CATEGORY_IDS = [
            "1",
            "2",
            "10",
            "15",
            "17",
            "20",
            "22",
            "23",
            "24",
            "26",
            "27",
            "28",
            "29",
          ];

          const normalizeText = (text) => {
            return text
              .toLowerCase()
              .replace(/[^a-z0-9\s]/g, " ") // Remove non-alphanumerics
              .replace(/\s+/g, " ") // Normalize spaces
              .trim();
          };

          const isUnsafe = (text) => {
            const cleaned = normalizeText(text);
            return UNSAFE_KEYWORDS.some((kw) =>
              cleaned.includes(kw.toLowerCase())
            );
          };

          videos = videos.filter((v) => {
            const text = `${v.title} ${v.description}`;
            const isSafeCategory = SAFE_CATEGORY_IDS.includes(v.categoryId);
            const unsafe = isUnsafe(text);
            return isSafeCategory && !unsafe;
          });

          console.log(
            `✅ Filtered ${
              beforeCount - videos.length
            } videos for child-safe content (< 15 yrs)`
          );
        }
        
      } else {
        console.log("⚠️ No content settings found for this device.");
      }
    }

    res.json({ isLocked, videos });
  } catch (error) {
    console.error("❌ YouTube fetch error:", error.message);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
};
