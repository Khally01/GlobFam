import { createClient } from 'redis';
import { logger } from '../utils/logger';

let redisClient: ReturnType<typeof createClient> | null = null;

// Only initialize Redis if REDIS_URL is provided
if (process.env.REDIS_URL) {
  redisClient = createClient({
    url: process.env.REDIS_URL,
  });

  redisClient.on('error', (err) => {
    logger.error('Redis Client Error', err);
  });

  redisClient.on('connect', () => {
    logger.info('Redis Client Connected');
  });
} else {
  logger.warn('Redis URL not provided. Running without Redis cache.');
}

export async function initializeRedis() {
  if (redisClient) {
    try {
      await redisClient.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      // Don't exit on Redis failure - allow app to run without cache
      logger.warn('Continuing without Redis cache');
    }
  }
}

// Export a wrapper that checks if Redis is available
export const redis = {
  get: async (key: string) => {
    if (!redisClient?.isOpen) return null;
    try {
      return await redisClient.get(key);
    } catch (error) {
      logger.error('Redis get error:', error);
      return null;
    }
  },
  set: async (key: string, value: string, options?: any) => {
    if (!redisClient?.isOpen) return;
    try {
      await redisClient.set(key, value, options);
    } catch (error) {
      logger.error('Redis set error:', error);
    }
  },
  del: async (key: string) => {
    if (!redisClient?.isOpen) return;
    try {
      await redisClient.del(key);
    } catch (error) {
      logger.error('Redis del error:', error);
    }
  },
};

export { redisClient };