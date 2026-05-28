import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  memory: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  database?: {
    status: 'connected' | 'disconnected' | 'error';
    latency?: number;
    error?: string;
  };
  dependencies?: {
    name: string;
    status: 'up' | 'down';
    latency?: number;
    error?: string;
  }[];
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime: number;

  constructor(private readonly prisma: PrismaService) {
    this.startTime = Date.now();
  }

  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  async checkDetailedHealth(): Promise<HealthStatus> {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    let dbStatus: HealthStatus['database'] = {
      status: 'disconnected',
    };

    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - start;

      dbStatus = {
        status: 'connected',
        latency,
      };
    } catch (error) {
      dbStatus = {
        status: 'error',
        error: error.message,
      };
    }

    const overallStatus = dbStatus.status === 'connected' ? 'healthy' : 'degraded';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime,
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024),
      },
      database: dbStatus,
    };
  }

  async checkDatabaseHealth(): Promise<object> {
    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - start;

      return {
        status: 'healthy',
        database: 'PostgreSQL',
        latency: `${latency}ms`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return {
        status: 'unhealthy',
        database: 'PostgreSQL',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async checkReadiness(): Promise<object> {
    const dbHealthy = await this.checkDatabaseHealth();
    const isDbHealthy = (dbHealthy as any).status === 'healthy';

    return {
      ready: isDbHealthy,
      checks: {
        database: isDbHealthy ? 'up' : 'down',
      },
      timestamp: new Date().toISOString(),
    };
  }
}
