const ContentSettings = require("../models/ContentSettings");
const redisClient = require("../utils/redisClient");
const axios = require("axios");
const { isUnsafe } = require("../utils/moderation");
const { fetchWithRotatingKey } = require("../utils/youtube");


const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

const UNSAFE_KEYWORDS = [
  // Violence & Gore
  "gun",
  "rifle",
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
  "massacre",
  "stab",
  "violence",
  "gore",
  "explosion",
  "hostage",
  "execution",
  "war",
  "terrorism",
  "shootout",
  "gang",
  "mafia",
  "hitman",
  "serial killer",
  "torture",
  "mutilation",
  "warzone",
  "combat",
  "battle",
  "shank",
  "brutality",
  "mass shooting",
  "genocide",

  // Suicide, self-harm & mental health
  "suicide",
  "self harm",
  "self-harm",
  "cutting",
  "depression",
  "anxiety",
  "die",
  "hang",
  "overdose",
  "kill myself",
  "kms",
  "unalive",
  "sad",
  "mental illness",
  "suicidal",
  "self injury",
  "bleeding",
  "rope",
  "noose",
  "jump off",
  "bridge",
  "overdosing",
  "self destruction",
  "self sabotage",
  "harmful thoughts",
  "hopeless",
  "worthless",
  "end it all",
  "painful death",
  "self medicate",
  "psych ward",

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
  "possessed",
  "haunted",
  "evil",
  "sacrifice",
  "cult",
  "voodoo",
  "scary",
  "terror",
  "exorcism",
  "nightmare",
  "slender man",
  "skinwalker",
  "wendigo",
  "hell",
  "devil worship",
  "black magic",
  "dark web",
  "disturbing",
  "gory",
  "mutilated",
  "body horror",
  "snuff film",
  "found footage",
  "torture porn",

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
  "blunt",
  "joint",
  "bong",
  "dope",
  "pot",
  "stoned",
  "drunk",
  "high",
  "intoxicated",
  "narcotic",
  "abuse",
  "fentanyl",
  "oxy",
  "xanax",
  "adderall",
  "psychedelic",
  "LSD",
  "mushrooms",
  "ecstasy",
  "MDMA",
  "ketamine",
  "PCP",
  "lean",
  "codeine",
  "opioid",
  "crack",
  "meth lab",
  "needle",
  "injection",
  "overdosing",
  "withdrawal",
  "addiction",
  "rehab",
  "bath salts",

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
  "kamasutra",
  "onlyfans",
  "nsfw",
  "lust",
  "adult",
  "escort",
  "lingerie",
  "thirst trap",
  "milf",
  "bikini",
  "underwear",
  "seduce",
  "masturbate",
  "orgasm",
  "foreplay",
  "sexting",
  "hookup",
  "one night stand",
  "affair",
  "cheating",
  "swinger",
  "polyamory",
  "threesome",
  "gangbang",
  "virginity",
  "rape",
  "molest",
  "pedophile",
  "incest",
  "voyeur",
  "explicit",
  "hardcore",
  "anal",
  "blowjob",
  "handjob",
  "dildo",
  "vibrator",
  "sex toy",
  "prostitute",
  "brothel",

  // Harmful trends
  "challenge",
  "blackout challenge",
  "tide pod",
  "choking game",
  "momo",
  "blue whale",
  "devious lick",
  "skull breaker",
  "crazy dare",
  "fire challenge",
  "salt ice challenge",
  "outlet challenge",
  "benadryl challenge",
  "eraser challenge",
  "condom snorting",
  "car surfing",
  "duct tape challenge",
  "hot water challenge",
  "pass out challenge",
  "whisper challenge",
  "cinnamon challenge",
  "ghost pepper challenge",
  "vodka eyeballing",
  "milk crate challenge",
  "no bones challenge",
  "shell on challenge",
  "cha cha slide challenge",

  // Bullying, hate speech
  "hate",
  "racist",
  "sexist",
  "bully",
  "abuse",
  "threat",
  "harass",
  "retard",
  "nazi",
  "slur",
  "homophobic",
  "transphobic",
  "fat shaming",
  "cyberbully",
  "kys",
  "die",
  "ugly",
  "worthless",
  "loser",
  "nobody likes you",
  "kill yourself",
  "you should die",
  "go die",
  "trash",
  "garbage",
  "disgusting",
  "pathetic",
  "useless",
  "freak",
  "weirdo",
  "creep",
  "stalker",
  "cancel culture",
  "doxxing",
  "swatting",
  "trolling",
  "gaslighting",
  "manipulate",
  "emotional abuse",

  // Gambling & scams
  "casino",
  "betting",
  "lottery",
  "scam",
  "hack",
  "cheat",
  "jackpot",
  "roulette",
  "slots",
  "poker",
  "earn money fast",
  "get rich quick",
  "money trick",
  "bitcoin scam",
  "crypto scam",
  "ponzi scheme",
  "pyramid scheme",
  "forex scam",
  "binary options",
  "sports betting",
  "online gambling",
  "underage gambling",
  "loan scam",
  "credit card scam",
  "identity theft",
  "phishing",
  "fake check",
  "advance fee",
  "romance scam",
  "catfishing",
  "fake lottery",
  "Nigerian prince",
  "IRS scam",
  "tech support scam",
  "fake antivirus",

  // Crime
  "robbery",
  "jail",
  "prison",
  "arrest",
  "terrorist",
  "explosion",
  "kidnap",
  "abduction",
  "felony",
  "criminal",
  "cartel",
  "murderer",
  "criminal minds",
  "heist",
  "burglary",
  "theft",
  "shoplifting",
  "carjacking",
  "hijack",
  "cybercrime",
  "fraud",
  "forgery",
  "arson",
  "vandalism",
  "homicide",
  "manslaughter",
  "assassin",
  "hit list",
  "bomb threat",
  "school shooter",
  "mass murderer",
  "hate crime",
  "domestic violence",
  "human trafficking",
  "sex trafficking",
  "child abuse",
  "elder abuse",
  "animal cruelty",
  "illegal weapons",
  "drug trafficking",
  "money laundering",
  "corruption",
  "bribery",
];

const CATEGORY_QUERY_MAP = {
  1: "animation",
  2: "vehicles",
  10: "music",
  15: "pets",
  17: "sports",
  18: "short movies",
  19: "travel",
  20: "gaming",
  21: "videoblogging",
  22: "vlogs",
  23: "comedy",
  24: "entertainment",
  25: "news",
  26: "how-to",
  27: "education",
  28: "science",
  29: "nonprofits",
  30: "movies",
  31: "anime",
  32: "action/adventure",
  33: "classics",
  34: "comedy movies",
  35: "documentary",
  36: "drama",
  37: "family",
  38: "foreign",
  39: "horror",
  40: "sci-fi/fantasy",
  41: "thriller",
  42: "shorts",
  43: "shows",
  44: "trailers",
};



// const MAX_ITERATIONS = 10;

// async function getChildSettings(childDeviceId) {
//   return ContentSettings.findOne({ childDeviceId });
// }

// function isSafeVideo(video, blockUnsafe) {
//   if (blockUnsafe && isUnsafe(video)) return false;
//   return true;
// }

// exports.searchVideos = async (req, res) => {
//   try {
//     const {
//       childDeviceId,
//       query = "trending videos",
//       limit = 10,
//       page = 1,
//     } = req.query;

//     const parsedLimit = Math.min(Number(limit), 50);
//     const parsedPage = Math.max(Number(page), 1);
//     const cacheKey = `videos:${query}:${parsedLimit}:${parsedPage}:${childDeviceId}`;
//     console.log(`📥 limit: ${parsedLimit}, page: ${parsedPage}`);

//     // Check Redis cache
//     const cached = await redisClient.get(cacheKey);
//     if (cached) {
//       console.log("⚡ Cache hit");
//       return res.json(JSON.parse(cached));
//     }

//     // Load child settings
//     const settings = await getChildSettings(childDeviceId);
//     if (!settings)
//       return res.status(404).json({ message: "Child settings not found" });

//     const { blockedCategories = [], blockUnsafeVideos = false } = settings;

//     let collected = [];
//     let pageToken = "";
//     let fetchCount = 0;
//     let usedBackupQuery = false;
//     let currentQuery = query;

//     while (collected.length < parsedLimit && fetchCount < MAX_ITERATIONS) {
//       const searchRes = await axios.get(
//         "https://www.googleapis.com/youtube/v3/search",
//         {
//           params: {
//             q: currentQuery,
//             part: "snippet",
//             maxResults: 10,
//             type: "video",
//             pageToken,
//             key: process.env.YOUTUBE_API_KEY,
//           },
//         }
//       );

//       const items = searchRes.data.items || [];
//       const videoIds = items.map((i) => i.id.videoId).filter(Boolean);
//       if (videoIds.length === 0) break;

//       const videoRes = await axios.get(
//         "https://www.googleapis.com/youtube/v3/videos",
//         {
//           params: {
//             id: videoIds.join(","),
//             part: "snippet,contentDetails",
//             key: process.env.YOUTUBE_API_KEY,
//           },
//         }
//       );

//       const videos = videoRes.data.items || [];

//       const filtered = videos.filter((video) => {
//         const categoryId = video.snippet?.categoryId;
//         video.categoryId = categoryId;
//         return (
//           categoryId &&
//           !blockedCategories.includes(categoryId.toString()) &&
//           isSafeVideo(video, blockUnsafeVideos)
//         );
//       });

//       collected.push(...filtered);

//       if (collected.length >= parsedLimit) break;
//       pageToken = searchRes.data.nextPageToken;
//       fetchCount++;

//       if (!pageToken && collected.length === 0 && !usedBackupQuery) {
//         console.log("⚠️ Fallback: trying backup query");
//         currentQuery = "trending kids videos";
//         usedBackupQuery = true;
//       }
//     }

//     const finalVideos = collected.slice(0, parsedLimit);
//     await redisClient.setEx(cacheKey, 60 * 5, finalVideos); // 5 minutes TTL

//     console.log(`✅ Fetched: ${finalVideos.length} videos`);
//     return res.json(finalVideos);
//   } catch (err) {
//     console.error("❌ Error in searchVideos:", err.message);
//     res.status(500).json({ message: "Server error" });
//   }
// };
const MAX_ITERATIONS = 10;
const MAX_RESULTS_PER_CALL = 50;

function isSafeVideo(video, blockUnsafe) {
  if (blockUnsafe && isUnsafe(video.snippet.title)) return false;
  return true;
}

async function getChildSettings(childDeviceId) {
  return ContentSettings.findOne({ childDeviceId });
}

exports.searchVideos = async (req, res) => {
  try {
    const {
      childDeviceId,
      query = "trending videos",
      limit = 10,
      page = 1,
    } = req.query;

    const parsedLimit = Math.min(Number(limit), 50);
    const parsedPage = Math.max(Number(page), 1);
    console.log(`📥 Requested limit: ${parsedLimit}, page: ${parsedPage}`);

    // Step 1: Get settings
    const settings = await getChildSettings(childDeviceId);
    if (!settings) {
      return res.status(404).json({ message: "Child settings not found" });
    }

    const {
      blockedCategories = [],
      blockUnsafeVideos = false,
      ageGroup,
      allowSearch,
    } = settings;

    console.log("⚙️ Settings found:", {
      ageGroup,
      allowSearch,
      blockUnsafeVideos,
      blockedCategories: blockedCategories.length,
    });

    // Step 2: Cache key (after loading settings)
    const cacheKey = `videos:${childDeviceId}:${query}:${parsedLimit}:${parsedPage}:${blockUnsafeVideos}:${blockedCategories
      .sort()
      .join(",")}`;

    // Step 3: Check Redis cache
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log("⚡ Cache hit");
      return res.json(JSON.parse(cached));
    }

    // Step 4: Fetch videos from YouTube API
    let collected = [];
    let pageToken = "";
    let fetchCount = 0;
    let usedBackupQuery = false;
    let currentQuery = query;

    for (let i = 0; i < MAX_ITERATIONS && collected.length < parsedLimit; i++) {
      console.log(`🔁 Iteration #${i + 1} | Collected: ${collected.length}`);
      const searchRes = await fetchWithRotatingKey((key) =>
        axios.get("https://www.googleapis.com/youtube/v3/search", {
          params: {
            q: currentQuery,
            part: "snippet",
            maxResults: MAX_RESULTS_PER_CALL,
            type: "video",
            pageToken,
            key,
          },
        })
      );


      const searchItems = searchRes.data.items || [];
      const videoIds = searchItems
        .map((item) => item.id.videoId)
        .filter(Boolean);
      if (!videoIds.length) break;

      const videoRes = await fetchWithRotatingKey((key) =>
        axios.get("https://www.googleapis.com/youtube/v3/videos", {
          params: {
            id: videoIds.join(","),
            part: "snippet,contentDetails",
            key,
          },
        })
      );


      const videoItems = videoRes.data.items || [];
      fetchCount += 2;

      const filtered = videoItems.filter((video) => {
        const catId = video.snippet?.categoryId?.toString();
        const title = video.snippet?.title || "";

        if (blockedCategories.includes(catId)) {
          console.log(`❌ Blocked category: ${catId}`);
          return false;
        }

        if (!isSafeVideo(video, blockUnsafeVideos)) {
          console.log(`❌ Unsafe title: ${title}`);
          return false;
        }

        return true;
      });

      const formatted = filtered.map((v) => ({
        id: v.id,
        title: v.snippet.title,
        channelTitle: v.snippet.channelTitle,
        publishedAt: v.snippet.publishedAt,
        thumbnail:
          v.snippet.thumbnails.maxres?.url ||
          v.snippet.thumbnails.high?.url ||
          v.snippet.thumbnails.medium?.url ||
          v.snippet.thumbnails.default?.url,
      }));

      collected.push(...formatted);

      if (collected.length >= parsedLimit) break;

      pageToken = searchRes.data.nextPageToken;

      // Fallback query trigger
      if (i >= 4 && collected.length < 2 && !usedBackupQuery) {
        console.log("⚠️ Fallback: switching to trending kids videos");
        currentQuery = "trending kids videos";
        usedBackupQuery = true;
      }

      if (!pageToken) break;
    }

    const finalVideos = collected.slice(0, parsedLimit);

    console.log(
      `✅ Final videos: ${finalVideos.length} | YouTube API calls: ${fetchCount}`
    );

    const response = {
      page: parsedPage,
      count: finalVideos.length,
      blockedCategories: blockedCategories.length,
      videos: finalVideos,
    };

    // Step 5: Save to Redis cache
    await redisClient.setEx(cacheKey, 60 * 2, response); // 2 minutes

    return res.json(response);
  } catch (err) {
    console.error("❌ Error in searchVideos:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};


const MAX_RESULTS = 10;
const MAX_FETCH_LIMIT = 50;

function formatVideo(v) {
  return {
    videoId: v.id,
    title: v.snippet.title,
    description: v.snippet.description,
    thumbnail:
      v.snippet.thumbnails.high?.url ||
      v.snippet.thumbnails.medium?.url ||
      v.snippet.thumbnails.default?.url,
    channel: v.snippet.channelTitle,
    categoryId: v.snippet.categoryId,
  };
}

exports.searchAndEmitVideos = async (
  childDeviceId,
  query = "trending videos",
  maxResults = MAX_RESULTS
) => {
  try {
    const settings = await ContentSettings.findOne({ childDeviceId });
    if (!settings) {
      console.log("⚠️ No settings found for", childDeviceId);
      return;
    }

    const {
      blockedCategories = [],
      blockUnsafeVideos = false,
      isLocked = false,
    } = settings;

    const cacheKey = `emit:${childDeviceId}:${query}:${maxResults}:${blockedCategories
      .sort()
      .join(",")}:${blockUnsafeVideos}`;

    // Redis check
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      const videos = JSON.parse(cached);
      if (global._io) {
        global._io.to(childDeviceId).emit("videoListUpdated", {
          isLocked,
          videos,
        });
        console.log(`⚡ Sent cached videoListUpdated to ${childDeviceId}`);
      }
      return;
    }

    let collected = [];
    let pageToken = "";
    let fetchCount = 0;

    for (
      let i = 0;
      collected.length < maxResults && fetchCount < MAX_FETCH_LIMIT;
      i++
    ) {
      console.log(`🔁 API Iteration ${i + 1} | Collected: ${collected.length}`);
      const searchRes = await fetchWithRotatingKey((key) =>
        axios.get("https://www.googleapis.com/youtube/v3/search", {
          params: {
            q: query,
            part: "snippet",
            maxResults: 10,
            type: "video",
            pageToken,
            key,
          },
        })
      );

      const searchItems = searchRes.data.items || [];
      const videoIds = searchItems
        .map((item) => item.id.videoId)
        .filter(Boolean);
      if (!videoIds.length) break;

      const videoRes = await fetchWithRotatingKey((key) =>
        axios.get("https://www.googleapis.com/youtube/v3/videos", {
          params: {
            id: videoIds.join(","),
            part: "snippet,contentDetails",
            key,
          },
        })
      );

      const videoItems = videoRes.data.items || [];
      fetchCount += 2;

      const filtered = videoItems
        .filter((v) => {
          const catId = v.snippet?.categoryId?.toString();
          const title = v.snippet?.title || "";
          const description = v.snippet?.description || "";
          if (blockedCategories.includes(catId)) {
            console.log(`❌ Blocked category: ${catId}`);
            return false;
          }
          if (blockUnsafeVideos && isUnsafe(`${title} ${description}`)) {
            console.log(`❌ Unsafe video: ${title}`);
            return false;
          }
          return true;
        })
        .map(formatVideo);

      collected.push(...filtered);
      if (collected.length >= maxResults) break;

      pageToken = searchRes.data.nextPageToken;
      if (!pageToken) break;
    }

    const finalVideos = collected.slice(0, maxResults);

    // Redis cache (1 hour)
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(finalVideos));

    if (global._io) {
      global._io.to(childDeviceId).emit("videoListUpdated", {
        isLocked,
        videos: finalVideos,
      });
      console.log(`📤 Emitted videoListUpdated to ${childDeviceId}`);
    }

    console.log(
      `✅ Emission complete | Videos sent: ${finalVideos.length} | API calls: ${fetchCount}`
    );
  } catch (err) {
    console.error("❌ searchAndEmitVideos error:", err.message);
  }
};
