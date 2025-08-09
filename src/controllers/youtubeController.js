const ContentSettings = require("../models/ContentSettings");
const redisClient = require("../utils/redisClient");
const axios = require("axios");
const {
  isUnsafe,
  normalizeText,
  markBannedWordsInQuery,
} = require("../utils/moderation");
const { fetchWithRotatingKey } = require("../utils/youtube");

const MAX_ITERATIONS = 10;
const MAX_RESULTS_PER_CALL = 50;

function isSafeVideo(video, blockUnsafe) {
  if (!blockUnsafe) return true;

  // const title = video.snippet?.title || "";
  // const description = video.snippet?.description || "";
  const title = normalizeText(video.snippet?.title || "");
  const description = normalizeText(video.snippet?.description || "");
  const channel = normalizeText(video.snippet?.channelTitle || "");

  return !(isUnsafe(title) || isUnsafe(description) || isUnsafe(channel));
}

async function getChildSettings(childDeviceId) {
  return ContentSettings.findOne({ childDeviceId });
}

exports.searchVideos = async (req, res) => {
  try {
    let {
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
    // 🆕 Step 1.5: Sanitize query if unsafe words found
    if (blockUnsafeVideos) {
      const oldQuery = query;
      query = markBannedWordsInQuery(query);
      if (query !== oldQuery) {
        console.log(`🔤 Query sanitized: "${oldQuery}" → "${query}"`);
      }
    }
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

    const desiredOffset = (parsedPage - 1) * parsedLimit;
    let skipped = 0;

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

        if (blockedCategories.map(String).includes(String(catId))) {
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
        // v: v,
        id: v.id,
        title: v.snippet.title,
        channelTitle: v.snippet.channelTitle,
        description: v.snippet.description,
        publishedAt: v.snippet.publishedAt,
        categoryId: v.snippet.categoryId,
        thumbnail:
          v.snippet.thumbnails.maxres?.url ||
          v.snippet.thumbnails.high?.url ||
          v.snippet.thumbnails.medium?.url ||
          v.snippet.thumbnails.default?.url,
      }));

      // collected.push(...formatted);
      for (const video of formatted) {
        if (skipped < desiredOffset) {
          skipped++;
          continue;
        }
        collected.push(video);
        if (collected.length >= parsedLimit) break;
      }

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
