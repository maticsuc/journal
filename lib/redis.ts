import Redis from "ioredis";

let redis: Redis | null = null;
let redisUnavailable = false;

export function getRedis(): Redis | null {
  if (redisUnavailable) {
    return null;
  }

  if (redis) return redis;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    redisUnavailable = true;
    return null;
  }

  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      retryStrategy(times) {
        if (times > 1) return null;
        return Math.min(times * 50, 1000);
      },
      reconnectOnError(err) {
        const targetError = "READONLY";
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
    });

    redis.on("error", (err) => {
      console.error("Redis error:", err);
      redisUnavailable = true;
    });
  } catch (error) {
    console.warn("Failed to initialize Redis:", error);
    redisUnavailable = true;
    return null;
  }

  return redis;
}

export function closeRedis() {
  if (redis) {
    redis.disconnect();
    redis = null;
  }
}

export default getRedis;
