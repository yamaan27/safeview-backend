const ContentSettings = require("../models/ContentSettings");
const axios = require("axios");

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// const UNSAFE_KEYWORDS = [
//   // Violence & Gore
//   "gun",
//   "pistol",
//   "kill",
//   "blood",
//   "murder",
//   "weapon",
//   "knife",
//   "grenade",
//   "bomb",
//   "fight",
//   "behead",
//   "assault",
//   "death",
//   "dead",
//   "shooting",
//   "sniper",

//   // Suicide, self-harm & mental health
//   "suicide",
//   "self harm",
//   "cutting",
//   "depression",
//   "anxiety",
//   "die",
//   "hang",
//   "overdose",

//   // Horror & disturbing
//   "horror",
//   "ghost",
//   "paranormal",
//   "zombie",
//   "satan",
//   "demon",
//   "curse",
//   "witch",
//   "ritual",
//   "creepypasta",
//   "jumpscare",
//   "killer clown",
//   "bloodbath",

//   // Drugs, alcohol, abuse
//   "drug",
//   "alcohol",
//   "weed",
//   "cocaine",
//   "heroin",
//   "meth",
//   "vape",
//   "smoking",
//   "e-cigarette",

//   // Sexual, adult & inappropriate
//   "sex",
//   "nude",
//   "naked",
//   "porn",
//   "erotic",
//   "fetish",
//   "boobs",
//   "strip",
//   "twerk",
//   "xxx",
//   "kiss",
//   "romance",
//   "romantic",
//   "hot",
//   "suhagraat",
//   "ullu",
//   "web series",
//   "bhabhi",

//   // Harmful trends
//   "challenge",
//   "blackout challenge",
//   "tide pod",
//   "choking game",
//   "momo",
//   "blue whale",

//   // Bullying, hate speech
//   "hate",
//   "racist",
//   "sexist",
//   "bully",
//   "abuse",
//   "violence",
//   "threat",

//   // Gambling & scams
//   "casino",
//   "betting",
//   "lottery",
//   "scam",
//   "hack",
//   "cheat",

//   // Crime
//   "robbery",
//   "jail",
//   "prison",
//   "arrest",
//   "terrorist",
//   "explosion",
//   "kidnap",
//   "abduction",
// ];
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

exports.searchVideos = async (req, res) => {
  let { query = "", maxResults = 10, childDeviceId } = req.query;

  let isLocked = false;

  // if (!query.trim()) {
  //   query = "trending videos";
  // }

  // fallback if device not set
  query = query.trim();

  if (childDeviceId) {
    const settings = await ContentSettings.findOne({ childDeviceId });
    if (settings) {
      const { blockedCategories = [] } = settings;

      const unblocked = Object.keys(CATEGORY_QUERY_MAP).filter(
        (id) => !blockedCategories.includes(id)
      );

      // if no query provided and we have unblocked categories
      if (!query && unblocked.length > 0) {
        query = CATEGORY_QUERY_MAP[unblocked[0]]; // just use first unblocked
      }
    }
  }

  if (!query) {
    query = "trending videos";
  }

  try {
    console.log(`🧒 Device ID: ${childDeviceId || "none"}`);
    console.log(`📦 Params: { query: '${query}', maxResults: ${maxResults} }`);

    // Apply content filtering based on settings
    let collectedVideos = [];
    let nextPageToken = null;
    let totalFetched = 0;

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
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    };

    const isUnsafe = (text) => {
      const cleaned = normalizeText(text);
      return UNSAFE_KEYWORDS.some((kw) => cleaned.includes(kw.toLowerCase()));
    };

    while (collectedVideos.length < maxResults && totalFetched < 100) {
      const searchResponse = await axios.get(
        "https://www.googleapis.com/youtube/v3/search",
        {
          params: {
            part: "snippet",
            q: query,
            key: YOUTUBE_API_KEY,
            type: "video",
            maxResults: 10,
            pageToken: nextPageToken || undefined,
          },
        }
      );

      const searchItems = searchResponse.data.items;
      if (!searchItems.length) break;

      const videoIds = searchItems.map((item) => item.id.videoId).join(",");
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

      let pageVideos = videoResponse.data.items.map((item) => ({
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

      if (childDeviceId) {
        const settings = await ContentSettings.findOne({ childDeviceId });
        if (settings) {
          const {
            blockedCategories = [],
            blockUnsafeVideos: shouldBlock,
            isLocked: locked,
          } = settings;

          isLocked = locked;

          // Filter videos by allowed category
          pageVideos = pageVideos.filter(
            (v) => !blockedCategories.includes(v.categoryId)
          );

          // Then, apply unsafe keyword filtering
          if (shouldBlock) {
            pageVideos = pageVideos.filter((v) => {
              const text = `${v.title} ${v.description}`;
              return !isUnsafe(text);
            });
          }
        }
      }

      collectedVideos.push(...pageVideos);
      totalFetched += searchItems.length;
      nextPageToken = searchResponse.data.nextPageToken;

      if (!nextPageToken) break;
    }

    const finalVideos = collectedVideos.slice(0, maxResults);
    res.json({ isLocked, videos: finalVideos });
  } catch (error) {
    console.error("❌ YouTube fetch error:", error.message);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
};

// // First: Search videos
// const searchResponse = await axios.get(
//   "https://www.googleapis.com/youtube/v3/search",
//   {
//     params: {
//       part: "snippet",
//       q: query,
//       key: YOUTUBE_API_KEY,
//       type: "video",
//       maxResults,
//     },
//   }
// );

// const searchItems = searchResponse.data.items;

// const videoIds = searchItems.map((item) => item.id.videoId).join(",");

// // Second: Get video details (with categoryId)
// const videoResponse = await axios.get(
//   "https://www.googleapis.com/youtube/v3/videos",
//   {
//     params: {
//       part: "snippet",
//       id: videoIds,
//       key: YOUTUBE_API_KEY,
//     },
//   }
// );

// let videos = videoResponse.data.items.map((item) => ({
//   videoId: item.id,
//   title: item.snippet.title,
//   description: item.snippet.description,
//   thumbnail:
//     item.snippet.thumbnails.high?.url ||
//     item.snippet.thumbnails.medium?.url ||
//     item.snippet.thumbnails.default.url,
//   channel: item.snippet.channelTitle,
//   categoryId: item.snippet.categoryId,
// }));

// // Apply content filtering
// if (childDeviceId) {
//   const settings = await ContentSettings.findOne({ childDeviceId });

//   if (settings) {
//     const {
//       blockedCategories = [],
//       blockUnsafeVideos: shouldBlock,
//       isLocked: locked,
//     } = settings;

//     isLocked = locked;
//     console.log("🔒 isLocked:", isLocked);
//     console.log("🚫 Blocked Categories:", blockedCategories);
//     console.log("☢️ Block Unsafe Videos:", shouldBlock);

//     // Block by categoryId
//     if (blockedCategories.length > 0) {
//       const beforeCount = videos.length;
//       videos = videos.filter(
//         (v) => !blockedCategories.includes(v.categoryId)
//       );
//       console.log(
//         `✅ Filtered ${beforeCount - videos.length} videos by category`
//       );
//     }

//     // Block unsafe keyword content

//     // Block unsafe keyword content
//     if (shouldBlock) {
//       const beforeCount = videos.length;

//       const SAFE_CATEGORY_IDS = [
//         "1",
//         "2",
//         "10",
//         "15",
//         "17",
//         "20",
//         "22",
//         "23",
//         "24",
//         "26",
//         "27",
//         "28",
//         "29",
//       ];

//       const normalizeText = (text) => {
//         return text
//           .toLowerCase()
//           .replace(/[^a-z0-9\s]/g, " ") // Remove non-alphanumerics
//           .replace(/\s+/g, " ") // Normalize spaces
//           .trim();
//       };

//       const isUnsafe = (text) => {
//         const cleaned = normalizeText(text);
//         return UNSAFE_KEYWORDS.some((kw) =>
//           cleaned.includes(kw.toLowerCase())
//         );
//       };

//       videos = videos.filter((v) => {
//         const text = `${v.title} ${v.description}`;
//         const isSafeCategory = SAFE_CATEGORY_IDS.includes(v.categoryId);
//         const unsafe = isUnsafe(text);
//         return isSafeCategory && !unsafe;
//       });

//       console.log(
//         `✅ Filtered ${
//           beforeCount - videos.length
//         } videos for child-safe content (< 15 yrs)`
//       );
//     }

//   } else {
//     console.log("⚠️ No content settings found for this device.");
//   }
// }

// res.json({ isLocked, videos });

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
