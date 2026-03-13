// Redis Cache Service
import { redis } from '../db/redis.js';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_TTL = 3600; // 1 hour

export interface CacheOptions {
  ttl?: number;
}

export const cacheService = {
  // Set value in cache
  set: async (key: string, value: unknown, options?: CacheOptions): Promise<boolean> => {
    try {
      const ttl = options?.ttl || DEFAULT_TTL;
      const serialized = JSON.stringify(value);
      
      if (ttl > 0) {
        await redis.setex(key, ttl, serialized);
      } else {
        await redis.set(key, serialized);
      }
      
      console.log(`Cache SET: ${key}`);
      return true;
    } catch (error) {
      console.error('Cache SET error:', error);
      return false;
    }
  },

  // Get value from cache
  get: async (key: string): Promise<unknown> => {
    try {
      const value = await redis.get(key);
      if (value) {
        console.log(`Cache HIT: ${key}`);
        return JSON.parse(value);
      }
      console.log(`Cache MISS: ${key}`);
      return null;
    } catch (error) {
      console.error('Cache GET error:', error);
      return null;
    }
  },

  // Delete key from cache
  delete: async (key: string): Promise<boolean> => {
    try {
      await redis.del(key);
      console.log(`Cache DELETE: ${key}`);
      return true;
    } catch (error) {
      console.error('Cache DELETE error:', error);
      return false;
    }
  },

  // Clear all cache
  clear: async (): Promise<boolean> => {
    try {
      await redis.flushall();
      console.log('Cache CLEARED');
      return true;
    } catch (error) {
      console.error('Cache CLEAR error:', error);
      return false;
    }
  },

  // Check if key exists
  exists: async (key: string): Promise<boolean> => {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache EXISTS error:', error);
      return false;
    }
  }
};
