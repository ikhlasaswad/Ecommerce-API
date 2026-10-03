const { redisClient } = require("../utils/redis.utils");

// Wraps a GET route: serves a cached JSON response if present, otherwise lets
// the real handler run and caches whatever res.json() sends, for ttlSeconds.
// If Redis is down, it quietly falls through to the real handler — caching
// is a performance optimization, never a hard dependency.
const cache = (keyPrefix, ttlSeconds = 60) => {
  return async (req, res, next) => {
    if (!redisClient.isOpen) return next();

    const key = `${keyPrefix}:${req.originalUrl}`;

    try {
      const cached = await redisClient.get(key);
      if (cached) {
        res.setHeader("X-Cache", "HIT");
        return res.status(200).json(JSON.parse(cached));
      }
    } catch (error) {
      console.error("Redis GET error:", error.message);
      return next(); // fall through to the real handler on any Redis issue
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode === 200) {
        redisClient
          .setEx(key, ttlSeconds, JSON.stringify(body))
          .catch((error) => console.error("Redis SET error:", error.message));
      }
      res.setHeader("X-Cache", "MISS");
      return originalJson(body);
    };

    next();
  };
};

// Call after any write (create/update/delete) that could make a cached GET
// response stale. Deletes every key under the given prefix.
const invalidateCache = async (keyPrefix) => {
  if (!redisClient.isOpen) return;

  try {
    const keys = await redisClient.keys(`${keyPrefix}:*`);
    if (keys.length > 0) await redisClient.del(keys);
  } catch (error) {
    console.error("Redis invalidation error:", error.message);
  }
};

module.exports = { cache, invalidateCache };