require("dotenv").config();

const app = require("./app");
const prisma = require("./config/database");
const { connectRedis } = require("./utils/redis.utils");

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("Connected to PostgreSQL");

    // Redis is a performance optimization, not a hard dependency — if it's
    // down, log it and keep going; cache.middleware already falls through
    // to the database on any Redis error.
    try {
      await connectRedis();
    } catch (error) {
      console.error("Redis connection failed, continuing without cache:", error.message);
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

startServer();