import Redis from "ioredis";

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (redis) return redis;

  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
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
  });

  redis.on("connect", () => {
    console.log("Redis connected");
  });

  return redis;
}

export function closeRedis() {
  if (redis) {
    redis.disconnect();
    redis = null;
  }
}

export default getRedis;
