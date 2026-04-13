import Redis from "ioredis";

console.log(" Redis file loaded");
export const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",   // local Redis
  port: parseInt(process.env.REDIS_PORT || "6379"),
  maxRetriesPerRequest: 3,
  lazyConnect: true, // Don't connect immediately
});

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("error", (err) => {
  console.error("Redis error", err);
  // Don't exit the process on Redis error
});

redis.on("ready", () => {
  console.log("Redis is ready");
});

redis.on("close", () => {
  console.log("Redis connection closed");
});

// Function to check if Redis is connected
export const isRedisConnected = async (): Promise<boolean> => {
  try {
    await redis.ping();
    return true;
  } catch {
    return false;
  }
};
