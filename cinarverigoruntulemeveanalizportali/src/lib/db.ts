import { PrismaClient } from '../generated/prisma';
import { createQueryMonitoringMiddleware, logDatabaseStats } from './monitoring/db-monitoring';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more: 
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = globalThis as unknown as { 
  prisma: PrismaClient;
  prismaInitialized: boolean;
};

const createPrismaClient = () => {
  const client = new PrismaClient({
    log: [
      { emit: 'stdout', level: 'error' },
      { emit: 'stdout', level: 'warn' },
    ],
  });
  
  // Add query monitoring middleware
  client.$use(createQueryMonitoringMiddleware());
  
  return client;
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  
  // Log database statistics on initialization (only once)
  if (!globalForPrisma.prismaInitialized) {
    globalForPrisma.prismaInitialized = true;
    
    // Log database stats in development mode
    if (process.env.NODE_ENV === 'development') {
      logDatabaseStats(prisma).catch(err => {
        console.error('Failed to log database statistics:', err);
      });
    }
  }
}

export default prisma; 