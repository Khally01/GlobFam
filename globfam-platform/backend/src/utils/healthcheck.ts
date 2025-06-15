import { prisma } from '../config/database';
import { redisClient } from '../config/redis';
import { logger } from './logger';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  environment: string;
  services: {
    database: {
      status: 'up' | 'down';
      message?: string;
    };
    redis: {
      status: 'up' | 'down';
      message?: string;
    };
  };
  version?: string;
}

export async function performHealthCheck(): Promise<HealthCheckResult> {
  const result: HealthCheckResult = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    services: {
      database: { status: 'down' },
      redis: { status: 'down' },
    },
    version: process.env.npm_package_version,
  };

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    result.services.database.status = 'up';
  } catch (error) {
    result.services.database.status = 'down';
    result.services.database.message = error instanceof Error ? error.message : 'Unknown error';
    result.status = 'unhealthy';
    logger.error('Database health check failed:', error);
  }

  // Check Redis (if available)
  try {
    if (redisClient && redisClient.isOpen) {
      await redisClient.ping();
      result.services.redis.status = 'up';
    } else if (!process.env.REDIS_URL) {
      result.services.redis.status = 'up';
      result.services.redis.message = 'Redis not configured (optional)';
    } else {
      throw new Error('Redis configured but not connected');
    }
  } catch (error) {
    result.services.redis.status = 'down';
    result.services.redis.message = error instanceof Error ? error.message : 'Unknown error';
    // Don't mark as unhealthy if Redis is optional
    if (process.env.REDIS_URL) {
      result.status = 'unhealthy';
    }
    logger.error('Redis health check failed:', error);
  }

  return result;
}