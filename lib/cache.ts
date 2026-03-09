import { getRedis } from "./redis";

interface JournalEntry {
  filename: string;
  date: string;
  title: string;
  text: string;
  categories: string[];
  timestamp: number;
  pinned: boolean;
}

// Cache key constants
export const CACHE_KEYS = {
  JOURNALS_LIST: "journals:list",
} as const;

// Cache TTL (time-to-live) in seconds - 5 minutes
export const CACHE_TTL = 300;

/**
 * Get cached journals list
 * Returns null if not in cache, allowing fallback to database
 */
export async function getCachedJournals(): Promise<JournalEntry[] | null> {
  try {
    const redis = getRedis();
    const cached = await redis.get(CACHE_KEYS.JOURNALS_LIST);

    if (cached) {
      return JSON.parse(cached);
    }

    return null;
  } catch (error) {
    // If Redis is unavailable, just return null and fall back to DB
    console.warn("Cache retrieval failed:", error);
    return null;
  }
}

/**
 * Set journals list in cache with TTL
 */
export async function setCachedJournals(data: JournalEntry[]): Promise<void> {
  try {
    const redis = getRedis();
    await redis.setex(
      CACHE_KEYS.JOURNALS_LIST,
      CACHE_TTL,
      JSON.stringify(data)
    );
  } catch (error) {
    // If Redis fails, continue without caching
    console.warn("Cache write failed:", error);
  }
}

/**
 * Invalidate journals cache
 * Called when journals are created, updated, or deleted
 */
export async function invalidateJournalsCache(): Promise<void> {
  try {
    const redis = getRedis();
    await redis.del(CACHE_KEYS.JOURNALS_LIST);
  } catch (error) {
    console.warn("Cache invalidation failed:", error);
  }
}
