import { PrismaClient } from '@/generated/prisma';
import { Prisma } from '@/generated/prisma';

/**
 * Performance threshold in milliseconds for slow queries
 * Any query taking longer than this will be logged as slow
 */
const SLOW_QUERY_THRESHOLD_MS = 500;

/**
 * Creates a Prisma middleware for query performance monitoring
 * @returns Prisma middleware function
 */
export function createQueryMonitoringMiddleware() {
  return async (
    params: Prisma.MiddlewareParams,
    next: (params: Prisma.MiddlewareParams) => Promise<any>
  ) => {
    const startTime = performance.now();
    const modelName = params.model;
    const action = params.action;
    const query = `${modelName}.${action}`;

    try {
      const result = await next(params);
      const duration = performance.now() - startTime;
      
      // Log slow queries
      if (duration > SLOW_QUERY_THRESHOLD_MS) {
        console.warn(
          `[DB SLOW QUERY] ${query} - ${Math.round(duration)}ms`,
          JSON.stringify({
            params: params.args,
            duration: Math.round(duration),
            timestamp: new Date().toISOString(),
          })
        );
      }
      
      return result;
    } catch (error) {
      // Log query errors with more detail
      console.error(
        `[DB ERROR] ${query} - ${(error as Error).message}`,
        JSON.stringify({
          params: params.args,
          error: (error as Error).message,
          timestamp: new Date().toISOString(),
        })
      );
      throw error;
    }
  };
}

/**
 * Creates a monitored Prisma client instance with performance tracking
 * @returns PrismaClient with monitoring middleware
 */
export function createMonitoredPrismaClient(): PrismaClient {
  const prisma = new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'stdout',
        level: 'error',
      },
      {
        emit: 'stdout',
        level: 'warn',
      },
    ],
  });

  // Add query monitoring middleware
  prisma.$use(createQueryMonitoringMiddleware());

  // Listen for query events
  prisma.$on('query', (e) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DB QUERY] ${e.query} - ${e.duration}ms`);
    }
  });

  return prisma;
}

/**
 * Utility to log database statistics for monitoring
 * @param prisma PrismaClient instance
 */
export async function logDatabaseStats(prisma: PrismaClient) {
  try {
    const [userCount, workspaceCount, tableCount, formulaCount] = await Promise.all([
      prisma.user.count(),
      prisma.workspace.count(),
      prisma.dataTable.count(),
      prisma.formula.count(),
    ]);

    console.log(`[DB STATS] Users: ${userCount}, Workspaces: ${workspaceCount}, Tables: ${tableCount}, Formulas: ${formulaCount}`);
  } catch (error) {
    console.error(`[DB STATS ERROR] Failed to get database statistics: ${(error as Error).message}`);
  }
} 