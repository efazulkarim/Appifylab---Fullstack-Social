import { Redis } from "@upstash/redis";
import { env } from "./env.js";

export interface ICacheClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, exSeconds: number): Promise<void>;
  zadd(key: string, score: number, member: string): Promise<void>;
  zrevrange(key: string, start: number, stop: number): Promise<string[]>;
  zremrangebyrank(key: string, start: number, stop: number): Promise<void>;
  del(key: string): Promise<void>;
}

// In-Memory Fallback Implementation simulating Redis Sorted Sets (ZSET) and KV
class InMemoryCacheClient implements ICacheClient {
  private kv = new Map<string, { value: string; expiresAt: number }>();
  private zsets = new Map<string, { score: number; member: string }[]>();

  async get(key: string): Promise<string | null> {
    const entry = this.kv.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.kv.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, exSeconds: number): Promise<void> {
    this.kv.set(key, {
      value,
      expiresAt: Date.now() + exSeconds * 1000,
    });
  }

  async zadd(key: string, score: number, member: string): Promise<void> {
    let list = this.zsets.get(key) || [];
    // Remove existing member duplicate
    list = list.filter((item) => item.member !== member);
    list.push({ score, member });
    // Sort descending by score
    list.sort((a, b) => b.score - a.score);
    this.zsets.set(key, list);
  }

  async zrevrange(key: string, start: number, stop: number): Promise<string[]> {
    const list = this.zsets.get(key) || [];
    // zrevrange is 0-indexed inclusive.
    // If stop is -1, it means return all items from start.
    const end = stop === -1 ? undefined : stop + 1;
    return list.slice(start, end).map((item) => item.member);
  }

  async zremrangebyrank(key: string, start: number, stop: number): Promise<void> {
    let list = this.zsets.get(key) || [];
    // rank in Redis Sorted Set: 0 is lowest score, list.length - 1 is highest score.
    // However, since we stored sorted descending (index 0 is highest score), we adjust rank logic:
    // Standard ZREMRANGEBYRANK start stop:
    // e.g. ZREMRANGEBYRANK key 0 -501. This keeps the highest 500 scores (ranks from length-500 to length-1).
    // In our descending sorted array, the elements to remove are those at indices >= 500 (lower scores).
    // So we can keep only the first 500 items if they run LTRIM-like operations.
    // Let's implement generic rank removal:
    const listWithRanks = list.map((item, idx) => ({
      item,
      // Rank in ascending order (0 is lowest score, which is at the end of our descending sorted list)
      rank: list.length - 1 - idx,
    }));
    
    // Filter out items whose rank is within the range [start, stop]
    const resolvedStart = start < 0 ? list.length + start : start;
    const resolvedStop = stop < 0 ? list.length + stop : stop;
    
    list = listWithRanks
      .filter(({ rank }) => rank < resolvedStart || rank > resolvedStop)
      .map(({ item }) => item);
      
    this.zsets.set(key, list);
  }

  async del(key: string): Promise<void> {
    this.kv.delete(key);
    this.zsets.delete(key);
  }
}

class UpstashRedisClient implements ICacheClient {
  private client: Redis;

  constructor(url: string, token: string) {
    this.client = new Redis({ url, token });
  }

  async get(key: string): Promise<string | null> {
    return this.client.get<string>(key);
  }

  async set(key: string, value: string, exSeconds: number): Promise<void> {
    await this.client.set(key, value, { ex: exSeconds });
  }

  async zadd(key: string, score: number, member: string): Promise<void> {
    await this.client.zadd(key, { score, member });
  }

  async zrevrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.client.zrange(key, start, stop, { rev: true });
  }

  async zremrangebyrank(key: string, start: number, stop: number): Promise<void> {
    await this.client.zremrangebyrank(key, start, stop);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
}

// Instantiate client based on environment variables
export const cache: ICacheClient = (() => {
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    console.log("Redis Cache: Using Upstash Redis REST Client");
    return new UpstashRedisClient(env.UPSTASH_REDIS_REST_URL, env.UPSTASH_REDIS_REST_TOKEN);
  } else {
    console.log("Redis Cache: Using In-Memory Fallback Client");
    return new InMemoryCacheClient();
  }
})();
