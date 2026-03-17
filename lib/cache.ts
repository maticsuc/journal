import { getRedis } from "./redis";

interface JournalEntry {
  id: number;
  date: string;
  title: string;
  text: string;
  categories: string[];
  pinned: boolean;
  created_at: string;
}

// Cache key constants
export const CACHE_KEYS = {
  JOURNALS_LIST: "journals:list",
} as const;

export const CACHE_TTL = 300;

export async function getCachedJournals(): Promise<JournalEntry[] | null> {
  try {
    const redis = getRedis();
    if (!redis) {
      return null;
    }

    const cached = await redis.get(CACHE_KEYS.JOURNALS_LIST);

    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.warn("Cache retrieval failed:", error);
    return null;
  }
}

export async function setCachedJournals(data: JournalEntry[]): Promise<void> {
  try {
    const redis = getRedis();
    if (!redis) return;

    await redis.setex(
      CACHE_KEYS.JOURNALS_LIST,
      CACHE_TTL,
      JSON.stringify(data)
    );
  } catch (error) {
    console.warn("Cache write failed:", error);
  }
}

export async function invalidateJournalsCache(): Promise<void> {
  try {
    const redis = getRedis();
    if (!redis) return;

    await redis.del(CACHE_KEYS.JOURNALS_LIST);
  } catch (error) {
    console.warn("Cache invalidation failed:", error);
  }
}
