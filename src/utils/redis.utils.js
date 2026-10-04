const { createClient } = require("redis");

const url = process.env.REDIS_URL || "redis://localhost:6379";

const redisClient = createClient({
  url,
  socket: {
    tls: url.startsWith("rediss://") ? true : undefined,
    rejectUnauthorized: false,
  },
});

redisClient.on("error", (err) =>
  console.error("Redis Client Error:", err.message)
);
redisClient.on("connect", () => console.log("Connected to Redis"));

let isConnecting = null;

// Call this once at server startup (see server.js). Safe to call multiple
// times - only connects once.
const connectRedis = async () => {
  if (redisClient.isOpen) return redisClient;
  if (!isConnecting) isConnecting = redisClient.connect();
  await isConnecting;
  return redisClient;
};

module.exports = { redisClient, connectRedis };